"""All SQLAlchemy ORM models — normalised relational schema for CyberTrack Nexus."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

# ─── helpers ────────────────────────────────────────────────────────────────


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


def _now() -> datetime:
    return datetime.utcnow()


# ─── enums ──────────────────────────────────────────────────────────────────


class UserRole(str, enum.Enum):
    HOD = "hod"
    ADMIN = "admin"
    STAFF = "staff"
    STUDENT = "student"


class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    AWAITING = "awaiting"
    VERIFIED = "verified"
    REJECTED = "rejected"


class SyncStatus(str, enum.Enum):
    NOT_LINKED = "not_linked"
    AWAITING_VERIFICATION = "awaiting_verification"
    CONNECTED = "connected"
    SYNCING = "syncing"
    HEALTHY = "healthy"
    STALE = "stale"
    FAILED = "failed"
    ACCESS_UNAVAILABLE = "access_unavailable"
    UNSUPPORTED = "unsupported"


class EvidenceType(str, enum.Enum):
    CERTIFICATE = "certificate"
    LAB_COMPLETION = "lab_completion"
    COURSE_COMPLETION = "course_completion"
    ACHIEVEMENT = "achievement"
    OTHER = "other"


class ReviewDecision(str, enum.Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVISION = "needs_revision"


class NotificationType(str, enum.Enum):
    EVIDENCE_REVIEWED = "evidence_reviewed"
    SYNC_FAILED = "sync_failed"
    MENTOR_NOTE = "mentor_note"
    INTERVENTION_FLAGGED = "intervention_flagged"
    IMPORT_COMPLETE = "import_complete"


# ─── users ──────────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    identity_provider: Mapped[str] = mapped_column(String(64), nullable=False)
    provider_subject: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # relationships
    roles: Mapped[list["UserRole_"]] = relationship("UserRole_", foreign_keys="[UserRole_.user_id]", back_populates="user", cascade="all, delete-orphan")
    mentor_assignments: Mapped[list["MentorAssignment"]] = relationship("MentorAssignment", foreign_keys="MentorAssignment.mentor_user_id", back_populates="mentor")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="recipient")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="actor")

    __table_args__ = (
        UniqueConstraint("identity_provider", "provider_subject", name="uq_user_provider"),
        UniqueConstraint("email", name="uq_user_email"),
        Index("ix_user_email", "email"),
    )


class UserRole_(Base):
    """User → role mapping with audit trail."""
    __tablename__ = "user_roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    granted_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="roles")

    __table_args__ = (
        UniqueConstraint("user_id", "role", name="uq_user_role_active"),
        Index("ix_user_roles_user_id", "user_id"),
    )


# ─── departments ─────────────────────────────────────────────────────────────


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    code: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    students: Mapped[list["Student"]] = relationship("Student", back_populates="department")


# ─── students ────────────────────────────────────────────────────────────────


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    register_number: Mapped[str] = mapped_column(String(32), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    institutional_email: Mapped[str] = mapped_column(String(255), nullable=False)
    academic_year: Mapped[int] = mapped_column(Integer, nullable=False)
    section: Mapped[str] = mapped_column(String(8), nullable=False)
    department_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    department: Mapped["Department"] = relationship("Department", back_populates="students")
    mentor_assignments: Mapped[list["MentorAssignment"]] = relationship("MentorAssignment", back_populates="student")
    platform_accounts: Mapped[list["PlatformAccount"]] = relationship("PlatformAccount", back_populates="student")
    progress_snapshots: Mapped[list["ProgressSnapshot"]] = relationship("ProgressSnapshot", back_populates="student")
    learning_activities: Mapped[list["LearningActivity"]] = relationship("LearningActivity", back_populates="student")
    certificates: Mapped[list["Certificate"]] = relationship("Certificate", back_populates="student")
    evidence_submissions: Mapped[list["EvidenceSubmission"]] = relationship("EvidenceSubmission", back_populates="student")

    __table_args__ = (
        UniqueConstraint("register_number", "department_id", name="uq_student_regnum_dept"),
        UniqueConstraint("institutional_email", name="uq_student_email"),
        Index("ix_student_register_number", "register_number"),
        Index("ix_student_academic_year", "academic_year"),
        Index("ix_student_section", "section"),
        CheckConstraint("academic_year >= 1 AND academic_year <= 6", name="ck_student_academic_year"),
    )


# ─── mentor assignments ───────────────────────────────────────────────────────


class MentorAssignment(Base):
    __tablename__ = "mentor_assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    mentor_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    assigned_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    student: Mapped["Student"] = relationship("Student", back_populates="mentor_assignments")
    mentor: Mapped["User"] = relationship("User", foreign_keys=[mentor_user_id], back_populates="mentor_assignments")

    __table_args__ = (
        Index("ix_mentor_assignment_student", "student_id"),
        Index("ix_mentor_assignment_mentor", "mentor_user_id"),
    )


# ─── platforms ───────────────────────────────────────────────────────────────


class Platform(Base):
    __tablename__ = "platforms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    slug: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    supported_capabilities: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    website_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    platform_accounts: Mapped[list["PlatformAccount"]] = relationship("PlatformAccount", back_populates="platform")
    sync_jobs: Mapped[list["SyncJob"]] = relationship("SyncJob", back_populates="platform")
    certificates: Mapped[list["Certificate"]] = relationship("Certificate", back_populates="platform")


# ─── platform accounts ────────────────────────────────────────────────────────


class PlatformAccount(Base):
    __tablename__ = "platform_accounts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    platform_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("platforms.id"), nullable=False)
    external_username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    external_profile_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    profile_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    verification_status: Mapped[VerificationStatus] = mapped_column(Enum(VerificationStatus), default=VerificationStatus.UNVERIFIED, nullable=False)
    sync_status: Mapped[SyncStatus] = mapped_column(Enum(SyncStatus), default=SyncStatus.NOT_LINKED, nullable=False)
    linked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_successful_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    student: Mapped["Student"] = relationship("Student", back_populates="platform_accounts")
    platform: Mapped["Platform"] = relationship("Platform", back_populates="platform_accounts")
    progress_snapshots: Mapped[list["ProgressSnapshot"]] = relationship("ProgressSnapshot", back_populates="platform_account")
    learning_activities: Mapped[list["LearningActivity"]] = relationship("LearningActivity", back_populates="platform_account")

    __table_args__ = (
        UniqueConstraint("student_id", "platform_id", name="uq_platform_account_student_platform"),
        Index("ix_platform_account_student", "student_id"),
        Index("ix_platform_account_platform", "platform_id"),
    )


# ─── progress snapshots ───────────────────────────────────────────────────────


class ProgressSnapshot(Base):
    __tablename__ = "progress_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    platform_account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("platform_accounts.id", ondelete="CASCADE"), nullable=False)
    capability: Mapped[str] = mapped_column(String(64), nullable=False)
    metric_key: Mapped[str] = mapped_column(String(128), nullable=False)
    metric_value: Mapped[str] = mapped_column(Text, nullable=False)
    source_type: Mapped[str] = mapped_column(String(32), nullable=False, default="api")
    source_timestamp: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    snapshot_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    data_quality_status: Mapped[str] = mapped_column(String(32), default="ok", nullable=False)

    student: Mapped["Student"] = relationship("Student", back_populates="progress_snapshots")
    platform_account: Mapped["PlatformAccount"] = relationship("PlatformAccount", back_populates="progress_snapshots")

    __table_args__ = (
        Index("ix_snapshot_student_platform", "student_id", "platform_account_id"),
        Index("ix_snapshot_fetched_at", "fetched_at"),
    )


# ─── learning activities ──────────────────────────────────────────────────────


class LearningActivity(Base):
    __tablename__ = "learning_activities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    platform_account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("platform_accounts.id", ondelete="CASCADE"), nullable=False)
    external_activity_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    activity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    activity_title: Mapped[str] = mapped_column(String(512), nullable=False)
    completion_status: Mapped[str] = mapped_column(String(32), nullable=False, default="in_progress")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="api")
    last_observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    student: Mapped["Student"] = relationship("Student", back_populates="learning_activities")
    platform_account: Mapped["PlatformAccount"] = relationship("PlatformAccount", back_populates="learning_activities")

    __table_args__ = (
        UniqueConstraint("platform_account_id", "external_activity_id", name="uq_activity_platform_external"),
        Index("ix_activity_student", "student_id"),
    )


# ─── certificates ─────────────────────────────────────────────────────────────


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    platform_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("platforms.id"), nullable=True)
    certificate_title: Mapped[str] = mapped_column(String(512), nullable=False)
    issuing_organisation: Mapped[str] = mapped_column(String(255), nullable=False)
    issue_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expiry_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    credential_identifier: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verification_status: Mapped[VerificationStatus] = mapped_column(Enum(VerificationStatus), default=VerificationStatus.AWAITING, nullable=False)
    evidence_object_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    student: Mapped["Student"] = relationship("Student", back_populates="certificates")
    platform: Mapped["Platform | None"] = relationship("Platform", back_populates="certificates")
    reviews: Mapped[list["VerificationReview"]] = relationship("VerificationReview", back_populates="certificate")

    __table_args__ = (
        Index("ix_certificate_student", "student_id"),
        Index("ix_certificate_status", "verification_status"),
    )


# ─── evidence submissions ─────────────────────────────────────────────────────


class EvidenceSubmission(Base):
    __tablename__ = "evidence_submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    platform_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("platforms.id"), nullable=True)
    evidence_type: Mapped[EvidenceType] = mapped_column(Enum(EvidenceType), nullable=False)
    submitted_metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    object_storage_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    original_filename: Mapped[str | None] = mapped_column(String(512), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    submission_status: Mapped[VerificationStatus] = mapped_column(Enum(VerificationStatus), default=VerificationStatus.AWAITING, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    student: Mapped["Student"] = relationship("Student", back_populates="evidence_submissions")
    reviews: Mapped[list["VerificationReview"]] = relationship("VerificationReview", back_populates="evidence_submission")

    __table_args__ = (
        Index("ix_evidence_student", "student_id"),
        Index("ix_evidence_status", "submission_status"),
    )


# ─── verification reviews ─────────────────────────────────────────────────────


class VerificationReview(Base):
    __tablename__ = "verification_reviews"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    certificate_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("certificates.id", ondelete="CASCADE"), nullable=True)
    evidence_submission_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("evidence_submissions.id", ondelete="CASCADE"), nullable=True)
    reviewer_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    decision: Mapped[ReviewDecision] = mapped_column(Enum(ReviewDecision), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    certificate: Mapped["Certificate | None"] = relationship("Certificate", back_populates="reviews")
    evidence_submission: Mapped["EvidenceSubmission | None"] = relationship("EvidenceSubmission", back_populates="reviews")

    __table_args__ = (
        CheckConstraint(
            "(certificate_id IS NOT NULL) OR (evidence_submission_id IS NOT NULL)",
            name="ck_review_has_subject",
        ),
        Index("ix_review_certificate", "certificate_id"),
        Index("ix_review_evidence", "evidence_submission_id"),
    )


# ─── sync jobs ───────────────────────────────────────────────────────────────


class SyncJob(Base):
    __tablename__ = "sync_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    platform_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("platforms.id"), nullable=False)
    student_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=True)
    run_id: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    records_received: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_processed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    sanitised_error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    platform: Mapped["Platform"] = relationship("Platform", back_populates="sync_jobs")

    __table_args__ = (
        Index("ix_sync_job_platform", "platform_id"),
        Index("ix_sync_job_started_at", "started_at"),
    )


# ─── audit logs ───────────────────────────────────────────────────────────────


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(128), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    request_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    permitted_context: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    actor: Mapped["User | None"] = relationship("User", back_populates="audit_logs")

    __table_args__ = (
        Index("ix_audit_actor", "actor_user_id"),
        Index("ix_audit_occurred_at", "occurred_at"),
        Index("ix_audit_action", "action"),
    )


# ─── notifications ────────────────────────────────────────────────────────────


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    recipient_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    notification_type: Mapped[NotificationType] = mapped_column(Enum(NotificationType), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    recipient: Mapped["User"] = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index("ix_notification_recipient", "recipient_user_id"),
        Index("ix_notification_created_at", "created_at"),
    )
