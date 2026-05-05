from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn

from .model_service import SentimentAnalyzer

app = FastAPI(
    title="Digikala Sentiment Analysis API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Loading Model
analyzer = SentimentAnalyzer()


class PredictRequest(BaseModel):
    text: str = Field(..., description="Comment Context")
    rating: Optional[float] = Field(None, ge=1, le=5, description="Product Rate")
    helpful_count: Optional[int] = Field(None, ge=0, description="Like Count")
    product_popularity: Optional[float] = Field(None, ge=0, description="Product Popularity")


class BatchPredictRequest(BaseModel):
    items: List[PredictRequest]


class PredictResponse(BaseModel):
    text: str
    sentiment: str
    confidence: dict
    features_used: dict


@app.get("/")
async def root():
    return {
        "message": "Digikala Sentiment Analysis API",
        "status": "running",
        "endpoints": ["/predict", "/predict_batch", "/health"]
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": analyzer.model is not None,
        "vectorizer_loaded": analyzer.vectorizer is not None
    }


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    try:
        result = analyzer.predict(
            text=request.text,
            rating=request.rating,
            helpful_count=request.helpful_count,
            product_popularity=request.product_popularity
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict_batch")
async def predict_batch(request: BatchPredictRequest):
    try:
        results = []
        for item in request.items:
            result = analyzer.predict(
                text=item.text,
                rating=item.rating,
                helpful_count=item.helpful_count,
                product_popularity=item.product_popularity
            )
            results.append(result)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
