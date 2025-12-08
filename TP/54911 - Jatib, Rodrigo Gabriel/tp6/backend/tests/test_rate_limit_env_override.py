import importlib
import os
import sys

def test_rate_limiter_respects_env(monkeypatch):
    # set env to small values and reload modules to pick them up
    monkeypatch.setenv("LOGIN_MAX_ATTEMPTS", "2")
    monkeypatch.setenv("LOGIN_BLOCK_SECONDS", "60")
    monkeypatch.setenv("LOGIN_WINDOW_SECONDS", "60")

    # reload settings and ratelimit
    if "app.config" in sys.modules:
        del sys.modules["app.config"]
    if "app.ratelimit" in sys.modules:
        del sys.modules["app.ratelimit"]

    config = importlib.import_module("app.config")
    rl = importlib.import_module("app.ratelimit")

    assert config.settings.LOGIN_MAX_ATTEMPTS == 2
    # limiter default should use that value
    assert rl.limiter.max_attempts == 2
