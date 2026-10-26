<div align="center">

![CyberTrack Nexus](docs/assets/banner.jpg)

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Async-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-00E676?style=for-the-badge)]()

<br/>

# 🛡️ CyberTrack Nexus

### Cybersecurity Education Intelligence Platform
**Nandha Engineering College — Dept. of Computer Science & Engineering**

*Production-grade · Role-aware · Real-time*

*Tracks every student's cybersecurity journey — platform accounts, certifications, mentor reviews, and live analytics — behind a hardened JWT-authenticated API.*

<br/>

[![API Docs](https://img.shields.io/badge/📖_API_Reference-6c63ff?style=flat-square)](#-api-reference)
[![Quick Start](https://img.shields.io/badge/🚀_Quick_Start-009688?style=flat-square)](#-quick-start)
[![Architecture](https://img.shields.io/badge/🏗️_Architecture-ff6b6b?style=flat-square)](#️-architecture)
[![Security](https://img.shields.io/badge/🔐_Security-f7931e?style=flat-square)](#-security-model)

</div>

---

## ✨ What is CyberTrack Nexus?

**CyberTrack Nexus** is an institutional-grade intelligence platform purpose-built for cybersecurity education departments. It aggregates student learning activity from external platforms *(TryHackMe, Hack The Box, LeetCode, Cisco NetAcad, etc.)*, manages evidence submissions, orchestrates mentor–student workflows, and delivers real-time analytics — all behind a hardened, JWT-authenticated REST API with fine-grained RBAC.

> 🏫 Built for **Nandha Engineering College CSE (Cyber Security)** — architected to scale to any engineering institution.

<br/>

## 🎯 Core Features

| | Feature | Description |
|:---:|---|---|
| 🎓 | **Student Registry** | Bulk-import CSV, paginate, search, and manage the full student cohort with department isolation |
| 🔗 | **Platform Linking** | Connect students to cybersecurity platforms with full verification & sync status lifecycle |
| 📄 | **Evidence Management** | Students upload PDF/PNG certificates; staff review, approve, or request revisions |
| 🧑‍🏫 | **Mentor Assignment** | HODs assign mentors; staff see *only* their assigned students — IDOR-enforced at SQL level |
| 📊 | **Live Analytics** | Real-time metrics: platform adoption, sync health, verified certificates, intervention flags |
| 🔒 | **4-Tier RBAC** | Admin → HOD → Staff → Student — every endpoint independently role-guarded |
| 🪵 | **Immutable Audit Trail** | Every sensitive mutation logged to `audit_logs` — tamper-evident action history |
| 🔔 | **Notifications** | In-app alerts for reviews, sync failures, mentor notes, and intervention flags |
| ⚙️ | **Sync Engine** | Background workers sync platform accounts with health/stale/failed state tracking |
| 🛡️ | **Security Hardened** | Rate limiting, strict CORS, no stack trace leakage, UUID storage keys |

---

## 🏗️ Architecture

```
cybertrack-nexus/
│
├── backend/                          # ⚡ FastAPI async Python API
│   └── app/
│       ├── main.py                   # App factory · CORS · Rate limiter · Routers
│       ├── api/v1/endpoints/
│       │   ├── auth.py               # 🔑 Login · Logout · /me
│       │   ├── students.py           # 👥 CRUD + bulk import (preview → commit)
│       │   ├── platforms.py          # 🖥️  Platform registry + account linking
│       │   ├── evidence.py           # 📄 File upload · Review workflow · Audit
│       │   └── analytics.py          # 📊 Overview metrics · Platform breakdown
│       ├── models/models.py          # 🗄️  All SQLAlchemy ORM models (PostgreSQL)
│       ├── core/
│       │   ├── config.py             # ⚙️  Pydantic settings (fully env-driven)
│       │   └── dependencies.py       # 🔐 JWT auth + typed RBAC guards
│       ├── db/database.py            # 🐘 Async SQLAlchemy engine + session factory
│       ├── security/jwt.py           # 🔑 Token creation · verification · bcrypt
│       ├── workers/                  # ⚙️  Background sync workers
│       ├── integrations/             # 🌐 External platform API adapters
│       ├── analytics/                # 📈 Computation engines
│       ├── repositories/             # 🗃️  Data access layer
│       └── tests/                    # 🧪 Test suite
│
├── frontend/                         # ⚛️  React + Vite + TypeScript SPA
├── docs/                             # 📖 Architecture & API docs
├── infra/                            # 🐳 Docker / K8s / IaC
└── .github/                          # 🤖 CI/CD GitHub Actions
```

### 🔄 Request Lifecycle

```
Client
  │
  ▼
[CORS Middleware] → [Request-ID Middleware] → [Rate Limiter (slowapi)]
  │
  ▼
[JWT Bearer Auth] → [RBAC Role Guard]
  │
  ▼
[Endpoint Handler] → [Async PostgreSQL Session]
  │
  ▼
[Pydantic Response Model] → JSON Response (with X-Request-ID header)
```

---

## 🗄️ Data Model

```
users
  └── user_roles          (ADMIN | HOD | STAFF | STUDENT)

departments
  └── students
        ├── mentor_assignments  ─────────────────→ users (mentor)
        ├── platform_accounts   ─→ platforms
        │     └── sync_jobs
        ├── progress_snapshots
        ├── learning_activities
        ├── certificates        ─→ platforms
        └── evidence_submissions
              └── verification_reviews ───────────→ users (reviewer)

users ── audit_logs   (immutable action trail)
users ── notifications
```

### Core Entities

| Model | Purpose | Key Fields |
|---|---|---|
| `User` | System users (all roles) | `email`, `identity_provider`, `hashed_password`, `is_active` |
| `UserRole_` | Role assignments + audit | `role`, `granted_by`, `revoked_at` |
| `Department` | Academic departments | `code`, `name`, `is_active` |
| `Student` | Student records | `register_number`, `full_name`, `institutional_email`, `academic_year`, `section` |
| `MentorAssignment` | Staff–student mentoring | `mentor_user_id`, `assigned_by`, `is_active`, `notes` |
| `Platform` | Cyber learning platforms | `slug`, `display_name`, `supported_capabilities` (JSONB), `enabled` |
| `PlatformAccount` | Student ↔ Platform link | `verification_status`, `sync_status`, `last_successful_sync_at` |
| `EvidenceSubmission` | File evidence uploads | `evidence_type`, `object_storage_key`, `submission_status` |
| `VerificationReview` | Staff review decisions | `decision` (APPROVED / REJECTED / NEEDS_REVISION), `reason` |
| `SyncJob` | Platform sync tracking | `status`, `started_at`, `completed_at`, `error_detail` |
| `AuditLog` | Immutable action trail | `actor_user_id`, `action`, `entity_type`, `entity_id` |

---

## 🔐 Security Model

### Role Hierarchy

```
  ┌────────────────────────────────────────────────────────┐
  │  ADMIN     Full system access · user management         │
  │    HOD     Department-wide · mentor assignment          │
  │    STAFF   Only assigned students (SQL-enforced IDOR)   │
  │    STUDENT Own profile + own submissions only           │
  └────────────────────────────────────────────────────────┘
```

| Dependency Guard | Permitted Roles | Applied To |
|---|---|---|
| `CurrentUser` | Any authenticated user | All protected endpoints |
| `RequireAdminOrHOD` | ADMIN, HOD | Student patch · Bulk import |
| `RequireStaffOrAbove` | ADMIN, HOD, STAFF | Analytics · Evidence review |
| `RequireHOD` | HOD only | HOD-exclusive actions |

### Security Hardening Checklist

- ✅ **JWT HS256** — Short-lived access tokens with `use` claim validation
- ✅ **IDOR Prevention** — Staff/Student rows filtered at SQL `WHERE` level, not post-fetch
- ✅ **Rate Limiting** — `slowapi` per-IP throttling on all routes
- ✅ **Zero Stack Trace Leakage** — Global handler returns generic `500`, never internals
- ✅ **Strict CORS** — Whitelisted origins only, per-environment configurable
- ✅ **Secure File Uploads** — Extension allowlist · size cap · UUID-renamed keys (no path traversal)
- ✅ **Production Auth Guard** — Local dev login blocked when `DEV_AUTH_ENABLED=false`
- ✅ **Immutable Audit Log** — Every review, import, and mutation writes to `audit_logs`
- ✅ **Request ID Tracing** — `X-Request-ID` propagated on every response

---

## 🚀 Quick Start

### Prerequisites

| Tool | Min Version |
|---|---|
| Python | 3.11+ |
| PostgreSQL | 14+ |
| Node.js | 18+ |

### 1 · Clone

```bash
git clone https://github.com/nanthishvaran17/cybertrack-nexus.git
cd cybertrack-nexus
```

### 2 · Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate      # Linux / macOS

# Install all dependencies
pip install -e ".[dev]"

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY

# Apply database migrations
alembic upgrade head

# Launch API server (hot-reload)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

| URL | Purpose |
|---|---|
| `http://127.0.0.1:8000/health/live` | Liveness check |
| `http://127.0.0.1:8000/api/docs` | Swagger UI (dev only) |
| `http://127.0.0.1:8000/api/redoc` | ReDoc (dev only) |

### 3 · Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 📡 API Reference

**Base URL:** `/api/v1`

<details>
<summary><b>🔑 Authentication — <code>/auth</code></b></summary>
<br/>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | 🌐 Public | Dev-mode local login → returns JWT bearer token |
| `POST` | `/auth/logout` | 🔒 Bearer | Logout — client discards token; audit recorded |
| `GET` | `/auth/me` | 🔒 Bearer | Current user profile + active roles |

</details>

<details>
<summary><b>👥 Students — <code>/students</code></b></summary>
<br/>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/students` | 🔒 Bearer | Paginated list · full-text search · year/section filters |
| `GET` | `/students/{id}` | 🔒 Bearer | Individual student (IDOR-guarded per role) |
| `PATCH` | `/students/{id}` | 🛡️ Admin/HOD | Update name, year, section, active flag |
| `POST` | `/students/import/preview` | 🛡️ Admin/HOD | Dry-run: validate rows, surface all conflicts |
| `POST` | `/students/import/commit` | 🛡️ Admin/HOD | Transactional bulk insert — all-or-nothing |

</details>

<details>
<summary><b>🖥️ Platforms — <code>/platforms</code> &amp; <code>/platform-accounts</code></b></summary>
<br/>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/platforms` | 🔒 Bearer | List all enabled cyber learning platforms |
| `GET` | `/platforms/{id}/capabilities` | 🔒 Bearer | JSONB capability manifest for a platform |
| `POST` | `/platform-accounts` | 🔒 Bearer | Link a student to a platform account |
| `GET` | `/platform-accounts` | 🔒 Bearer | List linked accounts (filterable by student) |
| `DELETE` | `/platform-accounts/{id}` | 🛡️ Admin/HOD | Soft-delete (deactivate) a platform link |

</details>

<details>
<summary><b>📄 Evidence — <code>/evidence</code></b></summary>
<br/>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/evidence` | 🔒 Bearer | Upload file evidence (PDF · PNG · JPG, size-capped) |
| `GET` | `/evidence` | 🔒 Bearer | List submissions (filter by student / status) |
| `POST` | `/evidence/{id}/review` | 🛡️ Staff+ | Approve · Reject · Request revision + writes audit log |

</details>

<details>
<summary><b>📊 Analytics — <code>/analytics</code></b></summary>
<br/>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/analytics/overview` | 🛡️ Staff+ | Active students · certs · sync success rate · platform adoption |
| `GET` | `/analytics/platforms` | 🛡️ Staff+ | Per-platform linked account counts |

</details>

<details>
<summary><b>🏥 Health Checks</b></summary>
<br/>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health/live` | Liveness — `200 OK` if server is running |
| `GET` | `/health/ready` | Readiness — checks live DB connectivity |

</details>

---

## ⚙️ Environment Reference

```env
# ── Application ────────────────────────────────────────
APP_NAME=CyberTrack Nexus
APP_VERSION=0.1.0
ENVIRONMENT=development              # development | staging | production

# ── Database ───────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/cybertrack

# ── Security ───────────────────────────────────────────
SECRET_KEY=change-me-to-32-random-chars
ACCESS_TOKEN_EXPIRE_MINUTES=60
DEV_AUTH_ENABLED=true                # ⚠️  Always false in production

# ── CORS ───────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# ── API ────────────────────────────────────────────────
API_V1_PREFIX=/api/v1

# ── Storage ────────────────────────────────────────────
STORAGE_BACKEND=local                # local | s3
LOCAL_STORAGE_PATH=./uploads
MAX_UPLOAD_SIZE_MB=10
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **API Framework** | FastAPI (async) | Auto OpenAPI · async-native · type-safe |
| **ORM** | SQLAlchemy 2.x async | Fully typed · composable queries |
| **Database** | PostgreSQL + asyncpg | JSONB · constraints · foreign keys |
| **Migrations** | Alembic | Version-controlled schema evolution |
| **Auth** | python-jose + passlib | JWT HS256 · bcrypt hashing |
| **Validation** | Pydantic v2 | Request/response enforcement |
| **Rate Limiting** | slowapi | Per-IP request throttling |
| **Logging** | structlog | Structured JSON log events |
| **ASGI Server** | Uvicorn | Production-grade async server |
| **Frontend** | React + Vite + TypeScript | SPA with type safety and fast HMR |

---

## 🌐 Supported Cyber Platforms

The platform registry is fully extensible via the `supported_capabilities` JSONB field:

| Platform | Focus Area | Tracked Metrics |
|---|---|---|
| 🔴 TryHackMe | Beginner–Intermediate labs | Room completions · XP · Daily streak |
| ⬛ Hack The Box | Advanced penetration testing | Machine solves · Pro rank · Blood |
| 🟡 LeetCode | Competitive programming | Rating · Problems solved · Contest rank |
| 🟢 Coursera / edX | MOOCs & specialisations | Course completions · Certificates |
| 🔵 Cisco NetAcad | Network fundamentals | Module progress · Badge earn |
| 🟠 CompTIA / EC-Council | Industry certifications | Certificate upload · Verification status |

---

## 🤝 Contributing

We welcome contributions from faculty, students, and the open-source community!

```bash
# Fork & clone
git clone https://github.com/<your-username>/cybertrack-nexus.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Commit using conventional commits
git commit -m "feat: describe your change"

# Push and open a Pull Request
git push origin feature/your-feature-name
```

### Commit Convention

| Prefix | When to use |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change without feature/fix |
| `test:` | Adding or updating tests |
| `chore:` | Build tooling / dependencies |
| `security:` | Security fix or hardening |

---

## 🏫 Institution

<div align="center">

**Nandha Engineering College**  
Department of Computer Science & Engineering (Cyber Security)  
Erode, Tamil Nadu, India  

*Affiliated to Anna University · Approved by AICTE*

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by the CSE team at Nandha Engineering College**

*Empowering every cybersecurity student to track, prove, and grow their skills.*

<br/>

[![Stars](https://img.shields.io/github/stars/nanthishvaran17/cybertrack-nexus?style=social)](https://github.com/nanthishvaran17/cybertrack-nexus/stargazers)
[![Forks](https://img.shields.io/github/forks/nanthishvaran17/cybertrack-nexus?style=social)](https://github.com/nanthishvaran17/cybertrack-nexus/fork)

⭐ **Star this repo** if CyberTrack Nexus helps your institution!

</div>
