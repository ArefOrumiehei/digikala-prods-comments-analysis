from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ── Sentiment Prediction ──────────────────────────────────────
class CommentRequest(BaseModel):
    text: str

class BatchRequest(BaseModel):
    texts: list[str]

class SentimentResponse(BaseModel):
    sentiment:    str
    confidence:   float
    cleaned_text: str

class BatchResponse(BaseModel):
    results: list[SentimentResponse]


# ── Prediction History ────────────────────────────────────────
class PredictionHistoryResponse(BaseModel):
    id:           int
    input_text:   str
    cleaned_text: Optional[str]
    sentiment:    str
    confidence:   float
    created_at:   datetime

    class Config:
        from_attributes = True 

class PredictionHistoryList(BaseModel):
    total:   int
    page:    int
    size:    int
    results: list[PredictionHistoryResponse]

class HistoryStats(BaseModel):
    total:          int
    positive_count: int
    neutral_count:  int
    negative_count: int
    positive_pct:   float
    neutral_pct:    float
    negative_pct:   float


# ── Product ───────────────────────────────────────────────────
class CommentItem(BaseModel):
    """Single comment row returned in the product comments list."""
    id:          Optional[int]
    body:        Optional[str]
    sentiment:   Optional[str]
    confidence:  Optional[float]
    rate:        Optional[float]
    created_at:  Optional[str]

class ProductSummaryResponse(BaseModel):
    """Full product page response — info + sentiment breakdown + summary."""
    product_id:     int
    title:          Optional[str]
    category:       Optional[str]
    brand:          Optional[str]
    avg_rate:       Optional[float]

    total_comments: int
    positive_count: int
    neutral_count:  int
    negative_count: int
    positive_pct:   float
    neutral_pct:    float
    negative_pct:   float

    ai_summary:     Optional[str]
    last_updated:   Optional[datetime]

    class Config:
        from_attributes = True

class ProductCommentsResponse(BaseModel):
    """Paginated list of comments for a product."""
    product_id: int
    total:      int
    page:       int
    size:       int
    comments:   list[CommentItem]

class ProductSearchResult(BaseModel):
    """Lightweight product card for search results."""
    product_id:     int
    title:          Optional[str]
    category:       Optional[str]
    brand:          Optional[str]
    avg_rate:       Optional[float]
    total_comments: Optional[int]