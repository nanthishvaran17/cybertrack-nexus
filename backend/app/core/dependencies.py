"""FastAPI dependencies for authentication and role-based access control."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.db.database import get_db
from app.models.models import User, UserRole, UserRole_
from app.security.jwt import decode_token

settings = get_settings()
_bearer = HTTPBearer(auto_error=False)


async def _get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Extract and validate JWT, return the authenticated User."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = decode_token(token, expected_use="access")
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user_id_str: str | None = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject.")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid subject format.")

    result = await db.execute(
        select(User)
        .options(selectinload(User.roles))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
        )
    return user


# ── typed dependency aliases ─────────────────────────────────────────────────

CurrentUser = Annotated[User, Depends(_get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_db)]


def _role_required(*roles: UserRole):
    """Return a dependency that enforces one of the given roles."""
    async def _check(current_user: CurrentUser) -> User:
        user_roles = {r.role for r in current_user.roles if r.revoked_at is None}
        if not user_roles.intersection(roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required one of: {[r.value for r in roles]}",
            )
        return current_user
    return _check


# ── convenience role guards ──────────────────────────────────────────────────

RequireHOD = Annotated[User, Depends(_role_required(UserRole.HOD))]
RequireAdminOrHOD = Annotated[User, Depends(_role_required(UserRole.HOD, UserRole.ADMIN))]
RequireStaffOrAbove = Annotated[User, Depends(_role_required(UserRole.HOD, UserRole.ADMIN, UserRole.STAFF))]
RequireAnyRole = Annotated[User, Depends(_role_required(UserRole.HOD, UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT))]


def get_student_id_for_current_user(current_user: User) -> uuid.UUID | None:
    """Returns the student_id embedded in the token extras, if present."""
    return getattr(current_user, "_student_id", None)
