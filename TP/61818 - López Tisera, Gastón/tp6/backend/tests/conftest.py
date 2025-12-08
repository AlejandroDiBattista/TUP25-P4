"""
Fixtures y configuración compartida para los tests.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.api.deps import get_db
from app.main import create_app
from app.models.product import Product
from app.models.user import User

# URLs base para los endpoints
API_PREFIX = "/api/v1"
AUTH_PREFIX = f"{API_PREFIX}/auth"
PRODUCTS_PREFIX = f"{API_PREFIX}/productos"
CART_PREFIX = f"{API_PREFIX}/carrito"
PURCHASES_PREFIX = f"{API_PREFIX}/compras"


@pytest.fixture(name="session")
def session_fixture():
    """
    Crea una sesión de base de datos en memoria para tests.
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """
    Crea un cliente de test con la sesión de base de datos mockeada.
    """
    from contextlib import asynccontextmanager
    from collections.abc import AsyncIterator
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from app.api.v1.api import api_router
    from app.core.config import get_settings
    
    settings = get_settings()
    
    # Lifespan vacío para tests (sin cargar productos automáticamente)
    @asynccontextmanager
    async def test_lifespan(_: FastAPI) -> AsyncIterator[None]:
        yield
    
    # Crear app de test sin lifespan complejo
    test_app = FastAPI(
        title=f"{settings.project_name} - Test",
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        lifespan=test_lifespan,
    )

    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    test_app.include_router(api_router, prefix=settings.api_v1_prefix)
    
    def get_session_override():
        return session

    test_app.dependency_overrides[get_db] = get_session_override
    client = TestClient(test_app)
    yield client
    test_app.dependency_overrides.clear()


@pytest.fixture(name="test_products")
def test_products_fixture(session: Session):
    """
    Crea productos de prueba en la base de datos.
    """
    products = [
        Product(
            id=1,
            titulo="Notebook HP",
            descripcion="Notebook HP 15.6 pulgadas",
            precio=500.00,
            categoria="Electrónica",
            existencia=10,
            imagen="imagenes/0001.png",
        ),
        Product(
            id=2,
            titulo="Mouse Logitech",
            descripcion="Mouse inalámbrico",
            precio=25.50,
            categoria="Accesorios",
            existencia=5,
            imagen="imagenes/0002.png",
        ),
        Product(
            id=3,
            titulo="Teclado Mecánico",
            descripcion="Teclado mecánico RGB",
            precio=80.00,
            categoria="Accesorios",
            existencia=0,
            imagen="imagenes/0003.png",
        ),
        Product(
            id=4,
            titulo="Monitor Samsung",
            descripcion="Monitor 24 pulgadas Full HD",
            precio=200.00,
            categoria="Electrónica",
            existencia=8,
            imagen="imagenes/0004.png",
        ),
    ]
    for product in products:
        session.add(product)
    session.commit()
    for product in products:
        session.refresh(product)
    return products


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    """
    Crea un usuario de prueba registrado.
    """
    from app.core.security import get_password_hash

    user = User(
        nombre="Test User",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="auth_token")
def auth_token_fixture(client: TestClient, test_user: User):
    """
    Obtiene un token de autenticación válido para el usuario de prueba.
    """
    response = client.post(
        f"{AUTH_PREFIX}/login",
        json={"email": test_user.email, "password": "testpassword123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]

