from __future__ import annotations

from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, or_
from sqlmodel import Session, select

from auth import (
    autenticar_usuario,
    crear_access_token,
    decodificar_token,
    guardar_token_revocado,
    hash_password,
    obtener_usuario_actual,
    oauth2_scheme,
)
from database import create_db_and_tables, get_session
from models import Producto, Usuario
from schemas.auth import Credenciales, TokenResponse
from schemas.carrito import CarritoAgregar, CarritoDetalle, CarritoFinalizarPayload
from schemas.compra import CompraDetalle, CompraFinalizada, CompraResumen
from schemas.producto import ProductoBase
from schemas.usuario import UsuarioCreate, UsuarioRead
from services.carrito import (
    agregar_producto,
    cancelar_carrito,
    finalizar_compra,
    obtener_o_crear_carrito_activo,
    quitar_producto,
    serializar_carrito,
)
from services.compras import listar_compras, obtener_compra_detalle


app = FastAPI(title="API Productos")


@app.on_event("startup")
def _startup() -> None:
    create_db_and_tables()


app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SessionDep = Annotated[Session, Depends(get_session)]
UsuarioActual = Annotated[Usuario, Depends(obtener_usuario_actual)]


@app.get("/")
def root() -> dict[str, str]:
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}


@app.post("/registrar", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def registrar_usuario(payload: UsuarioCreate, session: SessionDep) -> UsuarioRead:
    existe = session.exec(select(Usuario).where(Usuario.email == payload.email)).first()
    if existe is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya está registrado")

    usuario = Usuario(
        nombre=payload.nombre,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return UsuarioRead.model_validate(usuario)


@app.post("/iniciar-sesion", response_model=TokenResponse)
def iniciar_sesion(payload: Credenciales, session: SessionDep) -> TokenResponse:
    usuario = autenticar_usuario(email=payload.email, password=payload.password, session=session)
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    token, expira, _ = crear_access_token(usuario.id)
    return TokenResponse(access_token=token, expira_en=expira)


@app.post("/cerrar-sesion", status_code=status.HTTP_204_NO_CONTENT)
def cerrar_sesion(
    token: Annotated[str, Depends(oauth2_scheme)],
    usuario: UsuarioActual,
    session: SessionDep,
) -> Response:
    datos = decodificar_token(token)
    guardar_token_revocado(token=datos, session=session)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/me", response_model=UsuarioRead)
def obtener_perfil(usuario: UsuarioActual) -> UsuarioRead:
    return UsuarioRead.model_validate(usuario)


@app.get("/productos", response_model=list[ProductoBase])
def obtener_productos(
    session: SessionDep,
    buscar: str | None = Query(default=None, max_length=100),
    categoria: str | None = Query(default=None, max_length=100),
) -> list[ProductoBase]:
    consulta = select(Producto)

    if buscar:
        termino = f"%{buscar.lower()}%"
        consulta = consulta.where(
            or_(
                func.lower(Producto.nombre).like(termino),
                func.lower(Producto.descripcion).like(termino),
            )
        )

    if categoria:
        consulta = consulta.where(func.lower(Producto.categoria) == categoria.lower())

    consulta = consulta.order_by(Producto.nombre.asc())
    productos = session.exec(consulta).all()
    return [ProductoBase.model_validate(prod) for prod in productos]


@app.get("/productos/{producto_id}", response_model=ProductoBase)
def obtener_producto(producto_id: int, session: SessionDep) -> ProductoBase:
    producto = session.get(Producto, producto_id)
    if producto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return ProductoBase.model_validate(producto)


@app.get("/carrito", response_model=CarritoDetalle)
def ver_carrito(usuario: UsuarioActual, session: SessionDep) -> CarritoDetalle:
    carrito = obtener_o_crear_carrito_activo(usuario=usuario, session=session)
    return serializar_carrito(carrito=carrito, session=session)


@app.post("/carrito", response_model=CarritoDetalle)
def agregar_al_carrito(payload: CarritoAgregar, usuario: UsuarioActual, session: SessionDep) -> CarritoDetalle:
    carrito = obtener_o_crear_carrito_activo(usuario=usuario, session=session)
    return agregar_producto(carrito=carrito, payload=payload, session=session)


@app.delete("/carrito/{producto_id}", response_model=CarritoDetalle)
def quitar_del_carrito(producto_id: int, usuario: UsuarioActual, session: SessionDep) -> CarritoDetalle:
    carrito = obtener_o_crear_carrito_activo(usuario=usuario, session=session)
    return quitar_producto(carrito=carrito, producto_id=producto_id, session=session)


@app.post("/carrito/cancelar", response_model=CarritoDetalle)
def cancelar_compra(usuario: UsuarioActual, session: SessionDep) -> CarritoDetalle:
    carrito = obtener_o_crear_carrito_activo(usuario=usuario, session=session)
    return cancelar_carrito(carrito=carrito, session=session)


@app.post("/carrito/finalizar", response_model=CompraFinalizada)
def finalizar_carrito(
    payload: CarritoFinalizarPayload,
    usuario: UsuarioActual,
    session: SessionDep,
) -> CompraFinalizada:
    carrito = obtener_o_crear_carrito_activo(usuario=usuario, session=session)
    nuevo_carrito, compra = finalizar_compra(
        carrito=carrito,
        direccion=payload.direccion,
        tarjeta=payload.tarjeta,
        session=session,
    )
    return CompraFinalizada(compra=compra, carrito=nuevo_carrito)


@app.get("/compras", response_model=list[CompraResumen])
def listar_compras_usuario(usuario: UsuarioActual, session: SessionDep) -> list[CompraResumen]:
    return listar_compras(usuario_id=usuario.id, session=session)


@app.get("/compras/{compra_id}", response_model=CompraDetalle)
def obtener_compra(usuario: UsuarioActual, compra_id: int, session: SessionDep) -> CompraDetalle:
    return obtener_compra_detalle(usuario_id=usuario.id, compra_id=compra_id, session=session)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
