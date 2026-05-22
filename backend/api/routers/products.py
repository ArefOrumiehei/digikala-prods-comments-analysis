from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import pandas as pd
from pathlib import Path

from api.database import get_db
from api.db_models import ProductSummary
from api.predictor import predict, summarize_comments
from api.models import (
    ProductSummaryResponse,
    ProductCommentsResponse,
    ProductSearchResult,
    CommentItem,
)

router = APIRouter(prefix="/products", tags=["Products"])

# ── Load CSV once at startup ──────────────────────────────────
BASE_DIR      = Path(__file__).resolve().parent.parent.parent.parent
PROCESSED_CSV = BASE_DIR / "data" / "processed" / "sentiment_analysis" / "preprocessed_data.csv"

try:
    print(f"Loading product data from: {PROCESSED_CSV}")
    _df = pd.read_csv(PROCESSED_CSV, encoding="utf-8-sig", low_memory=False)
    if "sentiment" in _df.columns:
        _df["sentiment"] = (
            _df["sentiment"]
            .astype(str)
            .str.strip()
            .str.lower()
            .replace("nan", None)
        )

    if "rate" in _df.columns:
        _df["rate"] = pd.to_numeric(_df["rate"], errors="coerce")

    print(f"✓ Loaded {len(_df):,} records for product API")
except FileNotFoundError:
    print(f"⚠ Warning: Could not find {PROCESSED_CSV}")
    _df = pd.DataFrame()


# ── Helper: compute avg_rate from comment rates ───────────────
def _avg_rate(product_df: pd.DataFrame) -> float | None:
    rates = pd.to_numeric(product_df["rate"], errors="coerce").dropna()
    if rates.empty:
        return None
    return round(float(rates.mean()), 2)


# ── Helper: compute full product summary ──────────────────────
def _compute_summary(product_id: int) -> dict | None:
    if _df.empty:
        return None

    product_df = _df[_df["product_id"] == product_id].copy()
    if product_df.empty:
        return None

    first_row = product_df.iloc[0]
    title    = str(first_row.get("title_fa", "") or first_row.get("title", "") or "")
    category = str(first_row.get("Category1", "") or "")
    brand    = str(first_row.get("Brand", "") or "")
    avg_rate = _avg_rate(product_df)

    if "sentiment" in product_df.columns:
        sentiments = product_df["sentiment"].dropna().tolist()
    else:
        sentiments = [
            predict(str(text))["sentiment"]
            for text in product_df["full_text_cleaned"].fillna("").tolist()
            if str(text).strip()
        ]

    total    = len(sentiments)
    positive = sentiments.count("positive")
    neutral  = sentiments.count("neutral")
    negative = sentiments.count("negative")

    bodies     = product_df["body"].dropna().astype(str).tolist()
    ai_summary = summarize_comments(bodies, top_n=5)

    return {
        "product_id":     product_id,
        "title":          title,
        "category":       category,
        "brand":          brand,
        "avg_rate":       avg_rate,
        "total_comments": total,
        "positive_count": positive,
        "neutral_count":  neutral,
        "negative_count": negative,
        "positive_pct":   round(positive / total * 100, 2) if total > 0 else 0.0,
        "neutral_pct":    round(neutral  / total * 100, 2) if total > 0 else 0.0,
        "negative_pct":   round(negative / total * 100, 2) if total > 0 else 0.0,
        "ai_summary":     ai_summary,
    }


# ── Endpoints ─────────────────────────────────────────────────

@router.get("/search")
async def search_products(
    q:    str = Query(..., min_length=1, description="Search by name, brand or category"),
    page: int = Query(1,  ge=1,          description="Page number"),
    size: int = Query(10, ge=1, le=50,   description="Results per page"),
):
    if _df.empty:
        raise HTTPException(status_code=503, detail="Product data not available")

    q_lower = q.lower().strip()

    mask = (
        _df["title_fa"].astype(str).str.lower().str.contains(q_lower, na=False)
        | _df["Brand"].astype(str).str.lower().str.contains(q_lower, na=False)
        | _df["Category1"].astype(str).str.lower().str.contains(q_lower, na=False)
    )

    matched = (
        _df[mask]
        .drop_duplicates(subset="product_id")
        .reset_index(drop=True)
    )

    total  = len(matched)
    offset = (page - 1) * size
    paged  = matched.iloc[offset : offset + size]

    results = []
    for _, row in paged.iterrows():
        product_df = _df[_df["product_id"] == row["product_id"]]
        results.append({
            "product_id":     int(row["product_id"]),
            "title":          str(row.get("title_fa", "") or row.get("title", "") or ""),
            "category":       str(row.get("Category1", "") or ""),
            "brand":          str(row.get("Brand", "") or ""),
            "avg_rate":       _avg_rate(product_df),
            "total_comments": len(product_df),
        })

    return {
        "total":   total,
        "page":    page,
        "size":    size,
        "results": results,
    }


@router.get("/{product_id}", response_model=ProductSummaryResponse)
async def get_product_summary(
    product_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get full sentiment summary for a product.
    Checks DB cache first; computes and caches on first request.
    """
    result = await db.execute(
        select(ProductSummary).where(ProductSummary.product_id == product_id)
    )
    cached = result.scalar_one_or_none()
    if cached:
        return cached

    summary = _compute_summary(product_id)
    if not summary:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    db_summary = ProductSummary(**summary)
    db.add(db_summary)
    await db.commit()
    await db.refresh(db_summary)

    return db_summary


@router.get("/{product_id}/comments", response_model=ProductCommentsResponse)
async def get_product_comments(
    product_id: int,
    page:      int = Query(1,    ge=1),
    size:      int = Query(10,   ge=1, le=100),
    sentiment: str = Query(None, description="Filter: positive | neutral | negative"),
):
    if _df.empty:
        raise HTTPException(status_code=503, detail="Product data not available")

    product_df = _df[_df["product_id"] == product_id].copy()
    if product_df.empty:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    if sentiment:
        sentiment_clean = sentiment.strip().lower()
        if sentiment_clean not in ("positive", "neutral", "negative"):
            raise HTTPException(
                status_code=400,
                detail="sentiment must be: positive, neutral, or negative",
            )
        if "sentiment" in product_df.columns:
            product_df = product_df[
                product_df["sentiment"] == sentiment_clean
            ]

    total   = len(product_df)
    offset  = (page - 1) * size
    page_df = product_df.iloc[offset : offset + size]
    comments = []
    for idx, (_, row) in enumerate(page_df.iterrows()):
        raw_label = row.get("sentiment")
        if 'sentiment' in row and pd.notna(row['sentiment']):
            sentiment = row['sentiment']
            confidence = None
        else:
            pred_result = predict(str(row.get('full_text_cleaned', '')))
            sentiment = pred_result['sentiment']
            confidence = pred_result['confidence']

        comments.append(
            CommentItem(
                id         = int(row["id_comment"]) if pd.notna(row.get("id_comment")) else idx,
                body       = str(row["body"]) if pd.notna(row.get("body")) else None,
                sentiment  = sentiment,
                confidence = confidence,
                rate       = float(row["rate"]) if pd.notna(row.get("rate")) else None,  # FIX #2
                created_at = str(row["created_at"]) if pd.notna(row.get("created_at")) else None,
            )
        )

    return ProductCommentsResponse(
        product_id = product_id,
        total      = total,
        page       = page,
        size       = size,
        comments   = comments,
    )