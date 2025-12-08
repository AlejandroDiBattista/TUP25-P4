from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
from pathlib import Path
from typing import Annotated, List, Optional
from sqlmodel import SQLModel, Session, select
from fastapi.security import OAuth2PasswordRequestForm

from database import engine, get_session
from models.models import Carrito, CarritoRead, Compra, CompraRead, ItemCarrito, ItemCarritoCreate, ItemCarritoRead, ItemCompra, Producto, ProductoRead, Usuario, UsuarioCreate, UsuarioRead
from auth.security import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token, get_current_user, get_password_hash, verify_password
from auth.schemas import Token, UsuarioLogin

app = FastAPI(title="API Productos")

# Montar directorio de imágenes como archivos estáticos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def populate_database():
    """Carga los productos desde productos.json a la base de datos si no existen."""
    ruta_productos = Path(__file__).parent / "productos.json"
    with Session(engine) as session:
        # Verificar si ya hay productos
        if not session.exec(select(Producto)).first():
            print("Cargando productos iniciales en la base de datos...")
            with open(ruta_productos, "r", encoding="utf-8") as archivo:
                productos_json = json.load(archivo)
                for prod_data in productos_json:
                    producto = Producto.model_validate(prod_data)
                    session.add(producto)
            session.commit()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    populate_database()

@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}

@app.post("/registrar", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED, tags=["Usuarios"])
def registrar_usuario(user_data: dict, session: Session = Depends(get_session)):
    """Registra un nuevo usuario en la base de datos."""
    # Verificar si el email ya existe
    usuario_existente = session.exec(select(Usuario).where(Usuario.email == user_data["email"])).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado.",
        )

    hashed_password = get_password_hash(user_data["password"])

    usuario = Usuario(
        nombre=user_data["nombre"],
        email=user_data["email"],
        password_hash=hashed_password
    )
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    
    return usuario

@app.post("/iniciar-sesion", response_model=Token, tags=["Usuarios"])
def iniciar_sesion(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    """Inicia sesión y devuelve un token de acceso."""
    usuario = session.exec(select(Usuario).where(Usuario.email == form_data.username)).first()
    if not usuario or not verify_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="usuario o contraseña incorrecto",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": usuario.email}, expires_delta=access_token_expires)
    return Token(access_token=access_token, token_type="bearer")

@app.get("/usuarios/me", response_model=UsuarioRead, tags=["Usuarios"])
def leer_usuario_actual(current_user: Annotated[Usuario, Depends(get_current_user)]):
    """Obtiene el perfil del usuario actualmente autenticado."""
    return current_user

@app.get("/productos", response_model=List[ProductoRead], tags=["Productos"], summary="Obtener lista de productos")
def obtener_productos(session: Session = Depends(get_session), q: Optional[str] = None, categoria: Optional[str] = None):
    """Obtiene la lista de todos los productos desde la base de datos."""
    query = select(Producto)
    if q:
        query = query.where(Producto.titulo.contains(q))
    if categoria:
        query = query.where(Producto.categoria == categoria)
    
    productos = session.exec(query).all()
    return productos

@app.get("/productos/{id}", response_model=ProductoRead, tags=["Productos"], summary="Obtener un producto por ID")
def obtener_producto(id: int, session: Session = Depends(get_session)):
    """Obtiene los detalles de un producto específico."""
    producto = session.get(Producto, id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto

# --- Endpoints del Carrito ---

def get_or_create_carrito(session: Session, usuario_id: int) -> Carrito:
    """Obtiene el carrito de un usuario o crea uno nuevo si no existe."""
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == usuario_id)).first()
    if not carrito:
        carrito = Carrito(usuario_id=usuario_id)
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    return carrito

def calcular_totales_carrito(carrito: Carrito) -> CarritoRead:
    """Calcula los subtotales, IVA, envío y total del carrito."""
    subtotal = sum(item.producto.precio * item.cantidad for item in carrito.items)
    
    iva_electronicos = sum(item.producto.precio * item.cantidad * 0.10 for item in carrito.items if item.producto.categoria == "Electrónica")
    iva_otros = sum(item.producto.precio * item.cantidad * 0.21 for item in carrito.items if item.producto.categoria != "Electrónica")
    iva_total = iva_electronicos + iva_otros

    costo_envio = 0 if subtotal > 1000 else 50
    total = subtotal + iva_total + costo_envio

    items_read = [ItemCarritoRead(producto=item.producto, cantidad=item.cantidad) for item in carrito.items]

    return CarritoRead(
        items=items_read,
        subtotal=round(subtotal, 2),
        costo_envio=round(costo_envio, 2),
        iva=round(iva_total, 2),
        total=round(total, 2)
    )

@app.get("/carrito", response_model=CarritoRead, tags=["Carrito"], summary="Ver contenido del carrito")
def ver_carrito(current_user: Annotated[Usuario, Depends(get_current_user)], session: Session = Depends(get_session)):
    """Muestra el contenido del carrito del usuario actual."""
    carrito = get_or_create_carrito(session, current_user.id)
    return calcular_totales_carrito(carrito)

@app.post("/carrito", response_model=CarritoRead, tags=["Carrito"], summary="Agregar producto al carrito")
def agregar_al_carrito(item_create: ItemCarritoCreate, current_user: Annotated[Usuario, Depends(get_current_user)], session: Session = Depends(get_session)):
    """Agrega un producto al carrito."""
    carrito = get_or_create_carrito(session, current_user.id)
    
    producto = session.get(Producto, item_create.producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    # Solo verificar stock si estamos agregando productos (cantidad positiva)
    if item_create.cantidad > 0 and producto.existencia < item_create.cantidad:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No hay suficiente existencia del producto")

    item_existente = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == item_create.producto_id)).first()

    if item_existente:
        item_existente.cantidad += item_create.cantidad
        session.add(item_existente)
    else:
        nuevo_item = ItemCarrito.model_validate(item_create, update={"carrito_id": carrito.id})
        session.add(nuevo_item)

    # Descontar stock del producto
    producto.existencia -= item_create.cantidad
    session.add(producto)

    session.commit()
    session.refresh(carrito)
    
    return calcular_totales_carrito(carrito)

@app.delete("/carrito/{producto_id}", response_model=CarritoRead, tags=["Carrito"], summary="Quitar producto del carrito")
def quitar_del_carrito(producto_id: int, current_user: Annotated[Usuario, Depends(get_current_user)], session: Session = Depends(get_session)):
    """Quita un producto del carrito del usuario actual."""
    carrito = get_or_create_carrito(session, current_user.id)
    item_a_eliminar = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == producto_id)).first()

    if not item_a_eliminar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado en el carrito")

    # Restaurar stock del producto
    producto = session.get(Producto, producto_id)
    if producto:
        producto.existencia += item_a_eliminar.cantidad
        session.add(producto)

    session.delete(item_a_eliminar)
    session.commit()
    session.refresh(carrito)

    return calcular_totales_carrito(carrito)

@app.post("/carrito/cancelar", status_code=status.HTTP_204_NO_CONTENT, tags=["Carrito"], summary="Cancelar compra y vaciar carrito")
def cancelar_compra(current_user: Annotated[Usuario, Depends(get_current_user)], session: Session = Depends(get_session)):
    """Cancela la compra actual, vacía el carrito y restaura el stock."""
    carrito = get_or_create_carrito(session, current_user.id)

    # Restaurar stock de todos los items antes de eliminarlos
    for item in carrito.items:
        producto = session.get(Producto, item.producto_id)
        if producto:
            producto.existencia += item.cantidad
            session.add(producto)
        session.delete(item)

    session.commit()
    return

class FinalizarCompraRequest(SQLModel):
    direccion: str
    tarjeta: str

@app.post("/carrito/finalizar", response_model=CompraRead, tags=["Carrito"], summary="Finalizar la compra")
def finalizar_compra(compra_data: FinalizarCompraRequest, current_user: Annotated[Usuario, Depends(get_current_user)], session: Session = Depends(get_session)):
    """Finaliza la compra, crea un registro de la misma y vacía el carrito."""
    carrito = get_or_create_carrito(session, current_user.id)
    if not carrito.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito está vacío")

    totales = calcular_totales_carrito(carrito)

    # Crear la compra
    nueva_compra = Compra(
        usuario_id=current_user.id,
        direccion=compra_data.direccion,
        tarjeta=compra_data.tarjeta, # Simplificado para el TP
        total=totales.total,
        envio=totales.costo_envio
    )
    session.add(nueva_compra)
    session.commit()
    session.refresh(nueva_compra)

    # Mover items del carrito a la compra
    for item in carrito.items:
        item_compra = ItemCompra(
            compra_id=nueva_compra.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            nombre=item.producto.titulo,
            precio_unitario=item.producto.precio
        )
        session.add(item_compra)
        session.delete(item) # Eliminar item del carrito

    session.commit()
    session.refresh(nueva_compra)

    return nueva_compra

@app.post("/carrito/cancelar", status_code=status.HTTP_204_NO_CONTENT, tags=["Carrito"], summary="Cancelar compra y vaciar carrito")
def cancelar_compra(current_user: Annotated[Usuario, Depends(get_current_user)], session: Session = Depends(get_session)):
    """Cancela la compra actual y vacía el carrito."""
    carrito = get_or_create_carrito(session, current_user.id)

    # Restaurar stock de todos los items antes de eliminarlos
    for item in carrito.items:
        producto = session.get(Producto, item.producto_id)
        if producto:
            producto.existencia += item.cantidad
            session.add(producto)
        session.delete(item)

    session.commit()
    return

class FinalizarCompraRequest(SQLModel):
    direccion: str
    tarjeta: str

@app.post("/carrito/finalizar", response_model=CompraRead, tags=["Carrito"], summary="Finalizar la compra")
def finalizar_compra(compra_data: FinalizarCompraRequest, current_user: Annotated[Usuario, Depends(get_current_user)], session: Session = Depends(get_session)):
    """Finaliza la compra, crea un registro de la misma y vacía el carrito."""
    carrito = get_or_create_carrito(session, current_user.id)
    if not carrito.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito está vacío")

    totales = calcular_totales_carrito(carrito)

    # Crear la compra
    nueva_compra = Compra(
        usuario_id=current_user.id,
        direccion=compra_data.direccion,
        tarjeta=compra_data.tarjeta, # Simplificado para el TP
        total=totales.total,
        envio=totales.costo_envio
    )
    session.add(nueva_compra)
    session.commit()
    session.refresh(nueva_compra)

    # Mover items del carrito a la compra
    for item in carrito.items:
        item_compra = ItemCompra(
            compra_id=nueva_compra.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            nombre=item.producto.titulo,
            precio_unitario=item.producto.precio
        )
        session.add(item_compra)
        
        # Eliminar item del carrito
        session.delete(item)

    session.commit()
    session.refresh(nueva_compra)

    return nueva_compra

# --- Endpoints de Historial de Compras ---

@app.get("/compras", response_model=List[CompraRead], tags=["Compras"], summary="Ver historial de compras")
def ver_historial_compras(current_user: Annotated[Usuario, Depends(get_current_user)], session: Session = Depends(get_session)):
    """Obtiene el historial de compras del usuario actual."""
    compras = session.exec(select(Compra).where(Compra.usuario_id == current_user.id)).all()
    compras = session.exec(select(Compra).where(Compra.usuario_id == current_user.id).order_by(Compra.fecha.desc())).all()
    return compras

@app.get("/compras/{compra_id}", response_model=CompraRead, tags=["Compras"], summary="Ver detalle de una compra")
def ver_detalle_compra(compra_id: int, current_user: Annotated[Usuario, Depends(get_current_user)], session: Session = Depends(get_session)):
    """Obtiene los detalles de una compra específica del usuario actual."""
    compra = session.get(Compra, compra_id)
    if not compra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compra no encontrada")
    if compra.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver esta compra")
    return compra

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
