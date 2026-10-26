"""JWT and password hashing utilities — dev-mode local auth."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── password helpers ─────────────────────────────────────────────────────────


def hash_password(plain: str) -> str:
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


# ─── JWT helpers ──────────────────────────────────────────────────────────────


def create_access_token(
    subject: str,
    extra: dict[str, Any] | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    expire = datetime.now(tz=timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": datetime.now(tz=timezone.utc),
        "exp": expire,
        "iss": settings.APP_NAME,
        "aud": settings.APP_NAME,
        "use": "access",
        **(extra or {}),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(tz=timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iss": settings.APP_NAME,
        "aud": settings.APP_NAME,
        "use": "refresh",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str, expected_use: str = "access") -> dict[str, Any]:
    """Decode and validate a JWT. Raises JWTError on any failure."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.APP_NAME,
            issuer=settings.APP_NAME,
        )
    except JWTError as exc:
        raise JWTError(f"Invalid token: {exc}") from exc

    if payload.get("use") != expected_use:
        raise JWTError(f"Token use mismatch: expected '{expected_use}'")

    return payload
