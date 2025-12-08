import pytest
from fastapi.testclient import TestClient
from main import app
from app.ratelimit import limiter

client = TestClient(app)


def setup_function():
    limiter.clear_all()


def test_rate_limit_blocks_after_failed_attempts():
    # ensure user exists
    email = "ratelimit@example.com"
    password = "secretpass"
    client.post("/auth/registrar", json={"nombre": "RL", "email": email, "password": password})

    # attempt wrong password multiple times
    for i in range(5):
        resp = client.post("/auth/token", json={"username": email, "password": "wrong"})
        assert resp.status_code == 401

    # next attempt should be blocked (429)
    resp = client.post("/auth/token", json={"username": email, "password": "wrong"})
    assert resp.status_code == 429


def test_success_resets_counters():
    email = "ratelimit2@example.com"
    password = "secretpass"
    client.post("/auth/registrar", json={"nombre": "RL2", "email": email, "password": password})

    # one failed attempt
    resp = client.post("/auth/token", json={"username": email, "password": "wrong"})
    assert resp.status_code == 401

    # successful login
    resp = client.post("/auth/token", json={"username": email, "password": password})
    assert resp.status_code == 200

    # another wrong attempt should not be blocked immediately
    resp = client.post("/auth/token", json={"username": email, "password": "wrong"})
    assert resp.status_code == 401
