"""SQLAlchemy async engine and session factory."""
from __future__ import annotations

import asyncio
import sys
from collections.abc import AsyncGenerator

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import get_settings

settings = get_settings()

# Convert postgres:// → postgresql+asyncpg:// for async asyncpg
_raw_url = str(settings.DATABASE_URL)
connect_args: dict[str, str] = {}
if _raw_url.startswith("postgres://"):
    _raw_url = _raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _raw_url.startswith("postgresql://"):
    _raw_url = _raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)

if "sslmode=require" in _raw_url:
    _raw_url = _raw_url.replace("?sslmode=require", "").replace("&sslmode=require", "")
    connect_args["ssl"] = "require"

is_testing = "pytest" in sys.modules or os.environ.get("TESTING") == "1" or any("pytest" in arg for arg in sys.argv)

if is_testing:
    engine = create_async_engine(
        _raw_url,
        connect_args=connect_args,
        poolclass=NullPool,
        echo=False,
    )
else:
    engine = create_async_engine(
        _raw_url,
        connect_args=connect_args,
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
