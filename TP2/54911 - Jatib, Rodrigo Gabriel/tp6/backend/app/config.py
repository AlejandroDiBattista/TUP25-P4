import os
import logging
from typing import List


def _load_dotenv(path: str = ".env") -> None:
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            os.environ.setdefault(key, val)


_load_dotenv()


class Settings:
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ALLOW_ORIGINS: List[str]

    def __init__(self) -> None:
        DEFAULT_SECRET = "devsecret_change_me"
        env = os.getenv("ENV", "development").lower()

        self.SECRET_KEY = os.getenv("SECRET_KEY", DEFAULT_SECRET)
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))
        raw = os.getenv("ALLOW_ORIGINS", "*")
        self.LOGIN_MAX_ATTEMPTS = int(os.getenv("LOGIN_MAX_ATTEMPTS", "5"))
        self.LOGIN_BLOCK_SECONDS = int(os.getenv("LOGIN_BLOCK_SECONDS", str(15 * 60)))
        self.LOGIN_WINDOW_SECONDS = int(os.getenv("LOGIN_WINDOW_SECONDS", str(15 * 60)))

        if self.LOGIN_MAX_ATTEMPTS <= 0:
            raise ValueError("LOGIN_MAX_ATTEMPTS must be > 0")
        if self.LOGIN_BLOCK_SECONDS < 0 or self.LOGIN_WINDOW_SECONDS < 0:
            raise ValueError("LOGIN_BLOCK_SECONDS and LOGIN_WINDOW_SECONDS must be >= 0")

        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

        valid_levels = ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL")
        if self.LOG_LEVEL not in valid_levels:
            raise ValueError(f"Invalid LOG_LEVEL '{self.LOG_LEVEL}', must be one of: {', '.join(valid_levels)}")

        if raw.strip() == "*":
            self.ALLOW_ORIGINS = ["*"]
        else:
            parsed = [p.strip() for p in raw.split(",") if p.strip()]
            for o in parsed:
                if not (o.startswith("http://") or o.startswith("https://")):
                    raise ValueError(f"ALLOW_ORIGINS contains an invalid origin: '{o}'. Use full urls like https://example.com")
            self.ALLOW_ORIGINS = parsed

        if self.SECRET_KEY == DEFAULT_SECRET:
            if env == "production":
                raise RuntimeError("SECRET_KEY is using the default value. Set SECRET_KEY in environment before starting in production.")
            logging.getLogger("uvicorn").warning(
                "Using default SECRET_KEY; this is insecure for production. Set SECRET_KEY in environment or .env"
            )


settings = Settings()
