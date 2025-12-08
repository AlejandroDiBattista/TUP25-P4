from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    api_v1_prefix: str = "/api/v1"
    project_name: str = "TP6 Ecommerce API"
    database_url: str = Field(
        default="sqlite:///./tp6.db",
        description="SQLModel compatible database URL.",
    )
    backend_cors_origins: List[AnyHttpUrl] | List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        description="Allowed origins for CORS.",
    )
    secret_key: SecretStr = Field(
        default=SecretStr("super-secret-development-key"),
        description="Secret key for JWT token signing.",
    )
    access_token_expire_minutes: int = Field(
        default=60,
        description="Minutes before access tokens expire.",
    )
    jwt_algorithm: str = Field(default="HS256", description="JWT signing algorithm.")
    iva_general: float = Field(default=0.21, description="IVA general 21%")
    iva_electronica: float = Field(default=0.10, description="IVA electrónica 10%")
    envio_gratuito_desde: float = Field(
        default=1000.0, description="Monto mínimo para envío gratuito"
    )
    costo_envio: float = Field(default=50.0, description="Costo fijo de envío")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance."""
    return Settings()

