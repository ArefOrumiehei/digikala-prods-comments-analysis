from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

# ── Database file location ────────────────────────────────────
# Stored at backend/digikala_comments_sentiment.db — one level above api/
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{BASE_DIR}/digikala_comments_sentiment.db")

# ── Engine ────────────────────────────────────────────────────
# check_same_thread=False is required for SQLite with async
engine = create_async_engine(
    DATABASE_URL,
    echo=False,           # Set True to log all SQL queries (For debugging)
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# ── Session factory ───────────────────────────────────────────
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# ── Base class for all ORM models ────────────────────────────
class Base(DeclarativeBase):
    pass

# ── Dependency for FastAPI routes ─────────────────────────────
async def get_db() -> AsyncSession:
    """
    FastAPI dependency that provides a DB session per request.
    Usage in routers:
        async def my_endpoint(db: AsyncSession = Depends(get_db)):
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

# ── Create all tables ─────────────────────────────────────────
async def init_db():
    """
    Called once at app startup to create all tables if they
    don't exist yet. Safe to call multiple times.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Database tables created/verified")