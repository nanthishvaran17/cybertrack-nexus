"""Students API — list, import preview/commit, get, patch."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.dependencies import CurrentUser, DbSession, RequireAdminOrHOD
from app.models.models import Department, MentorAssignment, Student, User, UserRole

router = APIRouter(prefix="/students", tags=["students"])


# ─── schemas ──────────────────────────────────────────────────────────────────


class StudentOut(BaseModel):
    id: str
    register_number: str
    full_name: str
    institutional_email: str
    academic_year: int
    section: str
    department_id: str
    is_active: bool
    mentor_name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StudentPatch(BaseModel):
    full_name: str | None = None
    academic_year: int | None = None
    section: str | None = None
    is_active: bool | None = None


class ImportRow(BaseModel):
    register_number: str
    full_name: str
    institutional_email: EmailStr
    academic_year: int
    section: str

    @field_validator("register_number", mode="before")
    @classmethod
    def normalise_regnum(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("institutional_email", mode="before")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()


class ImportPreviewResponse(BaseModel):
    total_rows: int
    valid_rows: int
    duplicate_rows: int
    error_rows: int
    preview: list[dict[str, Any]]


class ImportCommitRequest(BaseModel):
    rows: list[ImportRow]
    department_id: str


class PaginatedStudents(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[StudentOut]


# ─── endpoints ───────────────────────────────────────────────────────────────


@router.get("", response_model=PaginatedStudents)
async def list_students(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = Query("", max_length=100),
    academic_year: int | None = Query(None),
    section: str | None = Query(None),
    is_active: bool | None = Query(None),
) -> PaginatedStudents:
    from app.models.models import UserRole as UR

    user_roles = {r.role for r in current_user.roles if r.revoked_at is None}

    stmt = select(Student).options(selectinload(Student.mentor_assignments))
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            Student.full_name.ilike(pattern)
            | Student.register_number.ilike(pattern)
            | Student.institutional_email.ilike(pattern)
        )
    if academic_year:
        stmt = stmt.where(Student.academic_year == academic_year)
    if section:
        stmt = stmt.where(Student.section == section)
    if is_active is not None:
        stmt = stmt.where(Student.is_active == is_active)

    # Staff/Mentor: only assigned students
    if UR.STAFF in user_roles and UR.HOD not in user_roles and UR.ADMIN not in user_roles:
        assigned_stmt = select(MentorAssignment.student_id).where(
            MentorAssignment.mentor_user_id == current_user.id,
            MentorAssignment.is_active.is_(True),
        )
        assigned_ids = (await db.execute(assigned_stmt)).scalars().all()
        stmt = stmt.where(Student.id.in_(assigned_ids))

    count_result = await db.execute(select(func.count()).select_from(stmt.subquery()))
    total = count_result.scalar_one()

    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(Student.register_number)
    result = await db.execute(stmt)
    students = result.scalars().all()

    items = []
    for s in students:
        active_assignment = next((a for a in s.mentor_assignments if a.is_active), None)
        mentor_name: str | None = None
        if active_assignment:
            mentor_result = await db.execute(
                select(User).where(User.id == active_assignment.mentor_user_id)
            )
            mentor = mentor_result.scalar_one_or_none()
            mentor_name = mentor.display_name if mentor else None
        items.append(
            StudentOut(
                id=str(s.id),
                register_number=s.register_number,
                full_name=s.full_name,
                institutional_email=s.institutional_email,
                academic_year=s.academic_year,
                section=s.section,
                department_id=str(s.department_id),
                is_active=s.is_active,
                mentor_name=mentor_name,
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
        )

    return PaginatedStudents(total=total, page=page, page_size=page_size, items=items)


@router.get("/{student_id}", response_model=StudentOut)
async def get_student(student_id: uuid.UUID, current_user: CurrentUser, db: DbSession) -> StudentOut:
    from app.models.models import UserRole as UR

    user_roles = {r.role for r in current_user.roles if r.revoked_at is None}

    result = await db.execute(
        select(Student)
        .options(selectinload(Student.mentor_assignments))
        .where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    # IDOR guard: staff can only see assigned students
    if UR.STAFF in user_roles and UR.HOD not in user_roles and UR.ADMIN not in user_roles:
        assigned = any(
            a.mentor_user_id == current_user.id and a.is_active
            for a in student.mentor_assignments
        )
        if not assigned:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Students can only see themselves
    if UR.STUDENT in user_roles and len(user_roles) == 1:
        # match via email
        if student.institutional_email != current_user.email:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return StudentOut(
        id=str(student.id),
        register_number=student.register_number,
        full_name=student.full_name,
        institutional_email=student.institutional_email,
        academic_year=student.academic_year,
        section=student.section,
        department_id=str(student.department_id),
        is_active=student.is_active,
        mentor_name=None,
        created_at=student.created_at,
        updated_at=student.updated_at,
    )


@router.patch("/{student_id}", response_model=StudentOut)
async def patch_student(
    student_id: uuid.UUID,
    body: StudentPatch,
    current_user: RequireAdminOrHOD,
    db: DbSession,
) -> StudentOut:
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(student, field, value)

    await db.commit()
    await db.refresh(student)
    return StudentOut(
        id=str(student.id),
        register_number=student.register_number,
        full_name=student.full_name,
        institutional_email=student.institutional_email,
        academic_year=student.academic_year,
        section=student.section,
        department_id=str(student.department_id),
        is_active=student.is_active,
        mentor_name=None,
        created_at=student.created_at,
        updated_at=student.updated_at,
    )


@router.post("/import/preview", response_model=ImportPreviewResponse)
async def import_preview(
    body: ImportCommitRequest,
    current_user: RequireAdminOrHOD,
    db: DbSession,
) -> ImportPreviewResponse:
    """Validate and preview import rows without committing."""
    seen_regnums: set[str] = set()
    preview: list[dict] = []
    valid = duplicate = error = 0

    for row in body.rows:
        issues = []

        # Check duplicate in payload
        if row.register_number in seen_regnums:
            issues.append("Duplicate register number in upload")
            duplicate += 1
        else:
            seen_regnums.add(row.register_number)

        # Check DB conflict
        existing = (
            await db.execute(
                select(Student).where(Student.register_number == row.register_number)
            )
        ).scalar_one_or_none()
        if existing:
            issues.append("Register number already exists in database")
            duplicate += 1

        if issues:
            status_val = "duplicate" if duplicate else "error"
        else:
            status_val = "valid"
            valid += 1

        preview.append(
            {
                "register_number": row.register_number,
                "full_name": row.full_name,
                "institutional_email": str(row.institutional_email),
                "academic_year": row.academic_year,
                "section": row.section,
                "status": status_val,
                "issues": issues,
            }
        )

    return ImportPreviewResponse(
        total_rows=len(body.rows),
        valid_rows=valid,
        duplicate_rows=duplicate,
        error_rows=error,
        preview=preview,
    )


@router.post("/import/commit", status_code=status.HTTP_201_CREATED)
async def import_commit(
    body: ImportCommitRequest,
    current_user: RequireAdminOrHOD,
    db: DbSession,
) -> dict:
    """Transactionally commit validated import rows. Fails entirely on conflict."""
    dept_result = await db.execute(
        select(Department).where(Department.id == uuid.UUID(body.department_id))
    )
    dept = dept_result.scalar_one_or_none()
    if dept is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department not found.")

    inserted = 0
    skipped = 0
    async with db.begin_nested():
        for row in body.rows:
            existing = (
                await db.execute(
                    select(Student).where(Student.register_number == row.register_number)
                )
            ).scalar_one_or_none()
            if existing:
                skipped += 1
                continue

            student = Student(
                register_number=row.register_number,
                full_name=row.full_name,
                institutional_email=str(row.institutional_email),
                academic_year=row.academic_year,
                section=row.section,
                department_id=dept.id,
                is_active=True,
            )
            db.add(student)
            inserted += 1

    await db.commit()
    return {"inserted": inserted, "skipped": skipped}
