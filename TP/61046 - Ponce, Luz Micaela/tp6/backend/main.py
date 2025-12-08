from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import json
import bcrypt
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

from sqlmodel import SQLModel, create_engine, Session, select
from typing import List, Optional

import sqlite3
from unidecode import unidecode
from sqlalchemy import event, func
from sqlalchemy.engine import Engine

from models.productos import (
    Producto, Usuario, Carrito, CarritoItem, Compra, CompraItem,
    UsuarioCreate, UsuarioRead, UsuarioLogin,
    Token, TokenData,
    CarritoItemCreate,
    CarritoItemRead, CarritoRead,
    CompraCreate,
    CompraItemRead, CompraRead
)

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="iniciar-sesion")

DATABASE_FILE = "database.db"
DATABASE_URL = f"sqlite:///{DATABASE_FILE}"
engine = create_engine(DATABASE_URL, echo=False)

@event.listens_for(Engine, "connect")
def on_connect(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        dbapi_connection.create_function("unaccent", 1, unidecode)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def cargar_datos_iniciales():
    with Session(engine) as session:
        producto_existente = session.exec(select(Producto)).first()
        if not producto_existente:
            print("Base de datos vacía, cargando productos iniciales...")
            ruta_productos = Path(__file__).parent / "productos.json"
            with open(ruta_productos, "r", encoding="utf-8") as archivo:
                datos = json.load(archivo)
                for item in datos:
                    producto_nuevo = Producto(
                        id=item.get("id"),
                        titulo=item["titulo"],
                        descripcion=item["descripcion"],
                        precio=item["precio"],
                        categoria=item["categoria"],
                        existencia=item["existencia"],
                        imagen=item.get("imagen", ""),
                        valoracion=item.get("valoracion", 0.0)
                    )
                    session.add(producto_nuevo)
                session.commit()
                print("Productos cargados exitosamente.")
        else:
            print("La base de datos ya tiene productos. No se cargan datos.")

def get_session():
    with Session(engine) as session:
        yield session

def hash_password(password: str) -> str:
    pw_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(pw_bytes, salt)
    return hashed_pw.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(
    session: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        token_data = TokenData(email=email)

    except JWTError:
        raise credentials_exception

    db_usuario = session.exec(
        select(Usuario).where(Usuario.email == token_data.email)
    ).first()

    if db_usuario is None:
        raise credentials_exception

    return db_usuario

app = FastAPI(title="API TP6 - E-Commerce")
@app.on_event("startup")
def on_startup():
    print("Iniciando aplicación...")
    create_db_and_tables()
    cargar_datos_iniciales()
    print("Aplicación lista.")
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def root():
    return {"mensaje": "API de E-Commerce - use /docs para ver la documentación"}

@app.get("/productos", response_model=List[Producto])
def obtener_productos(
    session: Session = Depends(get_session),
    buscar: Optional[str] = None,
    categoria: Optional[str] = None
):
    query = select(Producto)

    if buscar:
        search_term = f"%{unidecode(buscar)}%"
        query = query.where(
            (func.unaccent(Producto.titulo).ilike(search_term)) |
            (func.unaccent(Producto.descripcion).ilike(search_term))
        )

    if categoria:
        category_term = f"%{unidecode(categoria)}%"
        query = query.where(
            func.unaccent(Producto.categoria).ilike(category_term)
        )

    productos = session.exec(query).all()
    return productos

@app.get("/productos/{id}", response_model=Producto)
def obtener_producto_por_id(
    id: int,
    session: Session = Depends(get_session)
):
    producto = session.get(Producto, id)

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    return producto

@app.post("/registrar", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario_data: UsuarioCreate, session: Session = Depends(get_session)):
    usuario_existente = session.exec(
        select(Usuario).where(Usuario.email == usuario_data.email)
    ).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado."
        )
    hashed_contrasena = hash_password(usuario_data.password)
    db_usuario = Usuario(
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        contrasena=hashed_contrasena
    )
    session.add(db_usuario)
    session.commit()
    session.refresh(db_usuario)
    return db_usuario

@app.post("/iniciar-sesion", response_model=Token)
def iniciar_sesion(
    usuario_login: UsuarioLogin,
    session: Session = Depends(get_session)
):
    db_usuario = session.exec(
        select(Usuario).where(Usuario.email == usuario_login.email)
    ).first()

    if not db_usuario or not verify_password(usuario_login.password, db_usuario.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_usuario.email},
        expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")

@app.post("/cerrar-sesion")
def cerrar_sesion(
    usuario_actual: Usuario = Depends(get_current_user)
):
    print(f"Usuario {usuario_actual.email} cerrando sesión.")
    return {"mensaje": f"Sesión cerrada para {usuario_actual.email}. Adios!"}


@app.post("/carrito", status_code=status.HTTP_201_CREATED)
def agregar_producto_al_carrito(
    item_data: CarritoItemCreate,
    session: Session = Depends(get_session),
    usuario_actual: Usuario = Depends(get_current_user)
):
    carrito = session.exec(
        select(Carrito).where(Carrito.usuario_id == usuario_actual.id)
    ).first()

    if not carrito:
        carrito = Carrito(usuario_id=usuario_actual.id, estado="activo")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)

    if carrito.estado == "finalizado":
        carrito.estado = "activo"

    producto = session.get(Producto, item_data.producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    if producto.existencia < item_data.cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No hay suficiente existencia. Disponibles: {producto.existencia}"
        )

    item_existente = session.exec(
        select(CarritoItem).where(
            CarritoItem.carrito_id == carrito.id,
            CarritoItem.producto_id == item_data.producto_id
        )
    ).first()

    if item_existente:
        nueva_cantidad = item_existente.cantidad + item_data.cantidad
        if producto.existencia < nueva_cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No hay suficiente existencia para agregar más. Disponibles: {producto.existencia}, en carrito: {item_existente.cantidad}"
            )
        item_existente.cantidad = nueva_cantidad

    else:
        item_existente = CarritoItem(
            carrito_id=carrito.id,
            producto_id=item_data.producto_id,
            cantidad=item_data.cantidad
        )

    session.add(item_existente)
    session.add(carrito)
    session.commit()
    session.refresh(item_existente)

    return {"mensaje": "Producto agregado al carrito", "item": item_existente}

@app.get("/carrito", response_model=CarritoRead)
def ver_carrito(
    session: Session = Depends(get_session),
    usuario_actual: Usuario = Depends(get_current_user)
):
    carrito = session.exec(
        select(Carrito).where(Carrito.usuario_id == usuario_actual.id, Carrito.estado == "activo")
    ).first()

    if not carrito:
        return CarritoRead(id=0, estado="inactivo")

    items_con_productos = session.exec(
        select(CarritoItem, Producto)
        .join(Producto, CarritoItem.producto_id == Producto.id)
        .where(CarritoItem.carrito_id == carrito.id)
    ).all()

    subtotal = 0.0
    iva = 0.0
    productos_leidos: List[CarritoItemRead] = []

    for item, producto in items_con_productos:
        productos_leidos.append(
            CarritoItemRead(cantidad=item.cantidad, producto=producto)
        )

        item_total = producto.precio * item.cantidad
        subtotal += item_total

        if "electrónica" in producto.categoria.lower():
            iva += item_total * 0.10 # 10% para electrónica
        else:
            iva += item_total * 0.21 # 21% para el resto

    envio = 0.0
    if subtotal <= 1000.0 and subtotal > 0:
        envio = 50.0

    total = subtotal + iva + envio

    return CarritoRead(
        id=carrito.id,
        estado=carrito.estado,
        productos=productos_leidos,
        subtotal=round(subtotal, 2), # Redondeamos a 2 decimales
        iva=round(iva, 2),
        envio=envio,
        total=round(total, 2)
    )

@app.delete("/carrito/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def quitar_producto_del_carrito(
    producto_id: int, # El ID viene de la URL
    session: Session = Depends(get_session),
    usuario_actual: Usuario = Depends(get_current_user)
):
    carrito = session.exec(
        select(Carrito).where(Carrito.usuario_id == usuario_actual.id, Carrito.estado == "activo")
    ).first()

    if not carrito:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró un carrito activo")

    item_a_borrar = session.exec(
        select(CarritoItem).where(
            CarritoItem.carrito_id == carrito.id,
            CarritoItem.producto_id == producto_id
        )
    ).first()

    if not item_a_borrar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado en el carrito")

    session.delete(item_a_borrar)
    session.commit()

    return None

@app.post("/carrito/cancelar", status_code=status.HTTP_200_OK)
def cancelar_compra_vaciar_carrito(
    session: Session = Depends(get_session),
    usuario_actual: Usuario = Depends(get_current_user)
):
    carrito = session.exec(
        select(Carrito).where(Carrito.usuario_id == usuario_actual.id, Carrito.estado == "activo")
    ).first()

    if not carrito:
        return {"mensaje": "El carrito ya está vacío"}

    items_a_borrar = session.exec(
        select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)
    ).all()

    if not items_a_borrar:
        return {"mensaje": "El carrito ya está vacío"}

    print(f"Borrando {len(items_a_borrar)} items del carrito {carrito.id}...")
    for item in items_a_borrar:
        session.delete(item)

    session.commit()

    return {"mensaje": "Carrito vaciado exitosamente"}

@app.post("/carrito/finalizar", response_model=Compra)
def finalizar_compra(
    compra_data: CompraCreate,
    session: Session = Depends(get_session),
    usuario_actual: Usuario = Depends(get_current_user)
):
    carrito = session.exec(
        select(Carrito).where(Carrito.usuario_id == usuario_actual.id, Carrito.estado == "activo")
    ).first()

    if not carrito:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró un carrito activo")

    items_con_productos = session.exec(
        select(CarritoItem, Producto)
        .join(Producto, CarritoItem.producto_id == Producto.id)
        .where(CarritoItem.carrito_id == carrito.id)
    ).all()

    if not items_con_productos:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito está vacío")

    for item, producto in items_con_productos:
        if producto.existencia < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No hay suficiente stock para '{producto.titulo}'. Pedido: {item.cantidad}, Disponible: {producto.existencia}"
            )

    subtotal = 0.0
    iva = 0.0
    for item, producto in items_con_productos:
        item_total = producto.precio * item.cantidad
        subtotal += item_total
        if "electrónica" in producto.categoria.lower():
            iva += item_total * 0.10
        else:
            iva += item_total * 0.21

    envio = 0.0
    if subtotal <= 1000.0 and subtotal > 0:
        envio = 50.0

    total = round(subtotal + iva + envio, 2)

    nueva_compra = Compra(
        usuario_id=usuario_actual.id,
        direccion=compra_data.direccion,
        tarjeta=compra_data.tarjeta,
        total=total,
        envio=envio,
    )
    session.add(nueva_compra)
    session.commit()
    session.refresh(nueva_compra)

    for item, producto in items_con_productos:
        compra_item = CompraItem(
            compra_id=nueva_compra.id,
            producto_id=producto.id,
            cantidad=item.cantidad,
            nombre=producto.titulo,
            precio_unitario=producto.precio
        )

        producto_a_actualizar = session.get(Producto, producto.id)
        producto_a_actualizar.existencia -= item.cantidad
        session.add(producto_a_actualizar)

        session.add(compra_item)

        session.delete(item)

    session.commit()
    session.refresh(nueva_compra)

    return nueva_compra


@app.get("/compras", response_model=List[Compra])
def ver_historial_compras(
    session: Session = Depends(get_session),
    usuario_actual: Usuario = Depends(get_current_user)
):
    compras = session.exec(
        select(Compra)
        .where(Compra.usuario_id == usuario_actual.id)
        .order_by(Compra.fecha.desc()) # Mostrar la más reciente primero
    ).all()
    return compras

@app.get("/compras/{id}", response_model=CompraRead)
def ver_detalle_compra(
    id: int,
    session: Session = Depends(get_session),
    usuario_actual: Usuario = Depends(get_current_user)
):
    compra = session.get(Compra, id)

    if not compra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compra no encontrada")

    if compra.usuario_id != usuario_actual.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver esta compra")

    items_compra = session.exec(
        select(CompraItem).where(CompraItem.compra_id == id)
    ).all()

    lista_items_leidos = []
    for item in items_compra:
        lista_items_leidos.append(CompraItemRead.model_validate(item))

    compra_leida = CompraRead(
        id=compra.id,
        fecha=compra.fecha,
        direccion=compra.direccion,
        tarjeta=compra.tarjeta,
        total=compra.total,
        envio=compra.envio,
        usuario_id=compra.usuario_id,
        productos=lista_items_leidos
    )

    return compra_leida

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)