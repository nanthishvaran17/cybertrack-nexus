"""Application configuration — loaded from environment variables."""
from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, PostgresDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ─────────────────────────────────────────────────────────
    APP_NAME: str = "CyberTrack Nexus"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = False

    # ── API ─────────────────────────────────────────────────────────────────
    API_V1_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: list[AnyHttpUrl] = []

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: PostgresDsn

    # ── JWT (dev-mode local auth) ─────────────────────────────────────────────
    # IMPORTANT: DEV_AUTH_ENABLED must never be True in production.
    # Set ENVIRONMENT=production to guard against accidental exposure.
    DEV_AUTH_ENABLED: bool = True
    JWT_SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_USE_SECRETS_MANAGER"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── File storage ─────────────────────────────────────────────────────────
    STORAGE_BACKEND: Literal["local", "s3"] = "local"
    LOCAL_STORAGE_PATH: str = "./uploads"
    S3_BUCKET: str = ""
    S3_REGION: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    # ── Security ─────────────────────────────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_UPLOAD_EXTENSIONS: list[str] = [".pdf", ".png", ".jpg", ".jpeg"]

    # ── Scheduler ────────────────────────────────────────────────────────────
    SYNC_INTERVAL_MINUTES: int = 360  # 6 hours default — conservative

    # ── Logging ──────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    # ── Pagination ───────────────────────────────────────────────────────────
    DEFAULT_PAGE_SIZE: int = 25
    MAX_PAGE_SIZE: int = 100

    @field_validator("DEV_AUTH_ENABLED", mode="before")
    @classmethod
    def block_dev_auth_in_production(cls, v: bool, info: object) -> bool:
        return v

    @model_validator(mode="after")
    def enforce_production_guards(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            if self.DEV_AUTH_ENABLED:
                raise ValueError(
                    "DEV_AUTH_ENABLED must be False in production environment."
                )
            if "CHANGE_ME" in self.JWT_SECRET_KEY:
                raise ValueError(
                    "JWT_SECRET_KEY must be set to a secure value in production."
                )
        return self

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
