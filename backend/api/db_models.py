# TABLES:
#   1. prediction_history  — saves every user prediction action
#   2. product_summaries   — pre-computed sentiment summary per product
#
# NOTE:
#   These are the DATABASE models (SQLAlchemy).
#   The API request/response shapes live in models.py (Pydantic).
# ============================================================

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from api.database import Base


# ── Table 1: Prediction History ───────────────────────────────
# Stores every comment the user submits for sentiment analysis.
# Powers the "history" page in the web app.
class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id           = Column(Integer, primary_key=True, index=True, autoincrement=True)
    input_text   = Column(Text,    nullable=False)       # Raw text the user typed
    cleaned_text = Column(Text,    nullable=True)        # After Persian preprocessing
    sentiment    = Column(String,  nullable=False)       # positive / neutral / negative
    confidence   = Column(Float,   nullable=False)       # Sigmoid-normalised score 0-1
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


# ── Table 2: Product Summaries ────────────────────────────────
# Pre-computed sentiment breakdown and summary per product.
# Computed from the CSV data via the /products/{id} endpoint
# and cached here so repeated requests are instant.
class ProductSummary(Base):
    __tablename__ = "product_summaries"

    product_id      = Column(Integer, primary_key=True, index=True)
    title           = Column(String,  nullable=True)
    category        = Column(String,  nullable=True)
    brand           = Column(String,  nullable=True)
    avg_rate        = Column(Float,   nullable=True)

    # Sentiment counts
    total_comments  = Column(Integer, default=0)
    positive_count  = Column(Integer, default=0)
    neutral_count   = Column(Integer, default=0)
    negative_count  = Column(Integer, default=0)

    # Sentiment percentages
    positive_pct    = Column(Float,   default=0.0)
    neutral_pct     = Column(Float,   default=0.0)
    negative_pct    = Column(Float,   default=0.0)

    # Extractive summary of comment bodies
    ai_summary   = Column(Text, nullable=True)
    ai_pros      = Column(JSON, nullable=True)
    ai_cons      = Column(JSON, nullable=True)
    ai_sentiment = Column(String, nullable=True)

    last_updated    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())