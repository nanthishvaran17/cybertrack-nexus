"""Evidence submission and review endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.dependencies import CurrentUser, DbSession, RequireStaffOrAbove
from app.models.models import (
    AuditLog,
    Certificate,
    EvidenceSubmission,
    EvidenceType,
    ReviewDecision,
    Student,
    VerificationReview,
    VerificationStatus,
)

router = APIRouter(prefix="/evidence", tags=["evidence"])
settings = get_settings()

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


class EvidenceOut(BaseModel):
    id: str
    student_id: str
    evidence_type: str
    original_filename: str | None
    submission_status: str
    submitted_at: datetime
    platform_id: str | None


class ReviewIn(BaseModel):
    decision: ReviewDecision
    reason: str | None = None


@router.post("", response_model=EvidenceOut, status_code=status.HTTP_201_CREATED)
async def submit_evidence(
    current_user: CurrentUser,
    db: DbSession,
    student_id: str = Query(...),
    evidence_type: EvidenceType = Query(...),
    platform_id: str | None = Query(None),
    file: UploadFile = File(...),
) -> EvidenceOut:
    from pathlib import Path

    # IDOR: students can only submit for themselves
    from app.models.models import UserRole as UR
    user_roles = {r.role for r in current_user.roles if r.revoked_at is None}
    if UR.STUDENT in user_roles and len(user_roles) == 1:
        student_res = await db.execute(
            select(Student).where(Student.id == uuid.UUID(student_id))
        )
        student = student_res.scalar_one_or_none()
        if student is None or student.institutional_email != current_user.email:
            raise HTTPException(status_code=403, detail="Access denied.")

    # Validate extension
    if file.filename is None:
        raise HTTPException(status_code=400, detail="No filename provided.")
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Permitted: {sorted(ALLOWED_EXTENSIONS)}",
        )

    # Read and size-check
    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    # Generate safe storage key (no path traversal)
    safe_key = f"evidence/{uuid.uuid4().hex}{ext}"

    # TODO: in production, write to S3-compatible bucket using safe_key
    # For local dev, write to LOCAL_STORAGE_PATH
    if settings.STORAGE_BACKEND == "local":
        import os
        os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
        local_path = os.path.join(settings.LOCAL_STORAGE_PATH, safe_key.replace("/", "_"))
        with open(local_path, "wb") as f:
            f.write(contents)

    submission = EvidenceSubmission(
        student_id=uuid.UUID(student_id),
        platform_id=uuid.UUID(platform_id) if platform_id else None,
        evidence_type=evidence_type,
        submitted_metadata={"original_filename": file.filename},
        object_storage_key=safe_key,
        original_filename=file.filename,
        file_size_bytes=len(contents),
        submission_status=VerificationStatus.AWAITING,
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    return EvidenceOut(
        id=str(submission.id),
        student_id=str(submission.student_id),
        evidence_type=submission.evidence_type.value,
        original_filename=submission.original_filename,
        submission_status=submission.submission_status.value,
        submitted_at=submission.submitted_at,
        platform_id=str(submission.platform_id) if submission.platform_id else None,
    )


@router.get("", response_model=list[EvidenceOut])
async def list_evidence(
    current_user: CurrentUser,
    db: DbSession,
    student_id: str | None = Query(None),
    submission_status: str | None = Query(None),
) -> list[EvidenceOut]:
    stmt = select(EvidenceSubmission).order_by(EvidenceSubmission.submitted_at.desc())
    if student_id:
        stmt = stmt.where(EvidenceSubmission.student_id == uuid.UUID(student_id))
    if submission_status:
        stmt = stmt.where(EvidenceSubmission.submission_status == submission_status)

    result = await db.execute(stmt)
    subs = result.scalars().all()
    return [
        EvidenceOut(
            id=str(s.id),
            student_id=str(s.student_id),
            evidence_type=s.evidence_type.value,
            original_filename=s.original_filename,
            submission_status=s.submission_status.value,
            submitted_at=s.submitted_at,
            platform_id=str(s.platform_id) if s.platform_id else None,
        )
        for s in subs
    ]


@router.post("/{evidence_id}/review", status_code=status.HTTP_200_OK)
async def review_evidence(
    evidence_id: uuid.UUID,
    body: ReviewIn,
    current_user: RequireStaffOrAbove,
    db: DbSession,
) -> dict:
    result = await db.execute(
        select(EvidenceSubmission).where(EvidenceSubmission.id == evidence_id)
    )
    submission = result.scalar_one_or_none()
    if submission is None:
        raise HTTPException(status_code=404, detail="Evidence submission not found.")

    # Prevent student self-approval (also enforced by RequireStaffOrAbove)
    new_status = (
        VerificationStatus.VERIFIED
        if body.decision == ReviewDecision.APPROVED
        else VerificationStatus.REJECTED
    )
    submission.submission_status = new_status

    review = VerificationReview(
        evidence_submission_id=submission.id,
        reviewer_user_id=current_user.id,
        decision=body.decision,
        reason=body.reason,
    )
    db.add(review)

    # Audit log
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="evidence_reviewed",
        entity_type="evidence_submission",
        entity_id=str(evidence_id),
        permitted_context={"decision": body.decision.value},
    )
    db.add(audit)
    await db.commit()

    return {"status": new_status.value, "decision": body.decision.value}
