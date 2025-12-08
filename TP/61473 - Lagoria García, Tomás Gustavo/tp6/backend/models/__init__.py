"""
Modelos de la aplicación E-Commerce.

Exporta todos los modelos y schemas para facilitar las importaciones.

Uso:
    from models import Usuario, Producto, Carrito, Compra
    from models import UsuarioCreate, ProductoResponse, CarritoResponse
"""

# Importar modelos de Usuario
from .usuario import (
    Usuario,
    UsuarioCreate,
    UsuarioLogin,
    UsuarioResponse,
    TokenResponse
)

# Importar modelos de Producto
from .productos import (
    Producto,
    ProductoResponse,
    ProductoCreate
)

# Importar modelos de Carrito
from .carrito import (
    Carrito,
    ItemCarrito,
    EstadoCarrito,
    ItemCarritoCreate,
    ItemCarritoResponse,
    CarritoResponse
)

# Importar modelos de Compra
from .compra import (
    Compra,
    ItemCompra,
    CompraCreate,
    ItemCompraResponse,
    CompraResumenResponse,
    CompraDetalleResponse
)

# Alias para compatibilidad
CompraResumen = CompraResumenResponse
CompraResponse = CompraDetalleResponse

# Exportar todo
__all__ = [
    # Modelos de tablas
    "Usuario",
    "Producto",
    "Carrito",
    "ItemCarrito",
    "Compra",
    "ItemCompra",
    
    # Enums
    "EstadoCarrito",
    
    # Schemas de Usuario
    "UsuarioCreate",
    "UsuarioLogin",
    "UsuarioResponse",
    "TokenResponse",
    
    # Schemas de Producto
    "ProductoResponse",
    "ProductoCreate",
    
    # Schemas de Carrito
    "ItemCarritoCreate",
    "ItemCarritoResponse",
    "CarritoResponse",
    
    # Schemas de Compra
    "CompraCreate",
    "ItemCompraResponse",
    "CompraResumenResponse",
    "CompraDetalleResponse",
    "CompraResumen",  # Alias
    "CompraResponse",  # Alias
]

