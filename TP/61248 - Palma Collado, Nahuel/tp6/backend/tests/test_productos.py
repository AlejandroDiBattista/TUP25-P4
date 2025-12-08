from __future__ import annotations

from fastapi.testclient import TestClient


def test_listado_productos_basico(client: TestClient) -> None:
    response = client.get("/productos")
    assert response.status_code == 200
    productos = response.json()
    assert len(productos) == 20
    assert {"id", "nombre", "categoria"}.issubset(productos[0].keys())


def test_busqueda_y_filtro_categoria(client: TestClient) -> None:
    response = client.get("/productos", params={"buscar": "mochila"})
    assert response.status_code == 200
    resultados = response.json()
    assert any("mochila" in prod["descripcion"].lower() for prod in resultados)

    filtrado = client.get("/productos", params={"categoria": "Electrónica"})
    assert filtrado.status_code == 200
    for prod in filtrado.json():
        assert prod["categoria"].lower() == "electrónica"


def test_detalle_producto_existente(client: TestClient) -> None:
    detalle = client.get("/productos/1")
    assert detalle.status_code == 200
    data = detalle.json()
    assert data["nombre"].lower().startswith("mochila")


def test_detalle_producto_inexistente(client: TestClient) -> None:
    detalle = client.get("/productos/999")
    assert detalle.status_code == 404
    assert detalle.json()["detail"] == "Producto no encontrado"
