"""Modelos de la base de datos para la aplicación de comercio electrónico"""

from .productos import Producto, ProductoResponse
from .usuarios import Usuario, UsuarioCreate, UsuarioLogin, UsuarioResponse
from .carrito import (
    Carrito, 
    ItemCarrito, 
    EstadoCarrito,
    ItemCarritoCreate, 
    ItemCarritoUpdate,
    CarritoResponse, 
    ItemCarritoResponse
)
from .compras import (
    Compra,
    ItemCompra,
    CompraCreate,
    CompraResponse,
    ItemCompraResponse,
    CompraResumen
)

# Reconstruir modelos para resolver referencias circulares
CarritoResponse.model_rebuild()
ItemCarritoResponse.model_rebuild()
CompraResponse.model_rebuild()
ItemCompraResponse.model_rebuild()

__all__ = [
    "Producto", 
    "ProductoResponse",
    "Usuario", 
    "UsuarioCreate", 
    "UsuarioLogin", 
    "UsuarioResponse",
    "Carrito",
    "ItemCarrito",
    "EstadoCarrito",
    "ItemCarritoCreate",
    "ItemCarritoUpdate", 
    "CarritoResponse",
    "ItemCarritoResponse",
    "Compra",
    "ItemCompra",
    "CompraCreate",
    "CompraResponse",
    "ItemCompraResponse",
    "CompraResumen"
]