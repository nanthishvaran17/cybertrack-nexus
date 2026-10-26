"""Platforms, platform accounts, and sync status endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select

from app.core.dependencies import CurrentUser, DbSession, RequireAdminOrHOD
from app.models.models import Platform, PlatformAccount, Student, VerificationStatus

router = APIRouter(tags=["platforms"])


class PlatformOut(BaseModel):
    id: str
    slug: str
    display_name: str
    enabled: bool
    supported_capabilities: dict
    website_url: str | None


class PlatformAccountIn(BaseModel):
    student_id: str
    platform_id: str
    external_username: str | None = None
    profile_url: str | None = None


class PlatformAccountOut(BaseModel):
    id: str
    student_id: str
    platform_id: str
    platform_name: str
    external_username: str | None
    profile_url: str | None
    verification_status: str
    sync_status: str
    linked_at: datetime
    last_successful_sync_at: datetime | None


# ─── platforms ────────────────────────────────────────────────────────────────



platforms_router = APIRouter(prefix="/platforms", tags=["platforms"])
accounts_router = APIRouter(prefix="/platform-accounts", tags=["platforms"])


@platforms_router.get("", response_model=list[PlatformOut])
async def list_platforms(current_user: CurrentUser, db: DbSession) -> list[PlatformOut]:
    result = await db.execute(select(Platform).order_by(Platform.display_name))
    platforms = result.scalars().all()
    return [
        PlatformOut(
            id=str(p.id),
            slug=p.slug,
            display_name=p.display_name,
            enabled=p.enabled,
            supported_capabilities=p.supported_capabilities,
            website_url=p.website_url,
        )
        for p in platforms
    ]


@platforms_router.get("/{platform_id}/capabilities")
async def get_platform_capabilities(platform_id: uuid.UUID, current_user: CurrentUser, db: DbSession) -> dict:
    result = await db.execute(select(Platform).where(Platform.id == platform_id))
    platform = result.scalar_one_or_none()
    if platform is None:
        raise HTTPException(status_code=404, detail="Platform not found.")
    return {"platform_id": str(platform.id), "capabilities": platform.supported_capabilities}


# ─── platform accounts ────────────────────────────────────────────────────────


@accounts_router.post("", response_model=PlatformAccountOut, status_code=status.HTTP_201_CREATED)
async def link_platform_account(
    body: PlatformAccountIn,
    current_user: CurrentUser,
    db: DbSession,
) -> PlatformAccountOut:
    from app.models.models import UserRole as UR

    user_roles = {r.role for r in current_user.roles if r.revoked_at is None}

    student_id = uuid.UUID(body.student_id)
    platform_id = uuid.UUID(body.platform_id)

    # Students can only link their own account
    if UR.STUDENT in user_roles and len(user_roles) == 1:
        student_res = await db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_res.scalar_one_or_none()
        if student is None or student.institutional_email != current_user.email:
            raise HTTPException(status_code=403, detail="Students can only link their own accounts.")

    # Check no existing active account
    existing = (
        await db.execute(
            select(PlatformAccount).where(
                PlatformAccount.student_id == student_id,
                PlatformAccount.platform_id == platform_id,
                PlatformAccount.is_active.is_(True),
            )
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Platform account already linked.")

    platform_res = await db.execute(select(Platform).where(Platform.id == platform_id))
    platform = platform_res.scalar_one_or_none()
    if platform is None or not platform.enabled:
        raise HTTPException(status_code=400, detail="Platform not found or disabled.")

    account = PlatformAccount(
        student_id=student_id,
        platform_id=platform_id,
        external_username=body.external_username,
        profile_url=body.profile_url,
        verification_status=VerificationStatus.AWAITING,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)

    return PlatformAccountOut(
        id=str(account.id),
        student_id=str(account.student_id),
        platform_id=str(account.platform_id),
        platform_name=platform.display_name,
        external_username=account.external_username,
        profile_url=account.profile_url,
        verification_status=account.verification_status.value,
        sync_status=account.sync_status.value,
        linked_at=account.linked_at,
        last_successful_sync_at=account.last_successful_sync_at,
    )


@accounts_router.get("", response_model=list[PlatformAccountOut])
async def list_platform_accounts(
    current_user: CurrentUser,
    db: DbSession,
    student_id: str | None = None,
) -> list[PlatformAccountOut]:
    from sqlalchemy.orm import selectinload

    stmt = select(PlatformAccount).options(
        selectinload(PlatformAccount.platform)
    ).where(PlatformAccount.is_active.is_(True))

    if student_id:
        stmt = stmt.where(PlatformAccount.student_id == uuid.UUID(student_id))

    result = await db.execute(stmt)
    accounts = result.scalars().all()

    return [
        PlatformAccountOut(
            id=str(a.id),
            student_id=str(a.student_id),
            platform_id=str(a.platform_id),
            platform_name=a.platform.display_name,
            external_username=a.external_username,
            profile_url=a.profile_url,
            verification_status=a.verification_status.value,
            sync_status=a.sync_status.value,
            linked_at=a.linked_at,
            last_successful_sync_at=a.last_successful_sync_at,
        )
        for a in accounts
    ]


@accounts_router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unlink_platform_account(
    account_id: uuid.UUID,
    current_user: RequireAdminOrHOD,
    db: DbSession,
) -> None:
    result = await db.execute(select(PlatformAccount).where(PlatformAccount.id == account_id))
    account = result.scalar_one_or_none()
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found.")
    account.is_active = False
    await db.commit()
