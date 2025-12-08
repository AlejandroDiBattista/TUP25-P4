import importlib
import sys
import os
import pytest


def test_secret_key_required_in_production(monkeypatch):
    """When ENV=production and SECRET_KEY is not set (default), importing app.config should raise RuntimeError."""
    monkeypatch.setenv("ENV", "production")
    monkeypatch.delenv("SECRET_KEY", raising=False)

    # Ensure we import fresh
    if "app.config" in sys.modules:
        del sys.modules["app.config"]

    with pytest.raises(RuntimeError):
        importlib.import_module("app.config")

    # cleanup
    if "app.config" in sys.modules:
        del sys.modules["app.config"]
