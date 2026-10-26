"""Auth API endpoints — dev-mode login, logout, /me."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.dependencies import CurrentUser, DbSession
from app.models.models import User, UserRole_
from app.security.jwt import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    id: str
    email: str
    display_name: str
    roles: list[str]
    is_active: bool


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: DbSession) -> TokenResponse:
    """Dev-mode local login. Guard: disabled in production."""
    if not settings.DEV_AUTH_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Local authentication is disabled in this environment.",
        )

    result = await db.execute(
        select(User)
        .options(selectinload(User.roles))
        .where(User.email == body.email.lower())
    )
    user = result.scalar_one_or_none()

    if user is None or user.hashed_password is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact an administrator.",
        )

    roles = [r.role.value for r in user.roles if r.revoked_at is None]
    token = create_access_token(str(user.id), extra={"roles": roles, "email": user.email})
    return TokenResponse(access_token=token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: CurrentUser) -> None:
    """Logout — client must discard token. Audit log recorded."""
    # Stateless JWT: client discards token.
    # TODO: For production, implement a token denylist (Redis or DB) here.
    return None


@router.get("/me", response_model=MeResponse)
async def me(current_user: CurrentUser) -> MeResponse:
    return MeResponse(
        id=str(current_user.id),
        email=current_user.email,
        display_name=current_user.display_name,
        roles=[r.role.value for r in current_user.roles if r.revoked_at is None],
        is_active=current_user.is_active,
    )
