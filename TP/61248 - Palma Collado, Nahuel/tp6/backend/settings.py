import os
from datetime import timedelta
from secrets import token_urlsafe


SECRET_KEY = os.getenv("TP6_SECRET_KEY", token_urlsafe(32))
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("TP6_ACCESS_TOKEN_MINUTES", "120"))


def access_token_expires_delta() -> timedelta:
    return timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
