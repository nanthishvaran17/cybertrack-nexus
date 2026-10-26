<div align="center">

<img src="https://img.shields.io/badge/CyberTrack_Nexus-v0.1.0-6c63ff?style=for-the-badge&logo=shield&logoColor=white" alt="version"/>
<img src="https://img.shields.io/badge/FastAPI-0.100+-00c896?style=for-the-badge&logo=fastapi&logoColor=white" alt="fastapi"/>
<img src="https://img.shields.io/badge/PostgreSQL-16+-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="postgres"/>
<img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="python"/>
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="license"/>

<br/><br/>

# ??? CyberTrack Nexus

### **Cybersecurity Education Intelligence Platform**
**Nandha Engineering College — Department of Computer Science & Engineering**

*A production-grade, role-aware platform that tracks every student's cybersecurity learning journey — from platform accounts and certificates to mentor reviews and real-time analytics.*

<br/>

[?? API Docs](#-api-reference) · [?? Quick Start](#-quick-start) · [??? Architecture](#-architecture) · [?? Security](#-security-model) · [?? Contributing](#-contributing)

</div>

---

## ? Overview

**CyberTrack Nexus** is an institutional-grade intelligence platform built for cybersecurity education departments. It aggregates student learning activity from external platforms (TryHackMe, Hack The Box, LeetCode, etc.), manages evidence submissions, orchestrates mentor workflows, and delivers real-time analytics — all behind a hardened, JWT-authenticated REST API.

> Built for **Nandha Engineering College CSE** — designed to scale to any engineering institution.

### ?? What It Does

| Feature | Description |
|---|---|
| ?? **Student Registry** | Bulk-import, paginate, search and manage the full student cohort |
| ?? **Platform Linking** | Connect students to cybersecurity platforms with verification workflows |
| ?? **Evidence Management** | Students upload certificates/lab completions; staff review and approve |
| ????? **Mentor Assignment** | HODs assign mentors; staff see only their assigned students (IDOR-safe) |
| ?? **Analytics Dashboard** | Live metrics: platform adoption, sync health, certificate stats |
| ?? **RBAC** | Four-tier role system: Admin ? HOD ? Staff ? Student |
| ?? **Audit Trail** | Every sensitive action is logged to an immutable audit table |
| ?? **Notifications** | In-app notifications for reviews, sync failures, and interventions |

---

## ??? Architecture

```
cybertrack-nexus/
+-- backend/                  # FastAPI async Python API
¦   +-- app/
¦       +-- main.py           # App factory, middleware, router registration
¦       +-- api/v1/endpoints/ # REST endpoint modules
¦       ¦   +-- auth.py       # Login · Logout · /me
¦       ¦   +-- students.py   # CRUD + bulk import (preview/commit)
¦       ¦   +-- platforms.py  # Platform registry + account linking
¦       ¦   +-- evidence.py   # File upload, review workflow
¦       ¦   +-- analytics.py  # Overview metrics + platform breakdown
¦       +-- models/
¦       ¦   +-- models.py     # All SQLAlchemy ORM models (PostgreSQL)
¦       +-- core/
¦       ¦   +-- config.py     # Pydantic settings (env-driven)
¦       ¦   +-- dependencies.py # JWT auth + RBAC typed dependencies
¦       +-- db/
¦       ¦   +-- database.py   # Async SQLAlchemy engine + session
¦       +-- security/
¦       ¦   +-- jwt.py        # Token creation, verification, password hashing
¦       +-- workers/          # Background sync workers (async tasks)
¦       +-- analytics/        # Analytics computation engines
¦       +-- integrations/     # External platform API adapters
¦       +-- repositories/     # Data access layer
¦       +-- schemas/          # Shared Pydantic schemas
¦       +-- tests/            # Test suite
+-- frontend/                 # React/Vite SPA (http://localhost:5173)
+-- docs/                     # Architecture & API documentation
+-- infra/                    # Infrastructure-as-Code (Docker, K8s, etc.)
+-- .github/                  # CI/CD workflows
```

### ?? Request Lifecycle

```
Client ? [CORS Middleware] ? [Request-ID Middleware] ? [Rate Limiter]
       ? [JWT Auth Dependency] ? [RBAC Role Guard] ? [Endpoint Handler]
       ? [AsyncSession (PostgreSQL)] ? [JSON Response]
```

---

## ??? Data Model

```
users
  +-- user_roles (ADMIN | HOD | STAFF | STUDENT)

departments
  +-- students
        +-- mentor_assignments ? users (mentor)
        +-- platform_accounts  ? platforms
        ¦     +-- sync_jobs
        +-- progress_snapshots
        +-- learning_activities
        +-- certificates       ? platforms
        +-- evidence_submissions
              +-- verification_reviews ? users (reviewer)

users -- audit_logs (immutable action trail)
users -- notifications
```

### Core Entities

| Model | Key Fields |
|---|---|
| `User` | `id`, `email`, `identity_provider`, `hashed_password`, `is_active` |
| `UserRole_` | `user_id`, `role`, `granted_by`, `revoked_at` |
| `Department` | `code`, `name`, `is_active` |
| `Student` | `register_number`, `full_name`, `institutional_email`, `academic_year`, `section` |
| `MentorAssignment` | `student_id`, `mentor_user_id`, `assigned_by`, `is_active` |
| `Platform` | `slug`, `display_name`, `supported_capabilities` (JSONB), `enabled` |
| `PlatformAccount` | `student_id`, `platform_id`, `verification_status`, `sync_status` |
| `EvidenceSubmission` | `evidence_type`, `object_storage_key`, `submission_status` |
| `VerificationReview` | `decision` (APPROVED/REJECTED/NEEDS_REVISION), `reason` |
| `AuditLog` | `actor_user_id`, `action`, `entity_type`, `entity_id` |

---

## ?? Security Model

### Role-Based Access Control (RBAC)

```
ADMIN  ---- Full system access, user management
  HOD  ---- Department-wide visibility, mentor assignment
  STAFF --- Only their assigned students (IDOR-enforced at query level)
  STUDENT - Only their own profile, their own evidence submissions
```

| Guard | Roles Allowed | Used In |
|---|---|---|
| `CurrentUser` | Any authenticated user | All protected endpoints |
| `RequireAdminOrHOD` | ADMIN, HOD | Student patch, bulk import |
| `RequireStaffOrAbove` | ADMIN, HOD, STAFF | Analytics, evidence review |
| `RequireHOD` | HOD only | HOD-specific actions |

### Security Hardening

- ? **JWT Bearer tokens** — HS256, short-lived access tokens with `use` claim validation
- ? **IDOR prevention** — Staff/Student access filtered at the SQL query level, not just view layer
- ? **Rate limiting** — `slowapi` per-IP rate limiter on all routes
- ? **No internal leakage** — Global exception handler returns `500` generics, never stack traces
- ? **CORS strict** — Only whitelisted origins; configurable per environment
- ? **File upload safety** — Extension allowlist + size cap + UUID-renamed storage keys (no path traversal)
- ? **Production auth guard** — Local login disabled when `DEV_AUTH_ENABLED=false`
- ? **Audit trail** — Every review, import, and sensitive mutation writes to `audit_logs`

---

## ?? Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.11+ |
| PostgreSQL | 14+ |
| Node.js | 18+ |
| Git | Latest |

### 1. Clone the repository

```bash
git clone https://github.com/nanthishvaran17/cybertrack-nexus.git
cd cybertrack-nexus
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -e ".[dev]"

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials, SECRET_KEY, etc.

# Run database migrations
alembic upgrade head

# Start the API server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**API is now live at:** `http://127.0.0.1:8000`  
**Interactive docs:** `http://127.0.0.1:8000/api/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend is now live at:** `http://localhost:5173`

---

## ?? API Reference

### Base URL: `/api/v1`

#### ?? Authentication — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Dev-mode login ? JWT token |
| `POST` | `/auth/logout` | ? Bearer | Logout (client discards token) |
| `GET` | `/auth/me` | ? Bearer | Current user profile + roles |

#### ?? Students — `/students`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/students` | ? Bearer | Paginated list with search, year, section filters |
| `GET` | `/students/{id}` | ? Bearer | Get individual student (IDOR-guarded) |
| `PATCH` | `/students/{id}` | ?? Admin/HOD | Update student fields |
| `POST` | `/students/import/preview` | ?? Admin/HOD | Validate bulk rows, return conflicts |
| `POST` | `/students/import/commit` | ?? Admin/HOD | Transactionally commit validated rows |

#### ??? Platforms — `/platforms` & `/platform-accounts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/platforms` | ? Bearer | List all enabled platforms |
| `GET` | `/platforms/{id}/capabilities` | ? Bearer | Platform capability manifest |
| `POST` | `/platform-accounts` | ? Bearer | Link student to a platform |
| `GET` | `/platform-accounts` | ? Bearer | List linked accounts |
| `DELETE` | `/platform-accounts/{id}` | ?? Admin/HOD | Soft-delete a platform link |

#### ?? Evidence — `/evidence`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/evidence` | ? Bearer | Upload file evidence (PDF/PNG/JPG) |
| `GET` | `/evidence` | ? Bearer | List submissions |
| `POST` | `/evidence/{id}/review` | ?? Staff+ | Approve / Reject / Request revision |

#### ?? Analytics — `/analytics`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/analytics/overview` | ?? Staff+ | Active students, certificates, sync rate |
| `GET` | `/analytics/platforms` | ?? Staff+ | Per-platform linked account counts |

#### ?? Health Checks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health/live` | Liveness probe |
| `GET` | `/health/ready` | Readiness probe (checks DB) |

---

## ?? Environment Variables

```env
# App
APP_NAME=CyberTrack Nexus
APP_VERSION=0.1.0
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/cybertrack

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
DEV_AUTH_ENABLED=true

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# API
API_V1_PREFIX=/api/v1

# Storage
STORAGE_BACKEND=local
LOCAL_STORAGE_PATH=./uploads
MAX_UPLOAD_SIZE_MB=10
```

---

## ??? Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI (async) |
| ORM | SQLAlchemy 2.x (async) |
| Database | PostgreSQL + asyncpg |
| Migrations | Alembic |
| Auth | python-jose (JWT) · passlib (bcrypt) |
| Validation | Pydantic v2 |
| Rate Limiting | slowapi |
| Logging | structlog |
| Server | Uvicorn |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Dev Server | http://localhost:5173 |

---

## ?? Supported Platforms

The platform registry supports any cybersecurity learning platform via the `supported_capabilities` JSONB field:

- ?? **TryHackMe** — Lab completions, room progress
- ? **Hack The Box** — Machine pwns, challenge solves
- ?? **LeetCode** — Contest ratings, problem count
- ?? **Coursera / edX** — Course certificates
- ?? **Cisco NetAcad** — Networking certifications
- ?? **CompTIA / EC-Council** — Industry certifications

---

## ?? Contributing

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Convention
```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
refactor: Code change (no feature/fix)
test:     Adding or updating tests
chore:    Build process or tooling
```

---

## ?? Institution

**Nandha Engineering College**  
Department of Computer Science & Engineering  
Erode, Tamil Nadu, India

---

## ?? License

This project is licensed under the **MIT License**.

---

<div align="center">

Built with ?? for cybersecurity education at Nandha Engineering College

? **Star this repo** if CyberTrack Nexus helps your institution!

</div>
