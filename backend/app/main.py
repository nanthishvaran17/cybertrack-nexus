"""FastAPI application entry point for CyberTrack Nexus."""
from __future__ import annotations

import uuid

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.evidence import router as evidence_router
from app.api.v1.endpoints.platforms import accounts_router, platforms_router
from app.api.v1.endpoints.students import router as students_router
from app.core.config import get_settings

settings = get_settings()
log = structlog.get_logger()

# ─── rate limiter ─────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ─── app ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Cybersecurity Education Intelligence Platform — Nandha Engineering College CSE",
    docs_url="/api/docs" if not settings.is_production else None,
    redoc_url="/api/redoc" if not settings.is_production else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore

# ─── CORS ────────────────────────────────────────────────────────────────────
_origins = (
    [str(o) for o in settings.ALLOWED_ORIGINS]
    if settings.ALLOWED_ORIGINS
    else ["http://localhost:5173", "http://127.0.0.1:5173"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

# ─── request ID middleware ────────────────────────────────────────────────────
@app.middleware("http")
async def add_request_id(request: Request, call_next):  # type: ignore
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# ─── routers ─────────────────────────────────────────────────────────────────
V1 = settings.API_V1_PREFIX

app.include_router(auth_router, prefix=V1)
app.include_router(students_router, prefix=V1)
app.include_router(platforms_router, prefix=V1)
app.include_router(accounts_router, prefix=V1)
app.include_router(analytics_router, prefix=V1)
app.include_router(evidence_router, prefix=V1)

# ─── health checks ────────────────────────────────────────────────────────────
@app.get("/health/live", tags=["health"])
async def liveness() -> dict:
    return {"status": "ok", "version": settings.APP_VERSION}


@app.get("/health/ready", tags=["health"])
async def readiness() -> dict:
    """Check DB connectivity without leaking credentials."""
    from sqlalchemy import text
    from app.db.database import AsyncSessionLocal
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "unavailable"

    http_status = status.HTTP_200_OK if db_status == "ok" else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(
        status_code=http_status,
        content={"status": "ready" if db_status == "ok" else "degraded", "db": db_status},
    )


# ─── global error handler — never expose internals ───────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):  # type: ignore
    log.error("unhandled_exception", exc=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )
