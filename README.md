<div align="center">

![CyberTrack Nexus](docs/assets/banner.jpg)

<br/>

<p>
  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-Async-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/></a>
  <a href="https://postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-16+-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/></a>
  <img src="https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge" alt="MIT"/>
  <img src="https://img.shields.io/badge/Status-Active_Development-00E676?style=for-the-badge" alt="Active"/>
</p>

<h1>🛡️ CyberTrack Nexus</h1>

<h3>Cybersecurity Education Intelligence Platform</h3>
<p><b>Nandha Engineering College — Dept. of Computer Science &amp; Engineering (Cyber Security)</b></p>
<p><i>Production-grade · Role-aware · Real-time · Built for educators, by engineers.</i></p>
<br/>

> Tracks every student's cybersecurity journey across **TryHackMe, Hack The Box, PortSwigger, and Cisco NetAcad** — with mentor workflows, evidence verification, and live analytics — all behind a hardened JWT API.

<br/>

| [📖 API Reference](#-api-reference) | [🚀 Quick Start](#-quick-start) | [🏗️ Architecture](#️-architecture) | [🗄️ Data Model](#️-data-model) | [🔐 Security](#-security-model) | [🤝 Contributing](#-contributing) |
|:---:|:---:|:---:|:---:|:---:|:---:|

</div>

---

## ✨ Platform Overview

**CyberTrack Nexus** is an institutional intelligence system for cybersecurity education departments. It aggregates student learning activity from leading platforms, manages evidence submissions through a structured review pipeline, orchestrates mentor–student workflows, and delivers live analytics — all from a single, secured dashboard.

<br/>

## 🎯 Feature Matrix

| Module | Status | Description |
|---|:---:|---|
| 🎓 **Student Registry** | ✅ Live | Bulk CSV import · paginated search · department isolation · section/year filters |
| 🔗 **Platform Linking** | ✅ Live | Link TryHackMe, HTB, PortSwigger, Cisco NetAcad accounts with verification lifecycle |
| 📄 **Evidence Management** | ✅ Live | Students upload PDF/PNG/JPG; staff review via Approve · Reject · Needs Revision |
| 🧑‍🏫 **Mentor Workspace** | ✅ Live | HOD assigns mentors; staff see only assigned students — IDOR-enforced at SQL level |
| 📊 **Analytics Dashboard** | ✅ Live | Live metrics: active students, platform adoption, sync health, verified certs |
| 🔒 **4-Tier RBAC** | ✅ Live | Admin → HOD → Staff → Student — every endpoint independently role-guarded |
| 🪵 **Audit Trail** | ✅ Live | Immutable `audit_logs` — every mutation, review, and import captured |
| 🔔 **Notifications** | ✅ Live | In-app alerts: reviews, sync failures, mentor notes, intervention flags |
| ⚙️ **Sync Engine** | 🔄 In Progress | Background workers for platform API polling with health/stale/failed states |
| 🌐 **Integration Health** | 🔄 In Progress | Sync job history, error diagnostics, retry management |
| 📜 **Certifications** | 🔄 In Progress | Certificate verification tracking across all platforms |
| ⚙️ **Settings & Admin** | 🔄 In Progress | Department config, platform management, user administration |

---

## 🏗️ Architecture

### System Layout

```
cybertrack-nexus/
│
├── backend/                           # ⚡ FastAPI async Python API (Port 8000)
│   └── app/
│       ├── main.py                    # App factory · CORS · Rate limiter · Routers
│       ├── api/v1/endpoints/
│       │   ├── auth.py                # 🔑 Login · Logout · /me
│       │   ├── students.py            # 👥 List · Get · Patch · Import preview/commit
│       │   ├── platforms.py           # 🖥️  Registry · Account link/unlink
│       │   ├── evidence.py            # 📄 Upload · List · Review (approve/reject)
│       │   └── analytics.py           # 📊 Overview metrics · Platform breakdown
│       ├── models/models.py           # 🗄️  Complete SQLAlchemy ORM schema
│       ├── core/
│       │   ├── config.py              # ⚙️  Pydantic settings (fully env-driven)
│       │   └── dependencies.py        # 🔐 JWT auth + typed RBAC dependency guards
│       ├── db/
│       │   ├── database.py            # 🐘 Async SQLAlchemy engine + session factory
│       │   └── seed.py                # 🌱 Bootstrap: dept + HOD + all 4 platforms
│       ├── security/jwt.py            # 🔑 Token creation · verification · bcrypt
│       ├── workers/                   # ⚙️  Async background sync task workers
│       ├── integrations/              # 🌐 Platform API adapter layer
│       ├── analytics/                 # 📈 Metric computation engines
│       ├── repositories/              # 🗃️  Complex query / data access patterns
│       ├── services/                  # 💼 Business logic layer
│       └── tests/                     # 🧪 Test suite
│
├── frontend/                          # ⚛️  React 18 + Vite + TypeScript (Port 5173)
│   └── src/
│       ├── App.tsx                    # Router + auth guards + QueryClient
│       ├── pages/
│       │   ├── LoginPage.tsx          # Public — JWT login form
│       │   ├── OverviewPage.tsx       # Dashboard home (/)
│       │   ├── StudentsPage.tsx       # Student list + import (/students)
│       │   ├── PlatformsPage.tsx      # Platform accounts (/platforms)
│       │   ├── EvidencePage.tsx       # Evidence upload + review (/evidence)
│       │   └── AnalyticsPage.tsx      # Analytics charts (/analytics)
│       ├── features/auth/             # AuthContext + useAuth hook
│       ├── components/layout/         # AppShell · Sidebar · TopBar
│       └── lib/                       # API client · utilities · TypeScript types
│
├── docs/assets/                       # 📖 Banner image + architecture diagrams
├── infra/                             # 🐳 Docker / K8s / Infrastructure-as-Code
└── .github/                           # 🤖 CI/CD GitHub Actions workflows
```

### Request Lifecycle

```mermaid
flowchart LR
    C([Browser / API Client])

    subgraph MW["Middleware Stack"]
        direction TB
        A[CORS Middleware] --> B[Request-ID Injector]
        B --> R[Rate Limiter slowapi]
    end

    subgraph AUTH["Auth & RBAC"]
        direction TB
        J[JWT Bearer Decode] --> RG[Role Guard
Admin · HOD · Staff · Student]
    end

    subgraph APP["Application Layer"]
        direction TB
        E[Endpoint Handler] --> DB[(PostgreSQL
async session)]
        DB --> P[Pydantic
Response Model]
    end

    C --> MW --> AUTH --> APP
    APP --> RESP([JSON Response
+ X-Request-ID header])
```

---

## 🗄️ Data Model

### Entity Relationship Diagram

```mermaid
erDiagram
    users {
        uuid id PK
        string identity_provider
        string email UK
        string hashed_password
        bool is_active
    }
    user_roles {
        uuid id PK
        uuid user_id FK
        enum role
        uuid granted_by FK
        datetime revoked_at
    }
    departments {
        uuid id PK
        string code UK
        string name
        bool is_active
    }
    students {
        uuid id PK
        uuid user_id FK
        string register_number
        string full_name
        string institutional_email UK
        int academic_year
        string section
        uuid department_id FK
        bool is_active
    }
    mentor_assignments {
        uuid id PK
        uuid student_id FK
        uuid mentor_user_id FK
        uuid assigned_by FK
        bool is_active
        text notes
    }
    platforms {
        uuid id PK
        string slug UK
        string display_name
        bool enabled
        jsonb supported_capabilities
        string website_url
    }
    platform_accounts {
        uuid id PK
        uuid student_id FK
        uuid platform_id FK
        string external_username
        enum verification_status
        enum sync_status
        datetime last_successful_sync_at
    }
    sync_jobs {
        uuid id PK
        uuid platform_account_id FK
        string status
        datetime started_at
        datetime completed_at
        text error_detail
    }
    evidence_submissions {
        uuid id PK
        uuid student_id FK
        uuid platform_id FK
        enum evidence_type
        string object_storage_key
        string original_filename
        int file_size_bytes
        enum submission_status
    }
    verification_reviews {
        uuid id PK
        uuid evidence_submission_id FK
        uuid reviewer_user_id FK
        enum decision
        text reason
    }
    certificates {
        uuid id PK
        uuid student_id FK
        uuid platform_id FK
        enum verification_status
    }
    audit_logs {
        uuid id PK
        uuid actor_user_id FK
        string action
        string entity_type
        string entity_id
        jsonb permitted_context
    }
    notifications {
        uuid id PK
        uuid recipient_user_id FK
        enum notification_type
        bool is_read
    }

    users ||--o{ user_roles : "has roles"
    users ||--o{ mentor_assignments : "mentors"
    users ||--o{ audit_logs : "actor"
    users ||--o{ notifications : "receives"
    departments ||--o{ students : "contains"
    students ||--o{ mentor_assignments : "assigned to"
    students ||--o{ platform_accounts : "linked to"
    students ||--o{ evidence_submissions : "submits"
    students ||--o{ certificates : "earns"
    platforms ||--o{ platform_accounts : "used by"
    platforms ||--o{ certificates : "issues"
    platform_accounts ||--o{ sync_jobs : "synced via"
    evidence_submissions ||--o{ verification_reviews : "reviewed by"
```

### Core Entities at a Glance

| Model | Key Fields |
|---|---|
| `User` | `email`, `identity_provider`, `hashed_password`, `is_active` |
| `UserRole_` | `role` (ADMIN/HOD/STAFF/STUDENT), `granted_by`, `revoked_at` |
| `Department` | `code` (CSE-CS), `name`, `is_active` |
| `Student` | `register_number`, `full_name`, `institutional_email`, `academic_year`, `section` |
| `MentorAssignment` | `mentor_user_id`, `assigned_by`, `is_active`, `notes` |
| `Platform` | `slug`, `display_name`, `supported_capabilities` (JSONB), `enabled` |
| `PlatformAccount` | `verification_status`, `sync_status`, `last_successful_sync_at` |
| `SyncJob` | `status`, `started_at`, `completed_at`, `error_detail` |
| `EvidenceSubmission` | `evidence_type`, `object_storage_key`, `submission_status` |
| `VerificationReview` | `decision` (APPROVED/REJECTED/NEEDS_REVISION), `reason` |
| `AuditLog` | `actor_user_id`, `action`, `entity_type`, `entity_id` |

---

## 🔐 Security Model

### Role Hierarchy

```mermaid
flowchart TD
    A["🔴 ADMIN
Full system access · User management"]
    B["🟠 HOD
Department-wide · Mentor assignment · Import"]
    C["🟡 STAFF
Only assigned students · Evidence review · Analytics"]
    D["🟢 STUDENT
Own profile · Own submissions · Own platform links"]

    A --> B --> C --> D
```

### RBAC Dependency Guards

| Guard | Permitted Roles | Applied On |
|---|---|---|
| `CurrentUser` | Any authenticated user | All protected endpoints |
| `RequireAdminOrHOD` | ADMIN, HOD | Student PATCH · Bulk Import · Platform unlink |
| `RequireStaffOrAbove` | ADMIN, HOD, STAFF | Analytics · Evidence review |
| `RequireHOD` | HOD only | HOD-exclusive administrative actions |

### Security Hardening

| Control | Implementation |
|---|---|
| ✅ JWT HS256 | Short-lived access tokens with `use` claim; `python-jose` |
| ✅ IDOR Prevention | Staff/Student rows filtered at SQL `WHERE` level — never post-fetch |
| ✅ Rate Limiting | `slowapi` per-IP throttling on every route |
| ✅ Zero Leakage | Global `@exception_handler` returns generic `500` — no stack traces |
| ✅ Strict CORS | Allowlist-only origins; per-environment configurable |
| ✅ Secure Uploads | Extension allowlist (`.pdf .png .jpg .jpeg`) · size cap · UUID storage keys |
| ✅ Production Guard | `DEV_AUTH_ENABLED=false` disables local login entirely |
| ✅ Audit Trail | Every review, import, and mutation writes to `audit_logs` |
| ✅ Request Tracing | `X-Request-ID` injected on every response for distributed tracing |

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Link |
|---|---|---|
| Python | 3.11+ | [python.org](https://python.org) |
| PostgreSQL | 14+ | [postgresql.org](https://postgresql.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |

### Step 1 — Clone

```bash
git clone https://github.com/nanthishvaran17/cybertrack-nexus.git
cd cybertrack-nexus
```

### Step 2 — Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate    # Linux / macOS

# Install all dependencies
pip install -e ".[dev]"

# Configure environment
cp .env.example .env
# ✏️  Edit .env — fill in DATABASE_URL and SECRET_KEY

# Run database migrations
alembic upgrade head

# Seed initial data (department + HOD user + 4 platforms)
python -m app.db.seed

# Launch API (hot-reload)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

| URL | Description |
|---|---|
| `http://127.0.0.1:8000/health/live` | ✅ Liveness probe |
| `http://127.0.0.1:8000/health/ready` | ✅ Readiness + DB check |
| `http://127.0.0.1:8000/api/docs` | 📖 Swagger UI (dev only) |
| `http://127.0.0.1:8000/api/redoc` | 📖 ReDoc (dev only) |

> **Default HOD login after seed:**  
> Email: `hod@nandhaengg.edu.in` · Password: `ChangeMe@123` *(change immediately)*

### Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Frontend Pages

| Route | Page | Access |
|---|---|---|
| `/login` | Login Form | 🌐 Public |
| `/` | Overview Dashboard | 🔒 All roles |
| `/students` | Student Registry + Import | 🔒 All roles |
| `/platforms` | Platform Account Manager | 🔒 All roles |
| `/evidence` | Evidence Upload + Review | 🔒 All roles |
| `/analytics` | Analytics Dashboard | 🛡️ Staff+ |
| `/mentor` | Mentor Workspace | 🛡️ Staff+ |
| `/certifications` | Certificate Tracker | 🔒 All roles |
| `/integrations` | Platform Sync Health | 🛡️ Admin/HOD |
| `/audit` | Audit Log Viewer | 🛡️ HOD only |
| `/settings` | System Settings | 🛡️ Admin/HOD |

---

## 📡 API Reference

**Base URL:** `http://localhost:8000/api/v1`

<details>
<summary><b>🔑 Authentication — <code>/auth</code></b></summary>
<br/>

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/auth/login` | 🌐 Public | Email + password → JWT bearer token |
| `POST` | `/auth/logout` | 🔒 Bearer | Logout (stateless; client discards token) |
| `GET` | `/auth/me` | 🔒 Bearer | Authenticated user profile + active roles |

**Login example:**
```json
POST /api/v1/auth/login
{
  "email": "hod@nandhaengg.edu.in",
  "password": "ChangeMe@123"
}
```
</details>

<details>
<summary><b>👥 Students — <code>/students</code></b></summary>
<br/>

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/students` | 🔒 Bearer | Paginated list · full-text search · year/section/active filters |
| `GET` | `/students/{id}` | 🔒 Bearer | Get student by ID (IDOR-guarded per role) |
| `PATCH` | `/students/{id}` | 🛡️ Admin/HOD | Update name, year, section, active status |
| `POST` | `/students/import/preview` | 🛡️ Admin/HOD | Dry-run CSV rows — surface all conflicts |
| `POST` | `/students/import/commit` | 🛡️ Admin/HOD | Transactional bulk insert (all-or-nothing) |

**Query params for `GET /students`:**  
`page` · `page_size` · `search` · `academic_year` · `section` · `is_active`
</details>

<details>
<summary><b>🖥️ Platforms — <code>/platforms</code> &amp; <code>/platform-accounts</code></b></summary>
<br/>

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/platforms` | 🔒 Bearer | List all enabled platforms with capabilities |
| `GET` | `/platforms/{id}/capabilities` | 🔒 Bearer | JSONB capability manifest for a platform |
| `POST` | `/platform-accounts` | 🔒 Bearer | Link a student to a platform account |
| `GET` | `/platform-accounts` | 🔒 Bearer | List linked accounts (filterable by `student_id`) |
| `DELETE` | `/platform-accounts/{id}` | 🛡️ Admin/HOD | Soft-delete (deactivate) a platform link |

**Seeded Platforms:**

| Platform | Slug | API Sync | Manual Upload |
|---|---|:---:|:---:|
| Cisco Networking Academy | `cisco_netacad` | ❌ | ✅ |
| TryHackMe | `tryhackme` | ✅ | ✅ |
| Hack The Box | `hackthebox` | ❌ | ✅ |
| PortSwigger Web Security Academy | `portswigger` | ❌ | ✅ |
</details>

<details>
<summary><b>📄 Evidence — <code>/evidence</code></b></summary>
<br/>

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/evidence` | 🔒 Bearer | Upload evidence file (PDF · PNG · JPG · JPEG, max `MAX_UPLOAD_SIZE_MB`) |
| `GET` | `/evidence` | 🔒 Bearer | List submissions (filter by `student_id`, `submission_status`) |
| `POST` | `/evidence/{id}/review` | 🛡️ Staff+ | Review decision + reason; writes audit log entry |

**Evidence types:** `certificate` · `lab_completion` · `course_completion` · `achievement` · `other`  
**Review decisions:** `approved` → `VERIFIED` · `rejected` → `REJECTED` · `needs_revision`
</details>

<details>
<summary><b>📊 Analytics — <code>/analytics</code></b></summary>
<br/>

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/analytics/overview` | 🛡️ Staff+ | Active students · verified certs · sync success rate · platform adoption |
| `GET` | `/analytics/platforms` | 🛡️ Staff+ | Per-platform linked account counts |

**Overview response fields:**  
`total_active_students` · `students_with_linked_platforms` · `verified_certificates` · `pending_evidence` · `sync_success_rate` · `platform_adoption[]`
</details>

<details>
<summary><b>🏥 Health Checks</b></summary>
<br/>

| Method | Endpoint | Response |
|---|---|---|
| `GET` | `/health/live` | `{"status":"ok","version":"0.1.0"}` |
| `GET` | `/health/ready` | `{"status":"ready","db":"ok"}` or `503` if DB unavailable |
</details>

---

## ⚙️ Environment Configuration

```env
# ── Application ────────────────────────────────────────────────────
APP_NAME=CyberTrack Nexus
APP_VERSION=0.1.0
ENVIRONMENT=development           # development | staging | production

# ── Database ───────────────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/cybertrack

# ── Security ───────────────────────────────────────────────────────
SECRET_KEY=change-me-to-32-random-chars   # python -c "import secrets; print(secrets.token_hex(32))"
ACCESS_TOKEN_EXPIRE_MINUTES=60
DEV_AUTH_ENABLED=true             # ⚠️  MUST be false in production

# ── CORS ───────────────────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# ── API ────────────────────────────────────────────────────────────
API_V1_PREFIX=/api/v1

# ── Storage ────────────────────────────────────────────────────────
STORAGE_BACKEND=local             # local | s3
LOCAL_STORAGE_PATH=./uploads
MAX_UPLOAD_SIZE_MB=10

# ── Seed (optional) ────────────────────────────────────────────────
SEED_HOD_EMAIL=hod@nandhaengg.edu.in
SEED_HOD_PASSWORD=ChangeMe@123
```

> Generate a secure key: `python -c "import secrets; print(secrets.token_hex(32))"`

---

## 🛠️ Tech Stack

### Backend

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| API Framework | **FastAPI** | 0.100+ | Async REST · auto OpenAPI docs |
| ORM | **SQLAlchemy** | 2.x async | Type-safe queries · composable filters |
| Database | **PostgreSQL + asyncpg** | 16+ | JSONB · constraints · UUID primary keys |
| Migrations | **Alembic** | Latest | Version-controlled schema evolution |
| Auth | **python-jose + passlib** | Latest | JWT HS256 · bcrypt password hashing |
| Validation | **Pydantic** | v2 | Request/response schema enforcement |
| Rate Limiting | **slowapi** | Latest | Per-IP request throttling |
| Logging | **structlog** | Latest | Structured JSON log events |
| ASGI Server | **Uvicorn** | Latest | Production async server |

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| Framework | **React 18** | Component UI with hooks |
| Build Tool | **Vite 5** | Fast dev server + HMR |
| Language | **TypeScript** | Type-safe client code |
| Routing | **React Router v6** | Client-side navigation |
| Data Fetching | **TanStack Query** | Server state management + caching |
| Styling | **Tailwind CSS** | Utility-first CSS with dark mode |

---

## 🌐 Supported Cyber Platforms

| Platform | Slug | API Sync | Manual Upload | Notes |
|---|---|:---:|:---:|---|
| 🔵 **Cisco Networking Academy** | `cisco_netacad` | ❌ | ✅ | No public API — manual cert upload |
| 🔴 **TryHackMe** | `tryhackme` | ✅ | ✅ | Public API: profile, room completions, XP, points |
| ⬛ **Hack The Box** | `hackthebox` | ❌ | ✅ | Org-level API required; manual until confirmed |
| 🟠 **PortSwigger Web Security** | `portswigger` | ❌ | ✅ | No public API — lab completion evidence upload |

> More platforms can be added via the platform registry without code changes.

---

## 🤝 Contributing

We welcome contributions from faculty, students, and the open-source community!

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/cybertrack-nexus.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and write tests

# 4. Commit using conventional commits
git commit -m "feat: describe your change clearly"

# 5. Push and open a Pull Request
git push origin feature/your-feature-name
```

### Commit Convention

| Prefix | Usage |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation update |
| `refactor:` | Code restructure (no feature/fix) |
| `test:` | New or updated tests |
| `chore:` | Build tooling / dependencies |
| `security:` | Security fix or hardening |

### Good First Issues

- Add pagination to `/evidence` endpoint
- Implement token denylist for logout (Redis or DB)
- Write `pytest` test coverage for auth endpoints
- Add TryHackMe API sync integration
- Build mentor assignment endpoint

---

## 🏫 About

<div align="center">

**Nandha Engineering College**  
Department of Computer Science & Engineering (Cyber Security)  
Erode, Tamil Nadu, India  
*Affiliated to Anna University · Approved by AICTE*

</div>

---

## 📄 License

Licensed under the **MIT License** — see [LICENSE](LICENSE) for full text.

---

<div align="center">

**Built with ❤️ for cybersecurity education**

*Empowering every student at Nandha Engineering College to track, prove, and grow their skills.*

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/nanthishvaran17/cybertrack-nexus?style=social)](https://github.com/nanthishvaran17/cybertrack-nexus/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/nanthishvaran17/cybertrack-nexus?style=social)](https://github.com/nanthishvaran17/cybertrack-nexus/fork)
[![GitHub Issues](https://img.shields.io/github/issues/nanthishvaran17/cybertrack-nexus?style=social)](https://github.com/nanthishvaran17/cybertrack-nexus/issues)

⭐ **Star this repo** if CyberTrack Nexus inspires your institution!

</div>
