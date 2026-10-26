"""TryHackMe integration adapter.

TryHackMe has a limited public API. The following endpoints are publicly documented:
  - https://tryhackme.com/api/v2/user/exist?username=<username>  (check existence)
  - https://tryhackme.com/api/v2/hacktivities?username=<username> (public activity, undocumented)

IMPORTANT: This adapter only uses officially documented or clearly public endpoints.
It does NOT scrape authenticated pages or bypass access controls.
Capabilities are declared conservatively — only what has been verified to work.
"""
from __future__ import annotations

import httpx
import structlog

from app.integrations.base import BaseIntegrationAdapter, ProfileData, ProgressRecord, SyncCapabilities

log = structlog.get_logger(__name__)

THM_BASE = "https://tryhackme.com"
TIMEOUT = 10.0


class TryHackMeAdapter(BaseIntegrationAdapter):
    platform_slug = "tryhackme"

    def get_capabilities(self) -> SyncCapabilities:
        return SyncCapabilities(
            api_sync=True,
            profile_fetch=True,
            progress_fetch=False,  # Undocumented endpoints not used
            certificate_fetch=False,
            manual_upload_supported=True,
            notes=(
                "Profile existence is verifiable via public API. "
                "Detailed progress and room completion data require authenticated "
                "organisation API access which must be separately provisioned. "
                "Manual evidence upload is available as fallback."
            ),
        )

    async def validate_connection(self, external_username: str) -> bool:
        """Check if a THM username exists via the public API."""
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                res = await client.get(
                    f"{THM_BASE}/api/v2/user/exist",
                    params={"username": external_username},
                )
                if res.status_code == 200:
                    data = res.json()
                    return bool(data.get("success") and data.get("data", {}).get("exists"))
        except httpx.RequestError as exc:
            log.warning("tryhackme_validate_error", error=str(exc), username=external_username)
        return False

    async def fetch_profile(self, external_username: str) -> ProfileData | None:
        """Fetch basic profile metadata."""
        exists = await self.validate_connection(external_username)
        if not exists:
            return None
        return ProfileData(
            external_username=external_username,
            profile_url=f"{THM_BASE}/p/{external_username}",
        )

    async def fetch_progress(self, external_username: str) -> list[ProgressRecord]:
        """
        Detailed progress fetch is NOT implemented.
        TryHackMe's progress/room-completion data requires authenticated
        organisation API access. This returns an empty list until that
        access is confirmed and provisioned.
        """
        log.info(
            "tryhackme_progress_not_available",
            username=external_username,
            reason="Organisation API access not provisioned",
        )
        return []
