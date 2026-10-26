"""Database seed script — run once after migrations to bootstrap initial data.

Usage:
    python -m app.db.seed

Creates:
  - CSE (Cyber Security) department
  - HOD user account (email + hashed password)
  - All 4 cybersecurity learning platforms
"""
from __future__ import annotations

import asyncio
import os

from sqlalchemy import select

# Load .env before importing settings
from dotenv import load_dotenv
load_dotenv()

from app.db.database import AsyncSessionLocal
from app.models.models import Department, Platform, User, UserRole, UserRole_
from app.security.jwt import hash_password


PLATFORMS = [
    {
        "slug": "cisco_netacad",
        "display_name": "Cisco Networking Academy",
        "website_url": "https://www.netacad.com",
        "enabled": True,
        "supported_capabilities": {
            "api_sync": False,
            "manual_certificate_upload": True,
            "course_tracking": False,
            "notes": "No public API available. Students upload certificates manually.",
        },
    },
    {
        "slug": "tryhackme",
        "display_name": "TryHackMe",
        "website_url": "https://tryhackme.com",
        "enabled": True,
        "supported_capabilities": {
            "api_sync": True,
            "profile_fetch": True,
            "room_completion": True,
            "points": True,
            "manual_certificate_upload": True,
            "notes": "Public API available for profile and progress data.",
        },
    },
    {
        "slug": "hackthebox",
        "display_name": "Hack The Box",
        "website_url": "https://www.hackthebox.com",
        "enabled": True,
        "supported_capabilities": {
            "api_sync": False,
            "manual_certificate_upload": True,
            "academy_modules": False,
            "notes": "HTB API requires organisation-level access. Manual submission until API access is confirmed.",
        },
    },
    {
        "slug": "portswigger",
        "display_name": "PortSwigger Web Security Academy",
        "website_url": "https://portswigger.net/web-security",
        "enabled": True,
        "supported_capabilities": {
            "api_sync": False,
            "manual_certificate_upload": True,
            "lab_tracking": False,
            "notes": "No public API. Students upload lab completion evidence manually.",
        },
    },
]


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        # ── Department ────────────────────────────────────────────────────
        dept_res = await db.execute(
            select(Department).where(Department.code == "CSE-CS")
        )
        dept = dept_res.scalar_one_or_none()
        if not dept:
            dept = Department(
                code="CSE-CS",
                name="CSE (Cyber Security)",
                is_active=True,
            )
            db.add(dept)
            await db.flush()
            print(f"[+] Created department: {dept.name}")
        else:
            print(f"  Department already exists: {dept.name}")

        # ── HOD user ──────────────────────────────────────────────────────
        hod_email = os.getenv("SEED_HOD_EMAIL", "hod@nandhaengg.edu.in")
        hod_pw = os.getenv("SEED_HOD_PASSWORD", "ChangeMe@123")

        user_res = await db.execute(select(User).where(User.email == hod_email))
        hod = user_res.scalar_one_or_none()
        if not hod:
            hod = User(
                identity_provider="dev_local",
                provider_subject=hod_email,
                email=hod_email,
                display_name="Department HOD",
                hashed_password=hash_password(hod_pw),
                is_active=True,
            )
            db.add(hod)
            await db.flush()

            role = UserRole_(user_id=hod.id, role=UserRole.HOD, granted_by=hod.id)
            db.add(role)
            print(f"[+] Created HOD user: {hod_email} (password: {hod_pw})")
        else:
            print(f"  HOD user already exists: {hod_email}")

        # ── Platforms ─────────────────────────────────────────────────────
        for p_data in PLATFORMS:
            res = await db.execute(
                select(Platform).where(Platform.slug == p_data["slug"])
            )
            existing = res.scalar_one_or_none()
            if not existing:
                platform = Platform(**p_data)
                db.add(platform)
                print(f"[+] Created platform: {p_data['display_name']}")
            else:
                print(f"  Platform already exists: {p_data['display_name']}")

        await db.commit()
        print("\n[SUCCESS] Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
