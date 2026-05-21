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
    CommentItem
)

router = APIRouter(prefix="/products", tags=["Products"])

# ── Load CSV data once at startup
# We load the preprocessed CSV into memory once.
BASE_DIR      = Path(__file__).resolve().parent.parent.parent.parent
PROCESSED_CSV = BASE_DIR / "data" / "processed" / "sentiment_analysis" / "preprocessed_data.csv"

try:
    print(f"Loading product data from: {PROCESSED_CSV}")
    _df = pd.read_csv(PROCESSED_CSV, encoding='utf-8-sig', low_memory=False)
    print(f"✓ Loaded {len(_df):,} records for product API")
except FileNotFoundError:
    print(f"⚠ Warning: Could not find {PROCESSED_CSV}")
    _df = pd.DataFrame()


# ── Helper: compute product summary from CSV
def _compute_summary(product_id: int) -> dict | None:
    """
    Compute sentiment summary for a product from the CSV data.
    Runs predictions on all comments for the product and summarizes bodies.
    Returns None if product not found.
    """
    if _df.empty:
        return None

    # Filter comments for this product
    product_df = _df[_df['product_id'] == product_id].copy()

    if product_df.empty:
        return None

    # Get product info from first row
    first_row = product_df.iloc[0]
    title     = str(first_row.get('title_fa', '')) or str(first_row.get('title', ''))
    category  = str(first_row.get('Category1', ''))
    brand     = str(first_row.get('Brand', ''))
    avg_rate  = float(first_row.get('Rate', 0) or 0)

    # Use pre-computed sentiment labels if available
    # Otherwise run predictions (slower but works)
    if 'sentiment_label' in product_df.columns:
        sentiments = product_df['sentiment_label'].dropna().tolist()
    else:
        sentiments = [
            predict(str(text))['sentiment']
            for text in product_df['full_text_cleaned'].fillna('').tolist()
            if str(text).strip()
        ]

    total    = len(sentiments)
    positive = sentiments.count('positive')
    neutral  = sentiments.count('neutral')
    negative = sentiments.count('negative')

    # Extractive summary of comment bodies
    bodies     = product_df['body'].dropna().astype(str).tolist()
    bodies_summary = summarize_comments(bodies, top_n=5)

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
        "positive_pct":   round(positive / total * 100, 2) if total > 0 else 0,
        "neutral_pct":    round(neutral  / total * 100, 2) if total > 0 else 0,
        "negative_pct":   round(negative / total * 100, 2) if total > 0 else 0,
        "ai_summary":     bodies_summary,
    }


# ── Endpoints ─────────────────────────────────────────────────
@router.get("/search", response_model=list[ProductSearchResult])
async def search_products(
    q: str = Query(..., min_length=1, description="Search by product name, brand, or category"),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Search products by name, brand, or category from the CSV data.
    Returns lightweight product cards.
    """
    if _df.empty:
        raise HTTPException(status_code=503, detail="Product data not available")

    q_lower = q.lower()

    # Search across title, brand, category columns
    mask = (
        _df['title_fa'].astype(str).str.lower().str.contains(q_lower, na=False) |
        _df['Brand'].astype(str).str.lower().str.contains(q_lower, na=False) |
        _df['Category1'].astype(str).str.lower().str.contains(q_lower, na=False)
    )

    matched = _df[mask].drop_duplicates(subset='product_id').head(limit)

    if matched.empty:
        return []

    results = []
    for _, row in matched.iterrows():
        product_comments = _df[_df['product_id'] == row['product_id']]
        results.append({
            "product_id":     int(row['product_id']),
            "title":          str(row.get('title_fa', '') or row.get('title', '')),
            "category":       str(row.get('Category1', '')),
            "brand":          str(row.get('Brand', '')),
            "avg_rate":       float(row.get('Rate', 0) or 0),
            "total_comments": len(product_comments)
        })

    return results


@router.get("/{product_id}", response_model=ProductSummaryResponse)
async def get_product_summary(product_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get full sentiment summary for a product.

    First checks the DB cache (product_summaries table).
    If not cached, computes from CSV and saves to DB for next time.
    """
    # ── Cache check ───────────────────────────────────────────
    result = await db.execute(
        select(ProductSummary).where(ProductSummary.product_id == product_id)
    )
    cached = result.scalar_one_or_none()

    if cached:
        return cached

    # ── Compute from CSV ──────────────────────────────────────
    summary = _compute_summary(product_id)

    if not summary:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    # ── Save to DB cache ──────────────────────────────────────
    db_summary = ProductSummary(**summary)
    db.add(db_summary)
    await db.commit()
    await db.refresh(db_summary)

    return db_summary


@router.get("/{product_id}/comments", response_model=ProductCommentsResponse)
async def get_product_comments(
    product_id: int,
    page: int  = Query(1, ge=1),
    size: int  = Query(10, ge=1, le=100),
    sentiment: str = Query(None, description="Filter by: positive, neutral, negative")
):
    """
    Get paginated comments for a product with their sentiment labels.
    Optionally filter by sentiment.
    """
    if _df.empty:
        raise HTTPException(status_code=503, detail="Product data not available")

    product_df = _df[_df['product_id'] == product_id].copy()

    if product_df.empty:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    # Optional sentiment filter
    if sentiment:
        if sentiment not in ["positive", "neutral", "negative"]:
            raise HTTPException(status_code=400, detail="sentiment must be: positive, neutral, or negative")
        if 'sentiment_label' in product_df.columns:
            product_df = product_df[product_df['sentiment_label'] == sentiment]

    total  = len(product_df)
    offset = (page - 1) * size
    page_df = product_df.iloc[offset: offset + size]

    comments = []
    for idx, (_, row) in enumerate(page_df.iterrows()):
        # Use pre-computed sentiment if available, otherwise predict
        if 'sentiment_label' in row and pd.notna(row['sentiment_label']):
            sentiment_label = row['sentiment_label']
            confidence      = None
        else:
            pred_result     = predict(str(row.get('full_text_cleaned', '')))
            sentiment_label = pred_result['sentiment']
            confidence      = pred_result['confidence']

        comments.append(CommentItem(
            id         = int(row.get('id_comment', idx)),
            body       = str(row.get('body', '')) if pd.notna(row.get('body')) else None,
            sentiment  = sentiment_label,
            confidence = confidence,
            rate       = float(row['rate']) if pd.notna(row.get('rate')) else None,
            created_at = str(row.get('created_at', '')) if pd.notna(row.get('created_at')) else None
        ))

    return {
        "product_id": product_id,
        "total":      total,
        "page":       page,
        "size":       size,
        "comments":   comments
    }