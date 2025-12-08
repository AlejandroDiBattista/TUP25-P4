# Routes module
from .autenticacion import router as auth_router
from .productos import router as productos_router
from .carrito import router as carrito_router
from .compras import router as compras_router

__all__ = ["auth_router", "productos_router", "carrito_router", "compras_router"]
