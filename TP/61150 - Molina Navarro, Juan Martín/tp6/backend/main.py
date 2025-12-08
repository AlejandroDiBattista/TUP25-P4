from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import delete
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from database import engine, get_session, init_db
from models import (
    Carrito,
    CarritoEstado,
    CarritoItem,
    Compra,
    CompraItem,
    Producto,
    Usuario,
)

RUTA_BASE = Path(__file__).parent
PRODUCTOS_PATH = RUTA_BASE / "productos.json"
USUARIOS_PATH = RUTA_BASE / "usuarios.json"


def cargar_json(path: Path) -> List[Dict]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as archivo:
        return json.load(archivo)


def seed_database() -> None:
    productos_data = cargar_json(PRODUCTOS_PATH)
    usuarios_data = cargar_json(USUARIOS_PATH)

    with Session(engine) as session:
        tiene_productos = session.exec(select(Producto).limit(1)).first() is not None
        if not tiene_productos and productos_data:
            for producto in productos_data:
                session.add(Producto(**producto))

        tiene_usuarios = session.exec(select(Usuario).limit(1)).first() is not None
        if not tiene_usuarios and usuarios_data:
            for usuario_data in usuarios_data:
                usuario = Usuario(
                    id=usuario_data.get("id"),
                    nombre=usuario_data["nombre"],
                    email=usuario_data["email"].lower(),
                    password_hash=usuario_data["password_hash"],
                )
                session.add(usuario)
                session.flush()
                session.add(Carrito(usuario_id=usuario.id, estado=CarritoEstado.ABIERTO))
        else:
            usuarios = session.exec(select(Usuario)).all()
            for usuario in usuarios:
                existe_carrito_abierto = session.exec(
                    select(Carrito)
                    .where(
                        Carrito.usuario_id == usuario.id,
                        Carrito.estado == CarritoEstado.ABIERTO,
                    )
                    .limit(1)
                ).first()
                if not existe_carrito_abierto:
                    session.add(Carrito(usuario_id=usuario.id, estado=CarritoEstado.ABIERTO))

        session.commit()


init_db()
seed_database()

tokens_activos: Dict[str, str] = {}


def hashear_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def obtener_producto(session: Session, producto_id: int) -> Producto:
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto


def normalizar_texto(texto: str | None) -> str | None:
    if texto is None:
        return None
    return texto.strip().lower()


def obtener_carrito_activo(session: Session, usuario: Usuario) -> Carrito:
    carrito = session.exec(
        select(Carrito)
        .where(Carrito.usuario_id == usuario.id, Carrito.estado == CarritoEstado.ABIERTO)
        .options(selectinload(Carrito.items).selectinload(CarritoItem.producto))
    ).first()

    if carrito is None:
        carrito = Carrito(usuario_id=usuario.id, estado=CarritoEstado.ABIERTO)
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    return carrito


def obtener_items_carrito(session: Session, carrito: Carrito) -> List[CarritoItem]:
    return session.exec(
        select(CarritoItem)
        .where(CarritoItem.carrito_id == carrito.id)
        .options(selectinload(CarritoItem.producto))
    ).all()


def calcular_detalle_carrito(session: Session, carrito: Carrito) -> Dict:
    items_detalle = []
    subtotal = 0.0
    iva = 0.0

    for item in obtener_items_carrito(session, carrito):
        producto = item.producto or session.get(Producto, item.producto_id)
        if not producto:
            continue
        item_subtotal = producto.precio * item.cantidad
        tasa_iva = 0.10 if "electr" in producto.categoria.lower() else 0.21
        iva += item_subtotal * tasa_iva
        subtotal += item_subtotal
        items_detalle.append(
            {
                "producto_id": producto.id,
                "titulo": producto.titulo,
                "precio_unitario": producto.precio,
                "cantidad": item.cantidad,
                "subtotal": round(item_subtotal, 2),
                "categoria": producto.categoria,
                "imagen": producto.imagen,
            }
        )

    base_para_envio = subtotal + iva
    envio = 0 if base_para_envio >= 1000 or base_para_envio == 0 else 50
    total = base_para_envio + envio

    return {
        "items": items_detalle,
        "subtotal": round(subtotal, 2),
        "iva": round(iva, 2),
        "envio": round(envio, 2),
        "total": round(total, 2),
    }


def compra_a_dict(compra: Compra) -> Dict:
    items = []
    for item in compra.items:
        producto = item.producto
        subtotal = round(item.precio_unitario * item.cantidad, 2)
        items.append(
            {
                "producto_id": item.producto_id,
                "nombre": item.nombre,
                "cantidad": item.cantidad,
                "precio_unitario": item.precio_unitario,
                "subtotal": subtotal,
                "categoria": producto.categoria if producto else "",
                "imagen": producto.imagen if producto else "",
                "titulo": item.nombre,
            }
        )

    return {
        "id": compra.id,
        "usuario_id": compra.usuario_id,
        "fecha": compra.fecha,
        "direccion": compra.direccion,
        "tarjeta_final": compra.tarjeta_final,
        "subtotal": compra.subtotal,
        "iva": compra.iva,
        "envio": compra.envio,
        "total": compra.total,
        "items": items,
    }


class RegistroRequest(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=64)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CarritoItemRequest(BaseModel):
    producto_id: int
    cantidad: int = Field(..., gt=0)


class CarritoUpdateRequest(BaseModel):
    cantidad: int = Field(..., ge=0)


class CheckoutRequest(BaseModel):
    direccion: str = Field(..., min_length=6, max_length=200)
    tarjeta: str = Field(..., min_length=12, max_length=19)


app = FastAPI(title="API E-Commerce TP6")

app.mount("/imagenes", StaticFiles(directory=RUTA_BASE / "imagenes"), name="imagenes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

seguridad_bearer = HTTPBearer(auto_error=False)


def obtener_sesion(
    credenciales: HTTPAuthorizationCredentials = Depends(seguridad_bearer),
) -> Tuple[str, str]:
    if credenciales is None or credenciales.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token requerido")

    email = tokens_activos.get(credenciales.credentials)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")

    return credenciales.credentials, email


def obtener_usuario_actual(
    session: Session = Depends(get_session),
    sesion: Tuple[str, str] = Depends(obtener_sesion),
) -> Usuario:
    _, email = sesion
    usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return usuario


@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}


@app.get("/productos")
def obtener_productos(
    categoria: str | None = None,
    buscar: str | None = None,
    session: Session = Depends(get_session),
):
    categoria_normalizada = normalizar_texto(categoria)
    termino = normalizar_texto(buscar)

    productos = session.exec(select(Producto)).all()
    resultado = []
    for producto in productos:
        coincide_categoria = True
        coincide_busqueda = True

        if categoria_normalizada:
            coincide_categoria = categoria_normalizada in producto.categoria.lower()

        if termino:
            texto = f"{producto.titulo} {producto.descripcion}".lower()
            coincide_busqueda = termino in texto

        if coincide_categoria and coincide_busqueda:
            resultado.append(producto)

    return resultado


@app.get("/productos/{producto_id}")
def obtener_producto_detalle(producto_id: int, session: Session = Depends(get_session)):
    return obtener_producto(session, producto_id)


@app.post("/registrar", status_code=status.HTTP_201_CREATED)
def registrar_usuario(payload: RegistroRequest, session: Session = Depends(get_session)):
    email = payload.email.lower()
    existe = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if existe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya esta registrado")

    usuario = Usuario(
        nombre=payload.nombre.strip(),
        email=email,
        password_hash=hashear_password(payload.password),
    )
    session.add(usuario)
    session.flush()
    session.add(Carrito(usuario_id=usuario.id, estado=CarritoEstado.ABIERTO))
    session.commit()
    session.refresh(usuario)

    return {
        "mensaje": "Usuario registrado correctamente",
        "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email},
    }


@app.post("/iniciar-sesion")
def iniciar_sesion(payload: LoginRequest, session: Session = Depends(get_session)):
    email = payload.email.lower()
    usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not usuario or usuario.password_hash != hashear_password(payload.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales invalidas")

    token = hashlib.sha256(f"{email}{datetime.now(timezone.utc)}".encode("utf-8")).hexdigest()
    tokens_activos[token] = email

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email},
    }


@app.post("/cerrar-sesion")
def cerrar_sesion(sesion=Depends(obtener_sesion)):
    token, _ = sesion
    tokens_activos.pop(token, None)
    return {"mensaje": "Sesion cerrada correctamente"}


@app.get("/carrito")
def ver_carrito(
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session),
):
    carrito = obtener_carrito_activo(session, usuario)
    detalle = calcular_detalle_carrito(session, carrito)
    return {"usuario": usuario.email, **detalle}


@app.post("/carrito", status_code=status.HTTP_201_CREATED)
def agregar_producto_carrito(
    payload: CarritoItemRequest,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session),
):
    producto = obtener_producto(session, payload.producto_id)
    if payload.cantidad > producto.existencia:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No hay existencia suficiente")

    carrito = obtener_carrito_activo(session, usuario)
    item = session.exec(
        select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == producto.id)
    ).first()

    nueva_cantidad = payload.cantidad
    if item:
        nueva_cantidad = item.cantidad + payload.cantidad

    if nueva_cantidad > producto.existencia:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cantidad solicitada supera el stock disponible")

    if item:
        item.cantidad = nueva_cantidad
    else:
        session.add(CarritoItem(carrito_id=carrito.id, producto_id=producto.id, cantidad=payload.cantidad))

    carrito.actualizado_en = datetime.now(timezone.utc)
    session.commit()

    detalle = calcular_detalle_carrito(session, carrito)
    return {"mensaje": "Producto agregado al carrito", **detalle}


@app.delete("/carrito/{producto_id}")
def quitar_producto_carrito(
    producto_id: int,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session),
):
    carrito = obtener_carrito_activo(session, usuario)
    item = session.exec(
        select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == producto_id)
    ).first()

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El producto no esta en el carrito")

    session.delete(item)
    carrito.actualizado_en = datetime.now(timezone.utc)
    session.commit()

    detalle = calcular_detalle_carrito(session, carrito)
    return {"mensaje": "Producto eliminado del carrito", **detalle}


@app.patch("/carrito/{producto_id}")
def actualizar_producto_carrito(
    producto_id: int,
    payload: CarritoUpdateRequest,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session),
):
    carrito = obtener_carrito_activo(session, usuario)
    item = session.exec(
        select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == producto_id)
    ).first()

    if payload.cantidad == 0:
        if item:
            session.delete(item)
            carrito.actualizado_en = datetime.now(timezone.utc)
            session.commit()
        return {"mensaje": "Producto eliminado del carrito", **calcular_detalle_carrito(session, carrito)}

    producto = obtener_producto(session, producto_id)
    if payload.cantidad > producto.existencia:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cantidad solicitada supera el stock disponible")

    if item:
        item.cantidad = payload.cantidad
    else:
        item = CarritoItem(carrito_id=carrito.id, producto_id=producto.id, cantidad=payload.cantidad)
        session.add(item)

    carrito.actualizado_en = datetime.now(timezone.utc)
    session.commit()

    detalle = calcular_detalle_carrito(session, carrito)
    return {"mensaje": "Cantidad actualizada", **detalle}


@app.post("/carrito/cancelar")
def cancelar_carrito(
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session),
):
    carrito = obtener_carrito_activo(session, usuario)
    session.exec(delete(CarritoItem).where(CarritoItem.carrito_id == carrito.id))
    carrito.actualizado_en = datetime.now(timezone.utc)
    session.commit()
    return {"mensaje": "Carrito cancelado", **calcular_detalle_carrito(session, carrito)}


@app.post("/carrito/finalizar")
def finalizar_compra(
    payload: CheckoutRequest,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session),
):
    carrito = obtener_carrito_activo(session, usuario)
    items = obtener_items_carrito(session, carrito)
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El carrito esta vacio")

    for item in items:
        producto = item.producto or session.get(Producto, item.producto_id)
        if not producto or item.cantidad > producto.existencia:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=f"Sin stock para {producto.titulo if producto else item.producto_id}"
            )

    detalle = calcular_detalle_carrito(session, carrito)
    compra = Compra(
        usuario_id=usuario.id,
        direccion=payload.direccion.strip(),
        tarjeta_final=payload.tarjeta[-4:],
        subtotal=detalle["subtotal"],
        iva=detalle["iva"],
        envio=detalle["envio"],
        total=detalle["total"],
    )
    session.add(compra)
    session.flush()

    for item in items:
        producto = item.producto or session.get(Producto, item.producto_id)
        if not producto:
            continue
        producto.existencia -= item.cantidad
        session.add(
            CompraItem(
                compra_id=compra.id,
                producto_id=producto.id,
                nombre=producto.titulo,
                precio_unitario=producto.precio,
                cantidad=item.cantidad,
            )
        )
        session.delete(item)

    carrito.estado = CarritoEstado.FINALIZADO
    nuevo_carrito = Carrito(usuario_id=usuario.id, estado=CarritoEstado.ABIERTO)
    session.add(nuevo_carrito)

    session.commit()

    return {"mensaje": "Compra realizada con exito", "compra_id": compra.id, "total": detalle["total"]}


@app.get("/compras")
def listar_compras(
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session),
):
    compras = session.exec(
        select(Compra)
        .where(Compra.usuario_id == usuario.id)
        .options(selectinload(Compra.items).selectinload(CompraItem.producto))
        .order_by(Compra.fecha.desc())
    ).all()
    return {"compras": [compra_a_dict(compra) for compra in compras]}


@app.get("/compras/{compra_id}")
def obtener_compra(
    compra_id: int,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session),
):
    compra = session.exec(
        select(Compra)
        .where(Compra.id == compra_id, Compra.usuario_id == usuario.id)
        .options(selectinload(Compra.items).selectinload(CompraItem.producto))
    ).first()
    if not compra:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compra no encontrada")
    return compra_a_dict(compra)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
