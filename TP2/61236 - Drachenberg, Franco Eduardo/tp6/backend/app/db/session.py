import os
from functools import lru_cache
from typing import Any, Dict

from sqlmodel import create_engine

DEFAULT_SQLITE_URL = "sqlite:///./app.db"


def get_database_url() -> str:
    url = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)
    return url


@lru_cache
def get_engine():
    database_url = get_database_url()
    connect_args: Dict[str, Any] = {}

    if database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

    engine = create_engine(database_url, connect_args=connect_args)
    return engine
