import json
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime  # <-- Import necesario para el arreglo

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlmodel import SQLModel, Session, create_engine, select, or_

# Importa nuestros módulos
import security
from models.productos import Producto
from models.usuarios import Usuario
from models.compras import CarritoItem, Compra, CompraItem


# --- 1. Configuración de la Base de Datos ---

DATABASE_FILE = "ecommerce.db"
engine = create_engine(f"sqlite:///{DATABASE_FILE}")


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def load_initial_products():
    with Session(engine) as session:
        if not session.exec(select(Producto)).first():
            print("INFO:     Base de datos vacía, cargando productos iniciales...")
            try:
                with open("productos.json", "r", encoding="utf-8") as f:
                    products_data = json.load(f)
                    for prod_data in products_data:
                        img_path = prod_data.get("imagen")
                        if img_path and img_path.startswith("imagenes/"):
                            prod_data["imagen"] = img_path.split("/")[-1]
                        producto = Producto(**prod_data)
                        session.add(producto)
                    session.commit()
                print("INFO:     Productos iniciales cargados con éxito.")
            except FileNotFoundError:
                print("ADVERTENCIA: No se encontró 'productos.json'.")
            except Exception as e:
                print(f"ERROR: No se pudieron cargar productos: {e}")

# --- 2. Eventos de Ciclo de Vida (Lifespan) ---


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("INFO:     Iniciando aplicación...")
    create_db_and_tables()
    load_initial_products()
    yield
    print("INFO:     Apagando aplicación...")


# --- 3. Creación de la Aplicación FastAPI ---

app = FastAPI(
    title="API E-Commerce TP6",
    description="API para el proyecto de E-Commerce con FastAPI y SQLModel.",
    version="0.1.0",
    lifespan=lifespan
)

# --- 4. Configuración de CORS ---

origins = ["http://localhost:3000", "http://localhost"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 5. Montaje de Archivos Estáticos ---
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# --- 6. Dependencia de Sesión de BBDD ---


def get_session():
    with Session(engine) as session:
        yield session

# --- 7. Endpoint de Bienvenida ---


@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido a la API E-Commerce del TP6"}

# --- 8. Endpoints de Productos ---


@app.get("/productos", response_model=List[Producto])
def get_productos_con_filtros(
    session: Session = Depends(get_session),
    buscar: Optional[str] = None,
    categoria: Optional[str] = None
):
    """
    Obtiene una lista de todos los productos, con filtros opcionales
    de búsqueda por texto y categoría.
    (Pruebas 2.1, 2.2, 2.3, 2.4 de api-tests.http)
    """
    statement = select(Producto)
    if buscar:
        statement = statement.where(
            or_(
                Producto.titulo.contains(buscar),
                Producto.descripcion.contains(buscar)
            )
        )
    if categoria:
        statement = statement.where(Producto.categoria == categoria)
    productos = session.exec(statement).all()
    return productos


@app.get("/productos/{producto_id}", response_model=Producto)
def get_producto(producto_id: int, session: Session = Depends(get_session)):
    """
    Obtiene un producto específico por su ID.
    (Prueba 2.5 y 2.6 de api-tests.http)
    """
    try:
        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return producto
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR en get_producto: {e}")
        print(f"Traceback: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# --- 9. Modelos Pydantic para Autenticación ---


class UserCreate(BaseModel):
    nombre: str
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserLogin(BaseModel):
    email: str
    password: str

# --- 10. Endpoints de Autenticación ---


@app.post("/registrar", response_model=Usuario)
def registrar_usuario(
    user_data: UserCreate,
    session: Session = Depends(get_session)
):
    user_in_db = session.exec(select(Usuario).where(
        Usuario.email == user_data.email)).first()
    if user_in_db:
        raise HTTPException(
            status_code=400, detail="El email ya está registrado")

    print(
        f"DEBUG: Registrando... Longitud de contraseña recibida: {len(user_data.password)}")
    hashed_pass = security.hash_password(user_data.password)
    nuevo_usuario = Usuario(
        nombre=user_data.nombre,
        email=user_data.email,
        hashed_password=hashed_pass
    )
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    return nuevo_usuario


@app.post("/iniciar-sesion", response_model=Token)
def iniciar_sesion(
    form_data: UserLogin,
    session: Session = Depends(get_session)
):
    user = session.exec(select(Usuario).where(
        Usuario.email == form_data.email)).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- 11. Dependencia de Autenticación ---


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/iniciar-sesion")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
):
    payload = security.decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=401, detail="Token inválido o expirado", headers={"WWW-Authenticate": "Bearer"})
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=401, detail="No se pudo validar el token", headers={"WWW-Authenticate": "Bearer"})
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if user is None:
        raise HTTPException(
            status_code=401, detail="Usuario no encontrado", headers={"WWW-Authenticate": "Bearer"})
    return user


@app.get("/usuarios/me", response_model=Usuario)
def read_users_me(current_user: Usuario = Depends(get_current_user)):
    return current_user

# --- 12. Modelos Pydantic para Carrito ---


class CarritoItemCreate(BaseModel):
    producto_id: int
    cantidad: int


class CheckoutRequest(BaseModel):
    direccion: str
    tarjeta: str

# --- 13. Endpoints del Carrito de Compras ---


@app.get("/carrito", response_model=List[CarritoItem])
def get_carrito(
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(CarritoItem).where(
        CarritoItem.usuario_id == current_user.id)
    return session.exec(statement).all()


@app.post("/carrito", response_model=CarritoItem)
def add_to_carrito(
    item_data: CarritoItemCreate,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    producto = session.get(Producto, item_data.producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if producto.existencia < item_data.cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    statement = select(CarritoItem).where(
        CarritoItem.usuario_id == current_user.id,
        CarritoItem.producto_id == item_data.producto_id
    )
    item_existente = session.exec(statement).first()

    if item_existente:
        item_existente.cantidad += item_data.cantidad
        session.add(item_existente)
        session.commit()
        session.refresh(item_existente)
        return item_existente
    else:
        nuevo_item = CarritoItem(
            usuario_id=current_user.id,
            producto_id=item_data.producto_id,
            cantidad=item_data.cantidad
        )
        session.add(nuevo_item)
        session.commit()
        session.refresh(nuevo_item)
        return nuevo_item


@app.delete("/carrito/{producto_id}", response_model=dict)
def remove_from_carrito(
    producto_id: int,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    statement = select(CarritoItem).where(
        CarritoItem.usuario_id == current_user.id,
        CarritoItem.producto_id == producto_id
    )
    item_a_borrar = session.exec(statement).first()
    if not item_a_borrar:
        raise HTTPException(
            status_code=404, detail="Producto no encontrado en el carrito")
    session.delete(item_a_borrar)
    session.commit()
    return {"mensaje": "Producto eliminado del carrito"}


@app.post("/carrito/cancelar", response_model=dict)
def cancelar_compra(
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    items_carrito = session.exec(select(CarritoItem).where(
        CarritoItem.usuario_id == current_user.id)).all()
    for item in items_carrito:
        session.delete(item)
    session.commit()
    return {"mensaje": "Carrito vaciado"}

# --- 14. Endpoint de Finalización de Compra ---


@app.post("/carrito/finalizar", response_model=Compra)
def finalizar_compra(
    checkout_data: CheckoutRequest,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    items_carrito = session.exec(select(CarritoItem).where(
        CarritoItem.usuario_id == current_user.id)).all()
    if not items_carrito:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    nueva_compra = Compra(
        usuario_id=current_user.id,
        direccion=checkout_data.direccion,
        total=0
    )
    session.add(nueva_compra)
    session.commit()
    session.refresh(nueva_compra)

    total_compra = 0
    for item in items_carrito:
        producto = session.get(Producto, item.producto_id)
        if not producto or producto.existencia < item.cantidad:
            raise HTTPException(
                status_code=400, detail=f"Stock insuficiente o producto no encontrado: {item.producto_id}")

        producto.existencia -= item.cantidad
        session.add(producto)

        total_item = producto.precio * item.cantidad
        total_compra += total_item

        item_comprado = CompraItem(
            compra_id=nueva_compra.id,
            producto_id=producto.id,
            cantidad=item.cantidad,
            precio_unitario=producto.precio
        )
        session.add(item_comprado)
        session.delete(item)

    total_con_iva = total_compra * 1.21
    if total_con_iva < 1000:
        total_con_iva += 50

    nueva_compra.total = round(total_con_iva, 2)
    session.add(nueva_compra)
    session.commit()
    session.refresh(nueva_compra)
    
    return nueva_compra

# --- 15. Modelos Pydantic para Historial (¡EL ARREGLO!) ---


class CompraItemPublic(BaseModel):  # <-- ¡ES BASEMODEL!
    """Modelo Pydantic para mostrar un item de una compra."""
    producto_id: int
    cantidad: int
    precio_unitario: float


class CompraPublic(BaseModel):  # <-- ¡ES BASEMODEL! (NO hereda de Compra)
    """Modelo Pydantic para mostrar el detalle de una compra."""
    id: int
    fecha: datetime
    direccion: str
    total: float
    items: List[CompraItemPublic] = []


class CompraListPublic(BaseModel):
    """Modelo para mostrar una compra en la lista de compras (con items incluidos)."""
    id: int
    fecha: datetime
    direccion: str
    total: float
    items: List[CompraItemPublic] = []

# --- 16. Endpoints del Historial de Compras ---


@app.get("/compras", response_model=List[CompraListPublic])
def get_historial_compras(
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Obtener todas las compras del usuario
    statement = select(Compra).where(Compra.usuario_id == current_user.id)
    compras = session.exec(statement).all()
    
    # Para cada compra, obtener sus items
    compras_con_items = []
    for compra in compras:
        statement_items = select(CompraItem).where(
            CompraItem.compra_id == compra.id
        )
        items_db = session.exec(statement_items).all()
        
        # Convertir items a CompraItemPublic
        items_publicos = [
            CompraItemPublic(
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario
            )
            for item in items_db
        ]
        
        compra_publica = CompraListPublic(
            id=compra.id,
            fecha=compra.fecha,
            direccion=compra.direccion,
            total=compra.total,
            items=items_publicos
        )
        compras_con_items.append(compra_publica)
    
    return compras_con_items


@app.get("/compras/{compra_id}", response_model=CompraPublic)
def get_detalle_compra(
    compra_id: int,
    current_user: Usuario = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Busca la compra (el SQLModel)
    compra = session.get(Compra, compra_id)

    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    if compra.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acceso denegado")

    # 2. Busca los items de la compra (los SQLModel)
    statement_items = select(CompraItem).where(
        CompraItem.compra_id == compra_id)
    items = session.exec(statement_items).all()

    # 3. Crea el objeto de respuesta (el BaseModel)
    compra_publica = CompraPublic.model_validate(compra)
    compra_publica.items = items

    return compra_publica