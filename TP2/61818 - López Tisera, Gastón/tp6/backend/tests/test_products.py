"""
Tests para los endpoints de productos.
"""

import pytest
from fastapi.testclient import TestClient

from app.models.product import Product


def test_list_all_products(client: TestClient, test_products: list[Product]):
    """Test: Listar todos los productos."""
    response = client.get("/api/v1/productos")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == len(test_products)
    assert data[0]["titulo"] == test_products[0].titulo


def test_search_products_by_title(client: TestClient, test_products: list[Product]):
    """Test: Buscar productos por título."""
    response = client.get("/api/v1/productos?buscar=notebook")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "Notebook" in data[0]["titulo"]


def test_search_products_case_insensitive(
    client: TestClient, test_products: list[Product]
):
    """Test: La búsqueda debe ser case-insensitive."""
    response = client.get("/api/v1/productos?buscar=MOUSE")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0


def test_filter_products_by_category(
    client: TestClient, test_products: list[Product]
):
    """Test: Filtrar productos por categoría."""
    response = client.get("/api/v1/productos?categoria=Electrónica")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Notebook y Monitor
    for product in data:
        assert product["categoria"] == "Electrónica"


def test_filter_and_search_combined(client: TestClient, test_products: list[Product]):
    """Test: Combinar búsqueda y filtro de categoría."""
    response = client.get("/api/v1/productos?buscar=Mouse&categoria=Accesorios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["titulo"] == "Mouse Logitech"


def test_get_product_by_id(client: TestClient, test_products: list[Product]):
    """Test: Obtener un producto por ID."""
    product_id = test_products[0].id
    response = client.get(f"/api/v1/productos/{product_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == product_id
    assert data["titulo"] == test_products[0].titulo


def test_get_nonexistent_product(client: TestClient):
    """Test: Intentar obtener un producto inexistente debe retornar 404."""
    response = client.get("/api/v1/productos/9999")
    assert response.status_code == 404
    assert "no encontrado" in response.json()["detail"]


def test_products_show_stock(client: TestClient, test_products: list[Product]):
    """Test: Los productos deben mostrar su stock disponible."""
    response = client.get("/api/v1/productos")
    assert response.status_code == 200
    data = response.json()
    for product in data:
        assert "existencia" in product
        assert isinstance(product["existencia"], int)


def test_search_no_results(client: TestClient, test_products: list[Product]):
    """Test: Búsqueda sin resultados debe retornar lista vacía."""
    response = client.get("/api/v1/productos?buscar=productoquenoexiste123")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0

