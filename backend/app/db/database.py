"""SQLAlchemy async engine and session factory."""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

# Convert postgres:// → postgresql+psycopg:// for async psycopg3
_raw_url = str(settings.DATABASE_URL)
if _raw_url.startswith("postgres://"):
    _raw_url = _raw_url.replace("postgres://", "postgresql+psycopg://", 1)
elif _raw_url.startswith("postgresql://"):
    _raw_url = _raw_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_async_engine(
    _raw_url,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


class Base(DeclarativeBase):
    """Shared declarative base for all SQLAlchemy models."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
