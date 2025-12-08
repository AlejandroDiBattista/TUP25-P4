"""Paquete de modelos.

Las clases viven en módulos separados para mantener orden por entidad.
Este __init__ reexporta todo para permitir `from models import ...`.
"""

from .usuario import Usuario  # noqa: F401
from .productos import Producto  # noqa: F401
from .carrito import Carrito, CarritoItem  # noqa: F401
from .compra import Compra, CompraItem  # noqa: F401
