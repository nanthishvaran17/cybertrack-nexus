"""Comprehensive seed script for CyberTrack Nexus.
Populates:
- Department
- HOD and Faculty Staff (Mentors)
- Learning platforms
- 8 Sample Cybersecurity Students
- Platform Accounts (TryHackMe, NetAcad, HTB, PortSwigger)
- Mentor Assignments
- Certificates
- Evidence Submissions
- Sync Jobs
- Notifications
- Audit Logs
"""
from __future__ import annotations

import asyncio
import os
import uuid
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.models import (
    Department, User, UserRole, UserRole_, Platform, Student,
    PlatformAccount, MentorAssignment, Certificate, EvidenceSubmission,
    SyncJob, Notification, AuditLog, VerificationStatus, SyncStatus,
    EvidenceType, ReviewDecision, NotificationType
)
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
            "notes": "Manual certificate verification pipeline active.",
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
            "notes": "Full REST API sync enabled for room badges and points.",
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
            "notes": "HTB Academy and CTF verification active.",
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
            "notes": "Practitioner exam and lab completion certificates supported.",
        },
    },
]

DEMO_STUDENTS = [
    {
        "register_number": "731622CSR021",
        "full_name": "Dharun Kumar S",
        "institutional_email": "731622csr021@nandhaengg.edu.in",
        "academic_year": 3,
        "section": "A",
        "thm_user": "dharun_sec",
        "htb_user": "dharun_htb",
        "cert_title": "Pre-Security Learning Path",
        "cert_org": "TryHackMe",
        "cred_id": "THM-PRESEC-948123",
        "cert_status": VerificationStatus.VERIFIED,
    },
    {
        "register_number": "731622CSR045",
        "full_name": "Kavitha R",
        "institutional_email": "731622csr045@nandhaengg.edu.in",
        "academic_year": 3,
        "section": "B",
        "thm_user": "kavitha_cyber",
        "htb_user": "kavitha_r",
        "cert_title": "Introduction to Cybersecurity",
        "cert_org": "Cisco Networking Academy",
        "cred_id": "CSCO-NETACAD-44120",
        "cert_status": VerificationStatus.VERIFIED,
    },
    {
        "register_number": "731621CSR008",
        "full_name": "Arunmozhi Varman M",
        "institutional_email": "731621csr008@nandhaengg.edu.in",
        "academic_year": 4,
        "section": "A",
        "thm_user": "arun_varman",
        "htb_user": "arunmozhi_htb",
        "cert_title": "Certified Ethical Hacker (v12)",
        "cert_org": "EC-Council",
        "cred_id": "ECC-CEH-884920",
        "cert_status": VerificationStatus.VERIFIED,
    },
    {
        "register_number": "731623CSR089",
        "full_name": "Santhosh Kumar P",
        "institutional_email": "731623csr089@nandhaengg.edu.in",
        "academic_year": 2,
        "section": "A",
        "thm_user": "santhosh_p",
        "htb_user": None,
        "cert_title": "Jr Penetration Tester Path",
        "cert_org": "TryHackMe",
        "cred_id": "THM-JRPT-552194",
        "cert_status": VerificationStatus.AWAITING,
    },
    {
        "register_number": "731622CSR025",
        "full_name": "Deepa Lakshmi V",
        "institutional_email": "731622csr025@nandhaengg.edu.in",
        "academic_year": 3,
        "section": "A",
        "thm_user": "deepa_sec",
        "htb_user": "deepa_htb",
        "cert_title": "AWS Certified Security - Specialty",
        "cert_org": "Amazon Web Services",
        "cred_id": "AWS-SEC-9923812",
        "cert_status": VerificationStatus.AWAITING,
    },
    {
        "register_number": "731621CSR112",
        "full_name": "Vigneshwaran K",
        "institutional_email": "731621csr112@nandhaengg.edu.in",
        "academic_year": 4,
        "section": "B",
        "thm_user": "vicky_cyber",
        "htb_user": "vignesh_htb",
        "cert_title": "CompTIA Security+ (SY0-701)",
        "cert_org": "CompTIA",
        "cred_id": "COMP-SEC-77312",
        "cert_status": VerificationStatus.VERIFIED,
    },
    {
        "register_number": "731623CSR012",
        "full_name": "Bhavani K",
        "institutional_email": "731623csr012@nandhaengg.edu.in",
        "academic_year": 2,
        "section": "B",
        "thm_user": "bhavani_k",
        "htb_user": None,
        "cert_title": "Web Security Academy Practitioner",
        "cert_org": "PortSwigger",
        "cred_id": "PSW-WSA-10293",
        "cert_status": VerificationStatus.AWAITING,
    },
    {
        "register_number": "731622CSR003",
        "full_name": "Abishek M",
        "institutional_email": "731622csr003@nandhaengg.edu.in",
        "academic_year": 3,
        "section": "A",
        "thm_user": "abishek_thm",
        "htb_user": "abishek_htb",
        "cert_title": "Cybersecurity Essentials",
        "cert_org": "Cisco Networking Academy",
        "cred_id": "CSCO-ESS-88120",
        "cert_status": VerificationStatus.VERIFIED,
    },
]

PRECOMPUTED_HASH = "$2b$12$zzvSuCyL6xPIbdZgTGwg9erWLhC4l5t4IUCnFchUj2x0ZWE/KCU.u"

async def seed_all() -> None:
    now = datetime.now(timezone.utc)
    print("=" * 60)
    print("🚀 Starting CyberTrack Nexus Comprehensive Demo Seeder")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        # 1. Department
        dept_res = await db.execute(select(Department).where(Department.code == "CSE-CS"))
        dept = dept_res.scalar_one_or_none()
        if not dept:
            dept = Department(code="CSE-CS", name="CSE (Cyber Security)", is_active=True)
            db.add(dept)
            await db.commit()
            print(f"[+] Created Department: {dept.name}")
        else:
            print(f"[✓] Department exists: {dept.name}")

        # 2. HOD and Faculty Staff (Mentors)
        hod_email = os.getenv("SEED_HOD_EMAIL", "hod@nandhaengg.edu.in")

        user_res = await db.execute(select(User).where(User.email == hod_email))
        hod = user_res.scalar_one_or_none()
        if not hod:
            hod = User(
                identity_provider="dev_local",
                provider_subject=hod_email,
                email=hod_email,
                display_name="Dr. S. Ramesh (HOD)",
                hashed_password=PRECOMPUTED_HASH,
                is_active=True,
            )
            db.add(hod)
            await db.flush()
            db.add(UserRole_(user_id=hod.id, role=UserRole.HOD, granted_by=hod.id))
            await db.commit()
            print(f"[+] Created HOD: {hod_email}")
        else:
            print(f"[✓] HOD exists: {hod_email}")

        # Staff Mentor 1
        mentor1_email = "mentor1@nandhaengg.edu.in"
        m1_res = await db.execute(select(User).where(User.email == mentor1_email))
        mentor1 = m1_res.scalar_one_or_none()
        if not mentor1:
            mentor1 = User(
                identity_provider="dev_local",
                provider_subject=mentor1_email,
                email=mentor1_email,
                display_name="Prof. Priya K (Faculty Mentor)",
                hashed_password=PRECOMPUTED_HASH,
                is_active=True,
            )
            db.add(mentor1)
            await db.flush()
            db.add(UserRole_(user_id=mentor1.id, role=UserRole.STAFF, granted_by=hod.id))
            await db.commit()
            print(f"[+] Created Faculty Mentor 1: {mentor1_email}")
        else:
            print(f"[✓] Mentor 1 exists: {mentor1_email}")

        # Staff Mentor 2
        mentor2_email = "mentor2@nandhaengg.edu.in"
        m2_res = await db.execute(select(User).where(User.email == mentor2_email))
        mentor2 = m2_res.scalar_one_or_none()
        if not mentor2:
            mentor2 = User(
                identity_provider="dev_local",
                provider_subject=mentor2_email,
                email=mentor2_email,
                display_name="Prof. Anand Kumar (Cyber Lab In-Charge)",
                hashed_password=PRECOMPUTED_HASH,
                is_active=True,
            )
            db.add(mentor2)
            await db.flush()
            db.add(UserRole_(user_id=mentor2.id, role=UserRole.STAFF, granted_by=hod.id))
            await db.commit()
            print(f"[+] Created Faculty Mentor 2: {mentor2_email}")
        else:
            print(f"[✓] Mentor 2 exists: {mentor2_email}")

        # 3. Platforms
        platform_map: dict[str, Platform] = {}
        for p_data in PLATFORMS:
            res = await db.execute(select(Platform).where(Platform.slug == p_data["slug"]))
            p = res.scalar_one_or_none()
            if not p:
                p = Platform(**p_data)
                db.add(p)
                await db.commit()
                print(f"[+] Created Platform: {p.display_name}")
            else:
                print(f"[✓] Platform exists: {p.display_name}")
            platform_map[p.slug] = p

        # 4. Students, Platform Accounts, Certificates, Evidence
        for idx, s_data in enumerate(DEMO_STUDENTS):
            st_res = await db.execute(select(Student).where(Student.register_number == s_data["register_number"]))
            student = st_res.scalar_one_or_none()
            if not student:
                student = Student(
                    register_number=s_data["register_number"],
                    full_name=s_data["full_name"],
                    institutional_email=s_data["institutional_email"],
                    academic_year=s_data["academic_year"],
                    section=s_data["section"],
                    department_id=dept.id,
                    is_active=True,
                )
                db.add(student)
                await db.flush()

                # Mentor assignment
                assigned_mentor = mentor1 if idx % 2 == 0 else mentor2
                assignment = MentorAssignment(
                    student_id=student.id,
                    mentor_user_id=assigned_mentor.id,
                    assigned_by=hod.id,
                    assigned_at=now - timedelta(days=30),
                    is_active=True,
                    notes=f"Assigned for {s_data['academic_year']}rd year skill development in cyber domains."
                )
                db.add(assignment)

                # Link TryHackMe account
                thm_p = platform_map.get("tryhackme")
                if thm_p and s_data.get("thm_user"):
                    thm_acc = PlatformAccount(
                        student_id=student.id,
                        platform_id=thm_p.id,
                        external_username=s_data["thm_user"],
                        external_profile_id=f"thm_{s_data['thm_user']}",
                        profile_url=f"https://tryhackme.com/p/{s_data['thm_user']}",
                        verification_status=VerificationStatus.VERIFIED,
                        sync_status=SyncStatus.HEALTHY,
                        linked_at=now - timedelta(days=20),
                        verified_at=now - timedelta(days=19),
                        last_sync_at=now - timedelta(hours=2),
                        last_successful_sync_at=now - timedelta(hours=2),
                        is_active=True,
                    )
                    db.add(thm_acc)

                # Link NetAcad account
                netacad_p = platform_map.get("cisco_netacad")
                if netacad_p:
                    netacad_acc = PlatformAccount(
                        student_id=student.id,
                        platform_id=netacad_p.id,
                        external_username=s_data["institutional_email"],
                        profile_url=None,
                        verification_status=VerificationStatus.VERIFIED,
                        sync_status=SyncStatus.CONNECTED,
                        linked_at=now - timedelta(days=25),
                        verified_at=now - timedelta(days=24),
                        is_active=True,
                    )
                    db.add(netacad_acc)

                # Certificate
                cert_platform = thm_p if "TryHackMe" in s_data["cert_org"] else netacad_p
                cert = Certificate(
                    student_id=student.id,
                    platform_id=cert_platform.id if cert_platform else None,
                    certificate_title=s_data["cert_title"],
                    issuing_organisation=s_data["cert_org"],
                    issue_date=now - timedelta(days=15),
                    credential_identifier=s_data["cred_id"],
                    verification_status=s_data["cert_status"],
                    submitted_at=now - timedelta(days=14),
                    updated_at=now - timedelta(days=10),
                )
                db.add(cert)
                await db.flush()

                # Evidence submission
                evidence = EvidenceSubmission(
                    student_id=student.id,
                    platform_id=cert_platform.id if cert_platform else None,
                    evidence_type=EvidenceType.CERTIFICATE,
                    submitted_metadata={
                        "title": s_data["cert_title"],
                        "issuer": s_data["cert_org"],
                        "credential_id": s_data["cred_id"],
                        "notes": "Verified completion badge and transcript attached.",
                    },
                    original_filename=f"{s_data['register_number']}_certificate.pdf",
                    file_size_bytes=245812,
                    submission_status=s_data["cert_status"],
                    submitted_at=now - timedelta(days=14),
                    updated_at=now - timedelta(days=10),
                )
                db.add(evidence)
                await db.commit()
                print(f"[+] Committed Student & Records: {student.full_name} ({student.register_number})")

        # 5. Sync Jobs
        thm_p = platform_map.get("tryhackme")
        if thm_p:
            sync_res = await db.execute(select(SyncJob).limit(1))
            if not sync_res.scalar_one_or_none():
                job1 = SyncJob(
                    platform_id=thm_p.id,
                    run_id="run-sync-20261112-0600",
                    status="completed",
                    started_at=now - timedelta(hours=2, minutes=5),
                    finished_at=now - timedelta(hours=2),
                    records_received=8,
                    records_processed=8,
                    attempt_number=1,
                )
                db.add(job1)
                print("[+] Created sample completed SyncJob")

        # 6. Notifications
        notif_res = await db.execute(select(Notification).where(Notification.recipient_user_id == hod.id))
        if not notif_res.scalar_one_or_none():
            n1 = Notification(
                recipient_user_id=hod.id,
                notification_type=NotificationType.IMPORT_COMPLETE,
                title="Student Cohort Imported",
                message="Successfully enrolled 8 student profiles into CSE (Cyber Security) batch.",
                created_at=now - timedelta(hours=4),
            )
            n2 = Notification(
                recipient_user_id=hod.id,
                notification_type=NotificationType.EVIDENCE_REVIEWED,
                title="Evidence Awaiting Review",
                message="Santhosh Kumar P and Bhavani K submitted new certification evidence for review.",
                created_at=now - timedelta(hours=1),
            )
            db.add_all([n1, n2])
            print("[+] Created HOD Notifications")

        # 7. Audit Log entries
        audit_res = await db.execute(select(AuditLog).limit(1))
        if not audit_res.scalar_one_or_none():
            a1 = AuditLog(
                actor_user_id=hod.id,
                action="SYSTEM_INITIALIZE",
                entity_type="Department",
                entity_id="CSE-CS",
                request_id=str(uuid.uuid4()),
                occurred_at=now - timedelta(days=3),
                permitted_context={"event": "Platform seeded and configured for CSE Cyber Security"},
            )
            a2 = AuditLog(
                actor_user_id=hod.id,
                action="STUDENT_BATCH_IMPORT",
                entity_type="Student",
                entity_id="Cohort-2026",
                request_id=str(uuid.uuid4()),
                occurred_at=now - timedelta(days=1),
                permitted_context={"count": 8, "batch": "CSE-CS-2026"},
            )
            db.add_all([a1, a2])
            print("[+] Created initial AuditLog entries")

        await db.commit()
        print("=" * 60)
        print("🎉 All demo data successfully seeded into database!")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(seed_all())
