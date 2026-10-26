"""Base integration adapter interface — all platform adapters implement this."""
from __future__ import annotations

import abc
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class SyncCapabilities:
    """Declares what a platform adapter can actually do."""
    api_sync: bool = False
    profile_fetch: bool = False
    progress_fetch: bool = False
    certificate_fetch: bool = False
    manual_upload_supported: bool = True
    notes: str = ""


@dataclass
class ProfileData:
    external_username: str
    external_profile_id: str | None = None
    profile_url: str | None = None
    display_name: str | None = None
    raw: dict[str, Any] = field(default_factory=dict)


@dataclass
class ProgressRecord:
    capability: str
    metric_key: str
    metric_value: str
    source_timestamp: datetime | None = None
    data_quality_status: str = "ok"


@dataclass
class SyncResult:
    success: bool
    records_received: int = 0
    records_processed: int = 0
    error_code: str | None = None
    sanitised_error_message: str | None = None
    progress_records: list[ProgressRecord] = field(default_factory=list)


class BaseIntegrationAdapter(abc.ABC):
    """
    All platform integration adapters implement this interface.
    Adapters must declare their actual capabilities honestly.
    Never invent API endpoints or response fields.
    """

    platform_slug: str = ""

    @abc.abstractmethod
    def get_capabilities(self) -> SyncCapabilities:
        """Return the real, verified capabilities of this adapter."""
        ...

    @abc.abstractmethod
    async def validate_connection(self, external_username: str) -> bool:
        """Check if an account identifier is reachable. Returns False on auth failure."""
        ...

    @abc.abstractmethod
    async def fetch_profile(self, external_username: str) -> ProfileData | None:
        """Fetch public profile metadata. Returns None if unavailable."""
        ...

    @abc.abstractmethod
    async def fetch_progress(self, external_username: str) -> list[ProgressRecord]:
        """Fetch learning progress records. Returns empty list if unsupported."""
        ...

    def normalise_records(self, raw_records: list[dict[str, Any]]) -> list[ProgressRecord]:
        """Override to provide platform-specific normalisation logic."""
        return []

    def check_capabilities(self) -> dict[str, bool | str]:
        caps = self.get_capabilities()
        return {
            "api_sync": caps.api_sync,
            "profile_fetch": caps.profile_fetch,
            "progress_fetch": caps.progress_fetch,
            "certificate_fetch": caps.certificate_fetch,
            "manual_upload_supported": caps.manual_upload_supported,
            "notes": caps.notes,
        }
