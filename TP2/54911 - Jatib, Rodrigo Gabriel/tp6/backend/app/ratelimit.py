from time import time
from threading import Lock
from typing import Dict, Tuple
from .config import settings

_store: Dict[str, Tuple[int, float]] = {}
_lock = Lock()


class RateLimiter:
    def __init__(self, max_attempts: int = None, window_seconds: int = None, block_seconds: int = None):
        if max_attempts is None:
            max_attempts = settings.LOGIN_MAX_ATTEMPTS
        if window_seconds is None:
            window_seconds = settings.LOGIN_WINDOW_SECONDS
        if block_seconds is None:
            block_seconds = settings.LOGIN_BLOCK_SECONDS

        self.max_attempts = int(max_attempts)
        self.window_seconds = int(window_seconds)
        self.block_seconds = int(block_seconds)

    def _now(self) -> float:
        return time()

    def is_blocked(self, key: str) -> Tuple[bool, float]:
        with _lock:
            entry = _store.get(key)
            if not entry:
                return False, 0.0
            count, blocked_until = entry
            now = self._now()
            if blocked_until and blocked_until > now:
                return True, blocked_until - now
            return False, 0.0

    def add_failure(self, key: str) -> Tuple[bool, int]:
        now = self._now()
        with _lock:
            count, blocked_until = _store.get(key, (0, 0.0))
            if blocked_until and blocked_until <= now:
                count, blocked_until = 0, 0.0

            count += 1
            if count >= self.max_attempts:
                blocked_until = now + self.block_seconds
                _store[key] = (0, blocked_until)
                return True, 0
            else:
                _store[key] = (count, 0.0)
                return False, self.max_attempts - count

    def reset(self, key: str) -> None:
        with _lock:
            if key in _store:
                del _store[key]

    def clear_all(self) -> None:
        with _lock:
            _store.clear()


limiter = RateLimiter()


def create_limiter_from_settings() -> RateLimiter:
    return RateLimiter()
