from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    service_name: str = Field(default="helpdesk-api", validation_alias="SERVICE_NAME")
    service_version: str = Field(default="0.1.0", validation_alias="SERVICE_VERSION")
    environment: str = Field(default="local", validation_alias="ENVIRONMENT")
    database_url: str = Field(
        default="postgresql+psycopg://helpdesk:helpdesk@postgres:5432/helpdesk",
        validation_alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://redis:6379/0", validation_alias="REDIS_URL")
    jwt_secret: str = Field(default="change-me", validation_alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, validation_alias="JWT_EXPIRE_MINUTES")

    # Phase 3
    auto_close_days: int = Field(default=7, validation_alias="AUTO_CLOSE_DAYS")
    sla_escalation_interval_seconds: int = Field(default=300, validation_alias="SLA_ESCALATION_INTERVAL_SECONDS")
    weekly_report_day: str = Field(default="MONDAY", validation_alias="WEEKLY_REPORT_DAY")
    weekly_report_hour: int = Field(default=9, validation_alias="WEEKLY_REPORT_HOUR")

    model_config = SettingsConfigDict(env_file=".env", env_prefix="", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
