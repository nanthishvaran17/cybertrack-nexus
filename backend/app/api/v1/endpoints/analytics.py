"""Analytics overview endpoints."""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import func, select

from app.core.dependencies import CurrentUser, DbSession, RequireStaffOrAbove
from app.models.models import (
    Certificate,
    EvidenceSubmission,
    Platform,
    PlatformAccount,
    Student,
    SyncJob,
    VerificationStatus,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


class OverviewMetrics(BaseModel):
    total_active_students: int
    students_with_linked_platforms: int
    verified_certificates: int
    pending_evidence: int
    sync_success_rate: float | None
    platform_adoption: list[dict]


@router.get("/overview", response_model=OverviewMetrics)
async def analytics_overview(current_user: RequireStaffOrAbove, db: DbSession) -> OverviewMetrics:
    total_active = (
        await db.execute(
            select(func.count(Student.id)).where(Student.is_active.is_(True))
        )
    ).scalar_one()

    with_platforms = (
        await db.execute(
            select(func.count(func.distinct(PlatformAccount.student_id))).where(
                PlatformAccount.is_active.is_(True)
            )
        )
    ).scalar_one()

    verified_certs = (
        await db.execute(
            select(func.count(Certificate.id)).where(
                Certificate.verification_status == VerificationStatus.VERIFIED
            )
        )
    ).scalar_one()

    pending_evidence = (
        await db.execute(
            select(func.count(EvidenceSubmission.id)).where(
                EvidenceSubmission.submission_status == VerificationStatus.AWAITING
            )
        )
    ).scalar_one()

    # Sync success rate from last 50 jobs
    total_jobs = (
        await db.execute(
            select(func.count(SyncJob.id))
        )
    ).scalar_one()
    successful_jobs = (
        await db.execute(
            select(func.count(SyncJob.id)).where(SyncJob.status == "completed")
        )
    ).scalar_one()
    sync_rate = (successful_jobs / total_jobs * 100) if total_jobs > 0 else None

    # Platform adoption breakdown
    platform_rows = (
        await db.execute(
            select(Platform.display_name, func.count(PlatformAccount.id))
            .join(PlatformAccount, PlatformAccount.platform_id == Platform.id, isouter=True)
            .where(PlatformAccount.is_active.is_(True))
            .group_by(Platform.display_name)
            .order_by(func.count(PlatformAccount.id).desc())
        )
    ).all()
    platform_adoption = [{"platform": r[0], "count": r[1]} for r in platform_rows]

    return OverviewMetrics(
        total_active_students=total_active,
        students_with_linked_platforms=with_platforms,
        verified_certificates=verified_certs,
        pending_evidence=pending_evidence,
        sync_success_rate=sync_rate,
        platform_adoption=platform_adoption,
    )


@router.get("/platforms")
async def platform_analytics(current_user: RequireStaffOrAbove, db: DbSession) -> list[dict]:
    rows = (
        await db.execute(
            select(
                Platform.display_name,
                Platform.slug,
                func.count(PlatformAccount.id).label("linked_accounts"),
            )
            .outerjoin(PlatformAccount, PlatformAccount.platform_id == Platform.id)
            .group_by(Platform.display_name, Platform.slug)
        )
    ).all()
    return [{"platform": r[0], "slug": r[1], "linked_accounts": r[2]} for r in rows]
