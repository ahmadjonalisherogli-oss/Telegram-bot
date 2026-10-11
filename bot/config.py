"""
Configuration settings for Telegram Ordering Bot using pydantic-settings.
Supports environment variables and .env file loading.
"""

from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Telegram Bot Settings
    BOT_TOKEN: str
    ADMIN_IDS: List[int] = []
    ADMIN_CHANNEL_ID: Optional[int] = None

    # Database Configuration (PostgreSQL with asyncpg)
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "restaurant_bot_db"
    DB_USER: str = "postgres"
    DB_PASS: str = "postgres_password"
    DATABASE_URL: Optional[str] = None

    # Redis Configuration (FSM storage & caching)
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: Optional[str] = None

    # Webhook & Server Settings
    WEBHOOK_HOST: Optional[str] = None
    WEBHOOK_PATH: str = "/webhook/bot"
    WEBHOOK_URL: Optional[str] = None
    WEB_SERVER_HOST: str = "0.0.0.0"
    WEB_SERVER_PORT: int = 8000

    # Payment Integrations (Click / Payme)
    CLICK_PROVIDER_TOKEN: Optional[str] = None
    PAYME_PROVIDER_TOKEN: Optional[str] = None

    # App Settings
    DEFAULT_LANGUAGE: str = "uz"  # uz, ru, en
    CURRENCY: str = "UZS"
    SUPPORT_PHONE: str = "+998 71 200 00 00"
    RESTAURANT_NAME: str = "Osh & Kabob Express"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("ADMIN_IDS", mode="before")
    @classmethod
    def parse_admin_ids(cls, v):
        if isinstance(v, str):
            if not v.strip():
                return []
            return [int(admin_id.strip()) for admin_id in v.split(",") if admin_id.strip()]
        elif isinstance(v, int):
            return [v]
        return v or []

    @property
    def async_database_url(self) -> str:
        if self.DATABASE_URL:
            # Ensure driver is asyncpg
            if self.DATABASE_URL.startswith("postgresql://"):
                return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def redis_connection_url(self) -> str:
        if self.REDIS_URL:
            return self.REDIS_URL
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"


# Singleton configuration instance
settings = Settings()
