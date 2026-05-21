from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

from api.database import get_db
from api.db_models import PredictionHistory
from api.models import PredictionHistoryResponse, PredictionHistoryList, HistoryStats

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=PredictionHistoryList)
async def get_history(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    sentiment: str = Query(None, description="Filter by sentiment: positive, neutral, negative"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated prediction history, newest first.
    Optionally filter by sentiment label.
    """
    # Base query
    query       = select(PredictionHistory).order_by(PredictionHistory.created_at.desc())
    count_query = select(func.count()).select_from(PredictionHistory)

    # Optional sentiment filter
    if sentiment:
        if sentiment not in ["positive", "neutral", "negative"]:
            raise HTTPException(status_code=400, detail="sentiment must be: positive, neutral, or negative")
        query       = query.where(PredictionHistory.sentiment == sentiment)
        count_query = count_query.where(PredictionHistory.sentiment == sentiment)

    # Get total count
    total_result = await db.execute(count_query)
    total        = total_result.scalar()

    # Apply pagination
    offset = (page - 1) * size
    query  = query.offset(offset).limit(size)

    result  = await db.execute(query)
    records = result.scalars().all()

    return {
        "total":   total,
        "page":    page,
        "size":    size,
        "results": records
    }


@router.get("/stats", response_model=HistoryStats)
async def get_history_stats(db: AsyncSession = Depends(get_db)):
    """
    Get overall stats about all predictions made so far.
    Powers the summary cards on the history page.
    """
    # Count per sentiment
    result = await db.execute(
        select(
            func.count().label("total"),
            func.sum((PredictionHistory.sentiment == "positive").cast(int)).label("positive"),
            func.sum((PredictionHistory.sentiment == "neutral").cast(int)).label("neutral"),
            func.sum((PredictionHistory.sentiment == "negative").cast(int)).label("negative"),
        )
    )
    row = result.fetchone()

    total    = row.total or 0
    positive = row.positive or 0
    neutral  = row.neutral or 0
    negative = row.negative or 0

    return {
        "total":          total,
        "positive_count": positive,
        "neutral_count":  neutral,
        "negative_count": negative,
        "positive_pct":   round(positive / total * 100, 2) if total > 0 else 0,
        "neutral_pct":    round(neutral  / total * 100, 2) if total > 0 else 0,
        "negative_pct":   round(negative / total * 100, 2) if total > 0 else 0,
    }


@router.get("/{prediction_id}", response_model=PredictionHistoryResponse)
async def get_single_prediction(prediction_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a single prediction by its ID.
    """
    result = await db.execute(
        select(PredictionHistory).where(PredictionHistory.id == prediction_id)
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail=f"Prediction {prediction_id} not found")

    return record


@router.delete("/{prediction_id}")
async def delete_prediction(prediction_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete a prediction from history by ID.
    """
    result = await db.execute(
        select(PredictionHistory).where(PredictionHistory.id == prediction_id)
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail=f"Prediction {prediction_id} not found")

    await db.execute(delete(PredictionHistory).where(PredictionHistory.id == prediction_id))
    await db.commit()

    return {"message": f"Prediction {prediction_id} deleted successfully"}