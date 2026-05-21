from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import CommentRequest, BatchRequest, SentimentResponse, BatchResponse
from api.predictor import predict
from api.database import get_db
from api.db_models import PredictionHistory

router = APIRouter(prefix="/sentiment", tags=["Sentiment"])

@router.post("/predict", response_model=SentimentResponse)
async def predict_single(req: CommentRequest, db: AsyncSession = Depends(get_db)):
    """
    Predict sentiment for a single Persian comment.
    Saves the result to prediction_history table automatically.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    result = predict(req.text)

    # Save to DB history
    history_entry = PredictionHistory(
        input_text=req.text,
        cleaned_text=result["cleaned_text"],
        sentiment=result["sentiment"],
        confidence=result["confidence"]
    )
    db.add(history_entry)
    await db.commit()

    return result


@router.post("/predict-batch", response_model=BatchResponse)
async def predict_batch(req: BatchRequest):
    """
    Predict sentiment for multiple comments at once (max 100).
    Batch predictions are NOT saved to history.
    """
    if not req.texts:
        raise HTTPException(status_code=400, detail="texts list cannot be empty")
    if len(req.texts) > 100:
        raise HTTPException(status_code=400, detail="Max 100 texts per batch")

    results = [predict(t) for t in req.texts]
    return {"results": results}