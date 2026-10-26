"""Backend API integration tests — Phase 1 core flows."""
from __future__ import annotations

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


# ── Health checks ─────────────────────────────────────────────────────────────

class TestHealth:
    async def test_liveness(self, client: AsyncClient):
        res = await client.get("/health/live")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert "version" in data

    async def test_readiness_returns_status_key(self, client: AsyncClient):
        res = await client.get("/health/ready")
        data = res.json()
        assert "status" in data
        assert "db" in data


# ── Auth ──────────────────────────────────────────────────────────────────────

class TestAuth:
    async def test_me_requires_auth(self, client: AsyncClient):
        res = await client.get("/api/v1/auth/me")
        assert res.status_code == 401

    async def test_login_rejects_wrong_credentials(self, client: AsyncClient):
        res = await client.post(
            "/api/v1/auth/login",
            json={"email": "notexist@test.com", "password": "wrong"},
        )
        assert res.status_code == 401
        data = res.json()
        # Must not leak internal details
        assert "detail" in data
        assert "sql" not in data["detail"].lower()
        assert "traceback" not in data["detail"].lower()

    async def test_login_with_bad_email_format(self, client: AsyncClient):
        res = await client.post(
            "/api/v1/auth/login",
            json={"email": "not-an-email", "password": "anything"},
        )
        assert res.status_code == 422

    async def test_logout_requires_auth(self, client: AsyncClient):
        res = await client.post("/api/v1/auth/logout")
        assert res.status_code == 401


# ── Students ──────────────────────────────────────────────────────────────────

class TestStudents:
    async def test_list_students_requires_auth(self, client: AsyncClient):
        res = await client.get("/api/v1/students")
        assert res.status_code == 401

    async def test_get_student_requires_auth(self, client: AsyncClient):
        fake_id = "00000000-0000-0000-0000-000000000000"
        res = await client.get(f"/api/v1/students/{fake_id}")
        assert res.status_code == 401

    async def test_import_preview_requires_auth(self, client: AsyncClient):
        res = await client.post(
            "/api/v1/students/import/preview",
            json={"rows": [], "department_id": "00000000-0000-0000-0000-000000000000"},
        )
        assert res.status_code == 401


# ── Platforms ─────────────────────────────────────────────────────────────────

class TestPlatforms:
    async def test_list_platforms_requires_auth(self, client: AsyncClient):
        res = await client.get("/api/v1/platforms")
        assert res.status_code == 401


# ── Evidence ──────────────────────────────────────────────────────────────────

class TestEvidence:
    async def test_list_evidence_requires_auth(self, client: AsyncClient):
        res = await client.get("/api/v1/evidence")
        assert res.status_code == 401

    async def test_review_evidence_requires_auth(self, client: AsyncClient):
        fake_id = "00000000-0000-0000-0000-000000000000"
        res = await client.post(
            f"/api/v1/evidence/{fake_id}/review",
            json={"decision": "approved"},
        )
        assert res.status_code == 401


# ── Analytics ─────────────────────────────────────────────────────────────────

class TestAnalytics:
    async def test_overview_requires_auth(self, client: AsyncClient):
        res = await client.get("/api/v1/analytics/overview")
        assert res.status_code == 401

    async def test_no_stack_traces_in_errors(self, client: AsyncClient):
        res = await client.get("/api/v1/students/not-a-uuid")
        # Should return 401 (no auth) not 422/500 with traceback
        data = res.json()
        assert "traceback" not in str(data).lower()
        assert "sqlalchemy" not in str(data).lower()
