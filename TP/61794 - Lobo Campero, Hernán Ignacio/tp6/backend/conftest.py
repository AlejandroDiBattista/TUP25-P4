import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(name="client")
def client_fixture():
    """Crear cliente de tests contra la API"""
    return TestClient(app)
