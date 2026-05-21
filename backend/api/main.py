from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.database import init_db
from api.routers import sentiment, history, products


# ── Lifespan: runs on startup & shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables if they don't exist
    await init_db()
    yield
    # Shutdown: nothing to clean up for SQLite


app = FastAPI(
    title="Digikala Sentiment Analysis API",
    description="Persian comment sentiment classifier — positive / neutral / negative",
    version="2.0.0",
    lifespan=lifespan
)

# ── CORS ─────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────
app.include_router(sentiment.router)
app.include_router(history.router)
app.include_router(products.router)


# ── Root endpoints ───────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Digikala Sentiment API v2.0 is running"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}