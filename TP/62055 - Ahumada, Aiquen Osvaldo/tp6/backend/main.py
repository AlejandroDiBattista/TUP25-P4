# --- IMPORTS Y APP ---
from typing import Any, Dict, Optional, List  # Cambiar list y dict por List y Dict para compatibilidad con Python 3.8

import json
import pathlib
from uuid import uuid4
from datetime import datetime, timedelta

from fastapi import Body, Depends, FastAPI, Header, HTTPException, Path, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from passlib.hash import argon2
from sqlmodel import Session, select

from database import create_db_and_tables, engine
from models.usuarios import SessionToken, Usuario, UsuarioCreate

BASE_DIR = pathlib.Path(__file__).parent
PRODUCTOS_PATH = BASE_DIR / "productos.json"
IMAGENES_DIR = BASE_DIR / "imagenes"
COMPRAS_PATH = BASE_DIR / "compras.json"

app = FastAPI(title="API E-Commerce (TP6)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permitir el origen del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if IMAGENES_DIR.exists():
    app.mount("/imagenes", StaticFiles(directory=str(IMAGENES_DIR)), name="imagenes")

carritos: Dict[int, Dict[int, int]] = {}


def cargar_compras() -> List[Dict[str, Any]]:
    if not COMPRAS_PATH.exists():
        return []
    with open(COMPRAS_PATH, "r", encoding="utf-8") as archivo:
        return json.load(archivo)


def guardar_compras(compras: List[Dict[str, Any]]) -> None:
    with open(COMPRAS_PATH, "w", encoding="utf-8") as archivo:
        json.dump(compras, archivo, ensure_ascii=False, indent=4)


def get_db_session():
    with Session(engine) as session:
        yield session


def get_user_by_email(session: Session, email: str) -> Optional[Usuario]:
    statement = select(Usuario).where(Usuario.email == email)
    return session.exec(statement).first()


def get_user_by_token(session: Session, token: str) -> Optional[Usuario]:
    if not token:
        return None
    statement = select(SessionToken).where(SessionToken.token == token)
    ses = session.exec(statement).first()
    if not ses:
        return None
    statement_u = select(Usuario).where(Usuario.id == ses.user_id)
    return session.exec(statement_u).first()


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    session: Session = Depends(get_db_session),
) -> Usuario:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Falta header Authorization")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Formato de Authorization inválido")
    token = parts[1]
    statement = select(SessionToken).where(SessionToken.token == token)
    ses = session.exec(statement).first()
    if not ses:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")
    if ses.expires_at < datetime.utcnow():
        session.delete(ses)
        session.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    statement_u = select(Usuario).where(Usuario.id == ses.user_id)
    return session.exec(statement_u).first()


def cargar_productos() -> List[Dict[str, Any]]:  # Cambiar list por List
    with open(PRODUCTOS_PATH, "r", encoding="utf-8") as archivo:
        return json.load(archivo)


def guardar_productos(productos: List[Dict[str, Any]]) -> None:  # Cambiar list por List
    with open(PRODUCTOS_PATH, "w", encoding="utf-8") as archivo:
        json.dump(productos, archivo, ensure_ascii=False, indent=4)


def construir_detalle_carrito(carrito_usuario: Dict[int, int]) -> Dict[str, Any]:
    productos = cargar_productos()
    items = []
    subtotal = 0.0
    iva_total = 0.0

    for pid, cantidad in carrito_usuario.items():
        producto = next((p for p in productos if p.get("id") == pid), None)
        if not producto:
            continue
        precio = producto.get("precio", 0.0)
        categoria = producto.get("categoria", "")
        tasa_iva = 0.10 if "Electrónica" in categoria else 0.21
        subtotal_item = precio * cantidad
        iva_item = subtotal_item * tasa_iva
        items.append({
            "id": pid,
            "titulo": producto.get("titulo"),
            "precio_unitario": precio,
            "cantidad": cantidad,
            "subtotal": round(subtotal_item, 2),
            "iva": round(iva_item, 2),
            "imagen": producto.get("imagen"),
        })
        subtotal += subtotal_item
        iva_total += iva_item

    envio = 0 if subtotal == 0 or subtotal > 1000 else 50
    total = subtotal + iva_total + envio

    return {
        "carrito": items,
        "resumen": {
            "subtotal": round(subtotal, 2),
            "iva": round(iva_total, 2),
            "envio": round(envio, 2),
            "total": round(total, 2),
        },
    }


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()
    if not COMPRAS_PATH.exists():
        guardar_compras([])


@app.get("/")
def root():
    return {"mensaje": "API E-Commerce TP6 - use /productos para obtener el listado"}


@app.get("/productos")
def obtener_productos(buscar: Optional[str] = Query(default=None), categoria: Optional[str] = Query(default=None)):
    productos = cargar_productos()
    if buscar:
        termino = buscar.lower()
        productos = [
            p
            for p in productos
            if termino in p.get("titulo", "").lower() or termino in p.get("descripcion", "").lower()
        ]
    if categoria:
        filtro = categoria.lower()
        productos = [p for p in productos if filtro in p.get("categoria", "").lower()]
    return productos


@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int):
    productos = cargar_productos()
    for producto in productos:
        if producto.get("id") == producto_id:
            return producto
    raise HTTPException(status_code=404, detail="Producto no encontrado")


@app.post("/carrito")
def agregar_al_carrito(data: Dict[str, Any] = Body(...), user: Usuario = Depends(get_current_user)):
    producto_id = data.get("producto_id")
    cantidad = int(data.get("cantidad", 1))
    if not producto_id:
        raise HTTPException(status_code=400, detail="Falta producto_id")
    if cantidad < 1:
        raise HTTPException(status_code=400, detail="La cantidad debe ser al menos 1")

    productos = cargar_productos()
    producto = next((p for p in productos if p.get("id") == producto_id), None)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if producto.get("existencia", 0) < cantidad:
        raise HTTPException(status_code=400, detail="No hay stock disponible para este producto")

    producto["existencia"] = producto.get("existencia", 0) - cantidad
    guardar_productos(productos)

    carrito_usuario = carritos.setdefault(user.id, {})
    carrito_usuario[producto_id] = carrito_usuario.get(producto_id, 0) + cantidad
    carritos[user.id] = carrito_usuario

    detalle = construir_detalle_carrito(carrito_usuario)
    return {"mensaje": "Producto agregado al carrito", **detalle}


@app.get("/carrito")
def ver_carrito(user: Usuario = Depends(get_current_user)):
    carrito_usuario = carritos.get(user.id, {})
    return construir_detalle_carrito(carrito_usuario)


@app.delete("/carrito/{producto_id}")
def quitar_del_carrito(producto_id: int = Path(..., description="ID del producto"), user: Usuario = Depends(get_current_user)):
    carrito_usuario = carritos.get(user.id, {})
    cantidad_actual = carrito_usuario.get(producto_id)
    if not cantidad_actual:
        raise HTTPException(status_code=404, detail="Producto no está en el carrito")

    productos = cargar_productos()
    producto = next((p for p in productos if p.get("id") == producto_id), None)
    if producto:
        producto["existencia"] = producto.get("existencia", 0) + 1
        guardar_productos(productos)

    if cantidad_actual <= 1:
        carrito_usuario.pop(producto_id, None)
    else:
        carrito_usuario[producto_id] = cantidad_actual - 1
    carritos[user.id] = carrito_usuario

    detalle = construir_detalle_carrito(carrito_usuario)
    return {"mensaje": "Producto quitado del carrito", **detalle}


@app.post("/carrito/finalizar")
def finalizar_compra(user: Usuario = Depends(get_current_user)):
    carrito_usuario = carritos.get(user.id, {})
    if not carrito_usuario:
        raise HTTPException(status_code=400, detail="El carrito está vacío")
    detalle = construir_detalle_carrito(carrito_usuario)

    compras = cargar_compras()
    compras.append({
        "id": str(uuid4()),
        "user_id": user.id,
        "fecha": datetime.utcnow().isoformat(),
        "items": detalle.get("carrito", []),
        "resumen": detalle.get("resumen", {}),
    })
    guardar_compras(compras)

    carritos[user.id] = {}
    return {"mensaje": "Compra finalizada", **detalle}


@app.post("/carrito/cancelar")
def cancelar_compra(user: Usuario = Depends(get_current_user)):
    carrito_usuario = carritos.get(user.id, {})
    if carrito_usuario:
        productos = cargar_productos()
        for pid, cantidad in carrito_usuario.items():
            producto = next((p for p in productos if p.get("id") == pid), None)
            if producto:
                producto["existencia"] = producto.get("existencia", 0) + cantidad
        guardar_productos(productos)
    carritos[user.id] = {}
    detalle = construir_detalle_carrito({})
    return {"mensaje": "Carrito cancelado", **detalle}


@app.post("/registrar", status_code=201)
def registrar(usuario_in: UsuarioCreate = Body(...), session: Session = Depends(get_db_session)):
    existing = get_user_by_email(session, usuario_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    hashed = argon2.hash(usuario_in.password)
    nuevo = Usuario(nombre=usuario_in.nombre, email=usuario_in.email, hashed_password=hashed)
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return {"id": nuevo.id, "nombre": nuevo.nombre, "email": nuevo.email}


@app.post("/iniciar-sesion")
def iniciar_sesion(payload: Dict[str, Any] = Body(...), session: Session = Depends(get_db_session)):
    email = payload.get("email")
    password = payload.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="email y password requeridos")
    user = get_user_by_email(session, email)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if not argon2.verify(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = str(uuid4())
    expires_at = datetime.utcnow() + timedelta(hours=1)  # Token válido por 1 hora
    ses = SessionToken(token=token, user_id=user.id, expires_at=expires_at)
    session.add(ses)
    session.commit()
    session.refresh(ses)
    return {"access_token": token, "user": {"id": user.id, "nombre": user.nombre, "email": user.email}}


@app.post("/cerrar-sesion")
def cerrar_sesion(authorization: Optional[str] = Header(default=None), session: Session = Depends(get_db_session)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Falta Authorization header")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Formato de Authorization inválido")
    token = parts[1]
    statement = select(SessionToken).where(SessionToken.token == token)
    ses = session.exec(statement).first()
    if not ses:
        return JSONResponse(status_code=200, content={"mensaje": "Sesión ya invalidada o token no encontrado"})
    session.delete(ses)
    session.commit()
    return {"mensaje": "Sesión cerrada correctamente"}


@app.get("/compras")
def ver_compras(user: Usuario = Depends(get_current_user)):
    compras = cargar_compras()
    propias = [compra for compra in compras if compra.get("user_id") == user.id]
    propias.sort(key=lambda c: c.get("fecha", ""), reverse=True)
    return {"compras": propias}
