import os
from functools import lru_cache


class Settings:
    def __init__(self) -> None:
        self.secret_key: str = os.getenv("SECRET_KEY", "changeme")
        self.algorithm: str = os.getenv("ALGORITHM", "HS256")
        minutes = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
        self.access_token_expire_minutes: int = int(minutes)
        self.database_url: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
