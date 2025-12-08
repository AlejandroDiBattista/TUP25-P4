from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from sqlalchemy.orm import joinedload

import json
from pathlib import Path
from unidecode import unidecode


from sqlmodel import Session, select
from database import crear_tablas, get_session, engine
from models.usuarios import Usuario
from models.productos import Producto
from models.carrito import Carrito, ItemCarrito
from models.compras import Compra, ItemCompra

from jose import jwt, JWTError
from dtos.userDto import UsuarioRegister, UsuarioLogin, Token
from auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM, CREDENTIALS_EXCEPTION, oauth2_scheme
from dtos.carritoDto import CarritoAdd, CarritoRead
from dtos.productoDto import ProductoRead
from dtos.compraDto import CompraFinalizar, CompraExito, CompraResumen, CompraDetalle


app = FastAPI(title="API Productos")


def normalize_text(text: str) -> str:
    """Convierte el texto a minúsculas y elimina los acentos para almacenamiento."""
    if not text:
        return ""
    #Quitar acentos
    text = unidecode(text)
    #Convertir a minúsculas
    return text.lower()


def cargar_datos_iniciales(session: Session):
    """Inserta los productos del JSON en la DB si la tabla está vacía."""
    
    # comprobamos si ya hay productos en la base de datos
    productos_existentes = session.exec(select(Producto)).all()

    if not productos_existentes:
        print("La base de datos de productos está vacía. Cargando desde JSON...")
        
        datos_json = cargar_productos() # La función que ya tenías
        
        
        productos_a_crear = []
        for item in datos_json:

            if 'categoria' in item:
                item['categoria'] = normalize_text(item['categoria'])

            producto_db = Producto.model_validate(item) 
            productos_a_crear.append(producto_db)
            
        session.add_all(productos_a_crear)
        session.commit()
        print(f"Cargados {len(productos_a_crear)} productos en la base de datos.")
    else:
        print("La base de datos ya contiene productos.")


# crear la base de datos sqlite
@app.on_event("startup")
def startup():
    crear_tablas()
    try:
        with Session(engine) as session: # Abre una sesión para la carga inicial
            cargar_datos_iniciales(session)
    except Exception as e:
        # Esto te ayudará a diagnosticar si el error persiste
        print(f"Error durante la carga inicial de datos: {e}")


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

# Cargar productos desde el archivo JSON
def cargar_productos():
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        return json.load(archivo)

@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}

@app.get("/productos",response_model=List[ProductoRead])
def obtener_productos(
    session: Session = Depends(get_session),
    categoria: str = Query(None, description="Filtrar productos por categoría"),
    buscar: str = Query(None, description="Término de búsqueda por nombre o descripción"),
):
    statement = select(Producto)

    if categoria:
        categoria_normalizada = normalize_text(categoria)
        termino_categoria = f"%{categoria_normalizada}%"

        statement = statement.where(
            Producto.categoria.ilike(termino_categoria) 
        )

    if buscar:
        termino_busqueda = f"%{buscar}%"
        print(termino_busqueda)

        statement = statement.where(
            (Producto.titulo.ilike(termino_busqueda)) |  # Filtra por nombre
            (Producto.descripcion.ilike(termino_busqueda)) # O Filtra por descripción
        )

    productos_db = session.exec(statement).all()

    productos_con_estado: List[ProductoRead] = []
    
    for producto in productos_db:
        producto_read = ProductoRead.model_validate(producto)
        producto_read.agotado = producto.existencia <= 0
        productos_con_estado.append(producto_read)
    
    return productos_con_estado

@app.get("/productos/{producto_id}", response_model=ProductoRead)
def obtener_producto_por_id(
    producto_id: int, # FastAPI automáticamente toma este valor de la URL
    session: Session = Depends(get_session)
):   
    producto = session.get(Producto, producto_id)
    
    if not producto:
        # Si no se encuentra, devolvemos el código de estado 404 Not Found
        raise HTTPException(
            status_code=404,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    producto_read = ProductoRead.model_validate(producto)
    producto_read.agotado = producto.existencia <= 0
        
    return producto_read


#----------------------------------------
#               users
#----------------------------------------

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    try:
        # Decodificar el token con la clave secreta
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("user_id")
        
        if user_id is None:
            raise CREDENTIALS_EXCEPTION
            
    except JWTError:
        raise CREDENTIALS_EXCEPTION

    # Buscar el usuario en la DB por el ID en el token
    user = session.get(Usuario, int(user_id))
    if user is None:
        raise CREDENTIALS_EXCEPTION
        
    return user 


@app.post("/registrar", status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario_data: UsuarioRegister, session: Session = Depends(get_session)):
    
    #  Verificar si el email ya existe (para devolver un 400 más claro)
    existing_user = session.exec(select(Usuario).where(Usuario.email == usuario_data.email)).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya está registrado")

    password_to_hash = usuario_data.password
    hashed_password = get_password_hash(password_to_hash)
    
    # Crear el objeto de la base de datos
    db_usuario = Usuario(
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        hashed_password=hashed_password
    )
    
    # Guardar en DB
    session.add(db_usuario)
    session.commit()
    session.refresh(db_usuario)
    
    # Generar y devolver el token (loguear automáticamente)
    # access_token = create_access_token(data={"user_id": db_usuario.id})
    # return Token(access_token=access_token)
    return {"message": "Usuario registrado exitosamente", "usuario_id": db_usuario.id}


@app.post("/iniciar-sesion", response_model=Token)
def iniciar_sesion(usuario_data: UsuarioLogin, session: Session = Depends(get_session)):
    
    # Buscar el usuario
    usuario = session.exec(select(Usuario).where(Usuario.email == usuario_data.email)).first()
    
    # Verificar existencia y contraseña
    if not usuario or not verify_password(usuario_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Crear y devolver el token
    access_token = create_access_token(data={"user_id": usuario.id})
    return Token(access_token=access_token)



@app.post("/cerrar-sesion", status_code=status.HTTP_200_OK)
def cerrar_sesion(current_user: Usuario = Depends(get_current_user)):
    return {"message": f"Sesión de {current_user.email} cerrada. El token ya no debe usarse."}



#----------------------------------------
#               carrito
#----------------------------------------


def get_or_create_active_cart(session: Session, user_id: int) -> Carrito:
    """Busca el carrito activo del usuario o crea uno si no existe."""
    carrito = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == user_id,
            Carrito.estado == "activo"
        )
    ).first()
    
    if not carrito:
        carrito = Carrito(usuario_id=user_id, estado="activo")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    
    return carrito

@app.get("/carrito", response_model=List[CarritoRead])
def obtener_carrito(
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Usamos joinedload para cargar los ítems y los productos de los ítems en una sola consulta.
    statement = (
        select(Carrito)
        .where(
            Carrito.usuario_id == current_user.id,
            Carrito.estado == "activo"
        )
        .options(joinedload(Carrito.items).joinedload(ItemCarrito.producto)) # Carga ItemCarrito y luego el Producto dentro de ItemCarrito
    )
    
    carrito = session.exec(statement).first()
    
    if not carrito:
        return [] 
    
    # 2. Devolver la lista de ITEMS
    return carrito.items


@app.post("/carrito", status_code=status.HTTP_201_CREATED)
def agregar_producto_a_carrito(
    item_data: CarritoAdd, 
    current_user: Usuario = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """Agrega un producto al carrito activo o actualiza la cantidad si ya existe."""
    
    carrito = get_or_create_active_cart(session, current_user.id)
    
    # Verificar Producto y Stock (Asumo que Producto tiene 'existencia' o 'stock')
    producto = session.get(Producto, item_data.producto_id)
    
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    
    # BUSCAR ÍTEM EXISTENTE EN EL CARRITO
    item_carrito = session.exec(
        select(ItemCarrito).where(
            ItemCarrito.carrito_id == carrito.id,
            ItemCarrito.producto_id == item_data.producto_id
        )
    ).first()

    cantidad_existente = item_carrito.cantidad if item_carrito else 0
    cantidad_total_solicitada = item_data.cantidad
    
    # VALIDACIÓN DE EXISTENCIA
    if producto.existencia < cantidad_total_solicitada: 
        raise HTTPException(status_code=400, detail=f"Stock insuficiente. Solo quedan {producto.existencia} unidades.")

    if item_carrito:
        item_carrito.cantidad = cantidad_total_solicitada
    else:
        item_carrito = ItemCarrito(
            carrito_id=carrito.id,
            producto_id=item_data.producto_id,
            cantidad=item_data.cantidad
        )

    session.add(item_carrito)

    producto.existencia -= (item_data.cantidad - cantidad_existente)
    session.add(producto)

    session.commit()
    session.refresh(item_carrito)

    return {"message": "Producto agregado o actualizado en el carrito."}


@app.delete("/carrito/{producto_id}", status_code=status.HTTP_200_OK)
def eliminar_producto_de_carrito(
    producto_id: int,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Elimina un ítem del carrito activo del usuario."""
    
    # Obtener el carrito activo
    carrito = get_or_create_active_cart(session, current_user.id)
    
    #  Buscar el ItemCarrito específico
    item_carrito = session.exec(
        select(ItemCarrito).where(
            ItemCarrito.carrito_id == carrito.id,
            ItemCarrito.producto_id == producto_id
        )
    ).first()

    if not item_carrito:
        raise HTTPException(status_code=404, detail="Producto no encontrado en tu carrito.")
        
    #  Eliminar el ítem
    session.delete(item_carrito)

    producto = session.get(Producto, producto_id)
    producto.existencia += item_carrito.cantidad
    session.add(producto)

    session.commit()

    return {"message": "Producto eliminado del carrito."}


@app.post("/carrito/cancelar", status_code=status.HTTP_200_OK)
def vaciar_carrito(
    current_user: Usuario = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """Vacía completamente el carrito activo del usuario (mantiene el objeto Carrito)."""
    
    # 1. Obtener el carrito activo
    carrito = get_or_create_active_cart(session, current_user.id)
    
    
    items_a_eliminar = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
    ).all()
    
    if not items_a_eliminar:
        return {"message": "El carrito ya está vacío."}

    for item in items_a_eliminar:
        producto = session.get(Producto, item.producto_id)
        producto.existencia += item.cantidad
        session.delete(item)
    
    session.commit()
    
    #  Actualizar el estado del carrito a "cancelado" o mantener "activo"
    carrito.estado = "Inactivo" 
    session.add(carrito)
    session.commit()
    
    return {"message": "Carrito vaciado exitosamente (Compra cancelada)."}


#----------------------------------------
#               compras
#----------------------------------------

@app.post("/carrito/finalizar", response_model=CompraExito)
def finalizar_compra(
    compra_data: CompraFinalizar, 
    current_user: Usuario = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """Procesa el pago, crea el registro de compra y vacía el carrito activo."""

    carrito = get_or_create_active_cart(session, current_user.id)
    
    session.refresh(carrito) 
    
    if not carrito.items:
        raise HTTPException(status_code=400, detail="El carrito está vacío.")
 
    #Variables para el cálculo
    subtotal = 0.0
    ENVIO = 50.0 
    ENVIOGRATIS = 1000.0
    items_compra_final = []
    
    for item_carrito in carrito.items:
        producto = session.get(Producto, item_carrito.producto_id)
        
        # 4a. Validación de Stock final
        if not producto or producto.existencia < item_carrito.cantidad:
            # Revertir todo y notificar qué producto falla
            raise HTTPException(
                status_code=400, 
                detail=f"Stock insuficiente para {producto.titulo if producto else 'producto desconocido'}. Intente de nuevo."
            )
            
        #  Calcular subtotal y preparar ItemCompra
        # if producto.categoria == "electronica":
        #     precio_unitario = producto.precio * 1.10
        #     iva = producto.precio * 0.10 * item_carrito.cantidad
        # else:
        #     precio_unitario = producto.precio * 1.21
        #     iva = producto.precio * 0.21 * item_carrito.cantidad

        precio_base = producto.precio
        if producto.categoria == "electronica":
            tasa_iva = 0.10
        else:
            tasa_iva = 0.21

        iva = precio_base * tasa_iva * item_carrito.cantidad
        precio_unitario = precio_base        
            
        costo_item = item_carrito.cantidad * precio_unitario
        subtotal += costo_item
        
        #  Crear el objeto ItemCompra
        item_compra = ItemCompra(
            producto_id=producto.id,
            cantidad=item_carrito.cantidad,
            nombre=producto.titulo, # Capturar nombre y precio para el historial
            precio_unitario=precio_unitario,
            iva=iva
        )
        items_compra_final.append(item_compra)

        
    #  Crear la Compra principal
    if subtotal> ENVIOGRATIS:
        ENVIO = 0.0

    total_final = subtotal + ENVIO
    
    nueva_compra = Compra(
        usuario_id=current_user.id,
        direccion=compra_data.direccion,
        tarjeta=compra_data.tarjeta,
        total=total_final,
        envio=ENVIO, 
    )
    
    session.add(nueva_compra)
    session.flush() # Obtiene el ID de la Compra antes del commit 

    for item_compra in items_compra_final:

        item_compra.compra_id = nueva_compra.id 
        session.add(item_compra)
    
    # Vaciar/Inactivar el Carrito
    for item in carrito.items:
        session.delete(item) # Eliminar ItemCarrito
        
    carrito.estado = "finalizado" # Cambiar estado del Carrito principal
    session.add(carrito)
    
    # COMMIT: Si todo lo anterior funcionó, se guardan los cambios
    session.commit()
    session.refresh(nueva_compra)
    
    # Devolver éxito
    return CompraExito(
        message="Compra finalizada exitosamente.",
        compra_id=nueva_compra.id,
        total_pagado=total_final
    )

@app.get("/compras", response_model=List[CompraResumen])
def ver_historial_compras(
    current_user: Usuario = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """Muestra el resumen de todas las compras realizadas por el usuario."""
    
    compras = session.exec(
        select(Compra)
        .where(Compra.usuario_id == current_user.id)
        .order_by(Compra.fecha.desc())
    ).all()
    
    return compras



@app.get("/compras/{compra_id}", response_model=CompraDetalle)
def ver_detalle_compra(
    compra_id: int,
    current_user: Usuario = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    """Muestra el detalle completo de una compra específica (incluyendo items)."""
    
    statement = (
        select(Compra)
        .where(
            Compra.id == compra_id,
            Compra.usuario_id == current_user.id
        )
        .options(joinedload(Compra.items))
    )
    
    compra = session.exec(statement).first()
    
    
   
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada.")
        
    return compra


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
