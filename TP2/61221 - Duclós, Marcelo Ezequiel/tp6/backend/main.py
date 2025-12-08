from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel

from database import get_session
from models import (
    Producto, ProductoResponse, UsuarioCreate, UsuarioResponse, UsuarioLogin, Usuario,
    ItemCarritoCreate, ItemCarritoUpdate, CarritoResponse
)
from auth import crear_usuario, convertir_a_usuario_response
from carrito_utils import (
    obtener_o_crear_carrito, 
    agregar_item_a_carrito,
    actualizar_cantidad_item,
    eliminar_item_de_carrito,
    vaciar_carrito,
    convertir_carrito_a_response
)
from compras_utils import finalizar_compra, obtener_resumen_compra
from jwt_auth import (
    autenticar_y_crear_token, 
    obtener_usuario_actual, 
    invalidar_token, 
    TokenResponse,
    security
)

app = FastAPI(
    title="TP6 Shop API",
    description="API para tienda de comercio electrónico",
    version="1.0.0"
)

# Montar directorio de imágenes como archivos estáticos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "mensaje": "TP6 Shop API - Tienda de Comercio Electrónico",
        "version": "1.0.0",
        "endpoints": {
            "productos": "/productos?categoria=&busqueda=&disponible_solo=false",
            "categorias": "/categorias",
            "registro": "/registrar",
            "login": "/iniciar-sesion",
            "logout": "/cerrar-sesion",
            "perfil": "/perfil",
            "carrito": {
                "ver": "GET /carrito",
                "agregar": "POST /carrito",
                "actualizar": "PUT /carrito/{producto_id}",
                "quitar": "DELETE /carrito/{producto_id}",
                "cancelar": "POST /carrito/cancelar"
            },
            "usuarios": "/usuarios",
            "documentacion": "/docs"
        },
        "estado": "Carrito de compras implementado",
        "filtros_disponibles": {
            "categoria": "Filtrar por categoría (ej: 'Ropa de hombre')",
            "busqueda": "Buscar en título y descripción",
            "disponible_solo": "Solo productos con stock"
        },
        "autenticacion": "Bearer Token requerido para endpoints protegidos"
    }

@app.get("/productos", response_model=List[ProductoResponse])
def obtener_productos(
    categoria: Optional[str] = None,
    busqueda: Optional[str] = None,
    disponible_solo: bool = False,
    session: Session = Depends(get_session)
):
    """
    Obtener productos con filtros opcionales
    
    - **categoria**: Filtrar por categoría específica
    - **busqueda**: Buscar en título y descripción
    - **disponible_solo**: Solo productos con stock disponible
    """
    statement = select(Producto)
    
    # Aplicar filtros
    if categoria:
        statement = statement.where(Producto.categoria.ilike(f"%{categoria}%"))
    
    if busqueda:
        # Buscar en título y descripción
        busqueda_term = f"%{busqueda}%"
        statement = statement.where(
            (Producto.titulo.ilike(busqueda_term)) | 
            (Producto.descripcion.ilike(busqueda_term))
        )
    
    if disponible_solo:
        statement = statement.where(Producto.existencia > 0)
    
    # Ordenar por ID para consistencia
    statement = statement.order_by(Producto.id)
    
    productos = session.exec(statement).all()
    
    # Convertir a ProductoResponse con la propiedad disponible
    productos_response = []
    for producto in productos:
        producto_dict = producto.model_dump()
        producto_dict["disponible"] = producto.disponible
        productos_response.append(ProductoResponse(**producto_dict))
    
    return productos_response

@app.get("/productos/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int, session: Session = Depends(get_session)):
    """Obtener un producto específico por ID"""
    statement = select(Producto).where(Producto.id == producto_id)
    producto = session.exec(statement).first()
    
    if not producto:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Convertir a ProductoResponse
    producto_dict = producto.model_dump()
    producto_dict["disponible"] = producto.disponible
    return ProductoResponse(**producto_dict)

@app.get("/categorias")
def obtener_categorias(session: Session = Depends(get_session)):
    """Obtener todas las categorías de productos disponibles"""
    from sqlmodel import func, distinct
    
    statement = select(distinct(Producto.categoria)).order_by(Producto.categoria)
    categorias = session.exec(statement).all()
    
    return {
        "categorias": categorias,
        "total": len(categorias)
    }

# === ENDPOINTS DE USUARIOS ===

@app.post("/registrar", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario_data: UsuarioCreate, session: Session = Depends(get_session)):
    """Registrar un nuevo usuario"""
    try:
        usuario = crear_usuario(session, usuario_data)
        return convertir_a_usuario_response(usuario)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@app.post("/iniciar-sesion")
def iniciar_sesion(credenciales: UsuarioLogin, session: Session = Depends(get_session)):
    """Iniciar sesión y obtener token de autenticación"""
    try:
        token_response = autenticar_y_crear_token(session, credenciales)
        return {
            "access_token": token_response.access_token,
            "token_type": token_response.token_type,
            "expires_in": token_response.expires_in,
            "mensaje": "Sesión iniciada correctamente"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@app.post("/cerrar-sesion")
def cerrar_sesion(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    """Cerrar sesión (invalidar token)"""
    token = credentials.credentials
    invalidar_token(token)
    
    return {
        "mensaje": f"Sesión cerrada correctamente para {usuario_actual.nombre}",
        "usuario": usuario_actual.email
    }

@app.get("/perfil", response_model=UsuarioResponse)
def obtener_perfil(usuario_actual: Usuario = Depends(obtener_usuario_actual)):
    """Obtener información del perfil del usuario autenticado"""
    return convertir_a_usuario_response(usuario_actual)

# === ENDPOINTS DEL CARRITO ===

@app.post("/carrito", status_code=status.HTTP_201_CREATED)
def agregar_al_carrito(
    item_data: ItemCarritoCreate,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    """Agregar producto al carrito"""
    try:
        # Obtener o crear carrito
        carrito = obtener_o_crear_carrito(session, usuario_actual.id)
        
        # Agregar item al carrito
        item = agregar_item_a_carrito(session, carrito, item_data)
        
        return {
            "mensaje": "Producto agregado al carrito exitosamente",
            "item_id": item.id,
            "cantidad": item.cantidad,
            "subtotal": item.subtotal
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@app.get("/carrito", response_model=CarritoResponse)
def ver_carrito(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    """Ver contenido del carrito"""
    carrito = obtener_o_crear_carrito(session, usuario_actual.id)
    return convertir_carrito_a_response(carrito, session)

@app.put("/carrito/{producto_id}")
def actualizar_carrito(
    producto_id: int,
    update_data: ItemCarritoUpdate,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    """Actualizar cantidad de producto en el carrito"""
    try:
        carrito = obtener_o_crear_carrito(session, usuario_actual.id)
        item = actualizar_cantidad_item(session, carrito, producto_id, update_data.cantidad)
        
        return {
            "mensaje": "Cantidad actualizada exitosamente",
            "producto_id": producto_id,
            "nueva_cantidad": item.cantidad,
            "subtotal": item.subtotal
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@app.delete("/carrito/{producto_id}")
def quitar_del_carrito(
    producto_id: int,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    """Quitar producto del carrito"""
    try:
        carrito = obtener_o_crear_carrito(session, usuario_actual.id)
        eliminar_item_de_carrito(session, carrito, producto_id)
        
        return {
            "mensaje": "Producto eliminado del carrito exitosamente",
            "producto_id": producto_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@app.post("/carrito/cancelar")
def cancelar_compra(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    """Cancelar compra (vaciar carrito)"""
    try:
        carrito = obtener_o_crear_carrito(session, usuario_actual.id)
        vaciar_carrito(session, carrito)
        
        return {
            "mensaje": "Carrito vaciado exitosamente",
            "usuario": usuario_actual.email
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@app.get("/usuarios", response_model=List[UsuarioResponse])
def listar_usuarios(session: Session = Depends(get_session)):
    """Listar todos los usuarios registrados (para testing)"""
    from models import Usuario
    statement = select(Usuario)
    usuarios = session.exec(statement).all()
    return [convertir_a_usuario_response(u) for u in usuarios]


# ==================== ENDPOINTS DE COMPRAS ====================

class DatosCompra(BaseModel):
    direccion: str = "Av. Corrientes 1234, CABA, Argentina"
    tarjeta: str = "**** **** **** 1234"



@app.post("/carrito/finalizar")
async def finalizar_compra_endpoint(
    datos: DatosCompra = DatosCompra(),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    """Finalizar compra del carrito actual"""
    try:
        # Obtener carrito activo del usuario
        carrito = obtener_o_crear_carrito(session, usuario_actual.id)
        
        # Finalizar compra
        compra = finalizar_compra(session, carrito, datos.direccion, datos.tarjeta)
        
        # Obtener resumen completo de la compra
        resumen = obtener_resumen_compra(session, compra.id)
        
        return {
            "mensaje": "Compra realizada exitosamente",
            "compra": resumen
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )


@app.get("/compra/{compra_id}")
async def obtener_compra(
    compra_id: int,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    """Obtener detalles de una compra específica"""
    try:
        # Verificar que la compra pertenece al usuario
        from models import Compra
        compra = session.get(Compra, compra_id)
        
        if not compra:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Compra no encontrada"
            )
        
        if compra.usuario_id != usuario_actual.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a esta compra"
            )
        
        resumen = obtener_resumen_compra(session, compra_id)
        return resumen
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )


@app.get("/compras")
async def listar_compras(
    limit: int = 10,
    offset: int = 0,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    """Listar todas las compras del usuario con paginación"""
    try:
        from models import Compra
        
        # Obtener compras del usuario ordenadas por fecha (más recientes primero)
        statement = select(Compra).where(
            Compra.usuario_id == usuario_actual.id
        ).order_by(Compra.fecha.desc()).offset(offset).limit(limit)
        
        compras = session.exec(statement).all()
        
        # Contar total de compras para paginación
        count_statement = select(Compra).where(Compra.usuario_id == usuario_actual.id)
        total_compras = len(session.exec(count_statement).all())
        
        # Convertir a formato de respuesta
        compras_resumen = []
        for compra in compras:
            # Obtener total de items
            from models import ItemCompra
            items_statement = select(ItemCompra).where(ItemCompra.compra_id == compra.id)
            items = session.exec(items_statement).all()
            total_items = sum(item.cantidad for item in items)
            
            compras_resumen.append({
                "id": compra.id,
                "fecha": compra.fecha.isoformat(),
                "total": float(compra.total),
                "subtotal": float(compra.subtotal),
                "iva": float(compra.iva),
                "envio": float(compra.envio),
                "total_items": total_items,
                "direccion": compra.direccion,
                "tarjeta": compra.tarjeta
            })
        
        return {
            "compras": compras_resumen,
            "total": total_compras,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total_compras
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )


@app.get("/compras/estadisticas")
async def obtener_estadisticas_compras(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    """Obtener estadísticas de compras del usuario"""
    try:
        from models import Compra, ItemCompra
        from decimal import Decimal
        
        # Obtener todas las compras del usuario
        compras_statement = select(Compra).where(Compra.usuario_id == usuario_actual.id)
        compras = session.exec(compras_statement).all()
        
        if not compras:
            return {
                "total_compras": 0,
                "total_gastado": 0.0,
                "promedio_compra": 0.0,
                "total_productos_comprados": 0,
                "compra_mas_reciente": None,
                "compra_mas_grande": None
            }
        
        # Calcular estadísticas
        total_compras = len(compras)
        total_gastado = sum(compra.total for compra in compras)
        promedio_compra = total_gastado / total_compras
        
        # Obtener total de productos comprados
        total_productos = 0
        for compra in compras:
            items_statement = select(ItemCompra).where(ItemCompra.compra_id == compra.id)
            items = session.exec(items_statement).all()
            total_productos += sum(item.cantidad for item in items)
        
        # Compra más reciente
        compra_reciente = max(compras, key=lambda c: c.fecha)
        
        # Compra más grande
        compra_grande = max(compras, key=lambda c: c.total)
        
        return {
            "total_compras": total_compras,
            "total_gastado": float(total_gastado),
            "promedio_compra": float(promedio_compra),
            "total_productos_comprados": total_productos,
            "compra_mas_reciente": {
                "id": compra_reciente.id,
                "fecha": compra_reciente.fecha.isoformat(),
                "total": float(compra_reciente.total)
            },
            "compra_mas_grande": {
                "id": compra_grande.id,
                "fecha": compra_grande.fecha.isoformat(),
                "total": float(compra_grande.total)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
