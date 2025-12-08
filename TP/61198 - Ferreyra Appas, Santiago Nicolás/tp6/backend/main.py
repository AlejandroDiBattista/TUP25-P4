from datetime import datetime
from typing import List, Tuple

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from . import schemas
from .auth import (
    generar_token,
    get_cliente_actual,
    hash_password,
    invalidar_token,
    verificar_password,
)
from .database import crear_bd_y_tablas, get_session, engine
from .models import Articulo, CarritoCompra, Cliente, LineaCarrito, LineaOrden, Orden
from .seed_data import cargar_productos_iniciales

app = FastAPI(title="TP6 - Campus Market")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============
# AUTENTICACIÓN
# ============

@app.post("/registrar", response_model=schemas.ClientePublico)
def registrar_usuario(
    datos: schemas.RegistroCliente, session: Session = Depends(get_session)
):
    existe = session.exec(
        select(Cliente).where(Cliente.correo == datos.correo)
    ).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado",
        )

    nuevo = Cliente(
        nombre=datos.nombre,
        correo=datos.correo,
        hash_password=hash_password(datos.password),
    )
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return schemas.ClientePublico(id=nuevo.id, nombre=nuevo.nombre, correo=nuevo.correo)


@app.post("/iniciar-sesion", response_model=schemas.TokenRespuesta)
def iniciar_sesion(
    datos: schemas.LoginCliente, session: Session = Depends(get_session)
):
    usuario = session.exec(
        select(Cliente).where(Cliente.correo == datos.correo)
    ).first()
    if not usuario or not verificar_password(datos.password, usuario.hash_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    token = generar_token(usuario.id)
    return schemas.TokenRespuesta(
        access_token=token,
        usuario_nombre=usuario.nombre,
    )


@app.post("/cerrar-sesion")
def cerrar_sesion():
    # implementación simple, el cliente sólo descarta el token
    return {"ok": True}


@app.on_event("startup")
def on_startup():
    crear_bd_y_tablas()
    with Session(engine) as session:
        cargar_productos_iniciales(session)


# =============
# PRODUCTOS
# =============

@app.get("/productos", response_model=list[schemas.ArticuloPublico])
def listar_productos(
    categoria: str | None = None,
    q: str | None = None,
    session: Session = Depends(get_session),
):
    query = select(Articulo)
    if categoria:
        query = query.where(Articulo.categoria == categoria)
    if q:
        like = f"%{q.lower()}%"
        query = query.where(Articulo.titulo.ilike(like))  # type: ignore[attr-defined]

    articulos = session.exec(query).all()
    return [
        schemas.ArticuloPublico(
            id=a.id,
            titulo=a.titulo,
            descripcion=a.descripcion,
            precio=a.precio,
            categoria=a.categoria,
            existencias=a.existencias,
            imagen=a.imagen,
            agotado=a.existencias <= 0,
            es_electronico=a.es_electronico,
        )
        for a in articulos
    ]


@app.get("/productos/{articulo_id}", response_model=schemas.ArticuloPublico)
def obtener_producto(articulo_id: int, session: Session = Depends(get_session)):
    articulo = session.get(Articulo, articulo_id)
    if not articulo:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    return schemas.ArticuloPublico(
        id=articulo.id,
        titulo=articulo.titulo,
        descripcion=articulo.descripcion,
        precio=articulo.precio,
        categoria=articulo.categoria,
        existencias=articulo.existencias,
        imagen=articulo.imagen,
        agotado=articulo.existencias <= 0,
        es_electronico=articulo.es_electronico,
    )


# ====================
# Helpers del carrito
# ====================

def _obtener_carrito_abierto(
    session: Session, cliente: Cliente
) -> CarritoCompra:
    query = select(CarritoCompra).where(
        CarritoCompra.cliente_id == cliente.id,
        CarritoCompra.estado == "abierto",
    )
    carrito = session.exec(query).first()
    if not carrito:
        carrito = CarritoCompra(cliente_id=cliente.id)
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    return carrito


def _calcular_totales(
    lineas: List[LineaCarrito],
) -> Tuple[float, float, float, float]:
    subtotal = 0.0
    iva = 0.0

    for linea in lineas:
        item_subtotal = linea.precio_unitario * linea.cantidad
        subtotal += item_subtotal

        if linea.articulo and linea.articulo.es_electronico:
            tasa = 0.10
        else:
            tasa = 0.21
        iva += item_subtotal * tasa

    if subtotal > 1000:
        envio = 0.0
    else:
        envio = 50.0

    total = subtotal + iva + envio
    return subtotal, iva, envio, total


def _carrito_a_schema(carrito: CarritoCompra) -> schemas.CarritoPublico:
    lineas_publicas: List[schemas.LineaCarritoPublica] = []
    for linea in carrito.lineas:
        if linea.articulo is None:
            continue
        lineas_publicas.append(
            schemas.LineaCarritoPublica(
                articulo_id=linea.articulo_id,
                nombre=linea.articulo.titulo,
                imagen=linea.articulo.imagen,
                cantidad=linea.cantidad,
                precio_unitario=linea.precio_unitario,
                subtotal=linea.precio_unitario * linea.cantidad,
            )
        )

    subtotal, iva, envio, total = _calcular_totales(carrito.lineas)

    return schemas.CarritoPublico(
        id=carrito.id,
        items=lineas_publicas,
        total_productos=sum(l.cantidad for l in carrito.lineas),
        subtotal=subtotal,
        iva=iva,
        envio=envio,
        total=total,
    )


# =============
# CARRITO
# =============

@app.get("/carrito", response_model=schemas.CarritoPublico)
def ver_carrito(
    cliente: Cliente = Depends(get_cliente_actual),
    session: Session = Depends(get_session),
):
    carrito = _obtener_carrito_abierto(session, cliente)
    session.refresh(carrito)
    return _carrito_a_schema(carrito)


@app.post("/carrito", response_model=schemas.CarritoPublico)
def agregar_al_carrito(
    datos: schemas.AgregarAlCarrito,
    cliente: Cliente = Depends(get_cliente_actual),
    session: Session = Depends(get_session),
):
    articulo = session.get(Articulo, datos.articulo_id)
    if not articulo:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if articulo.existencias <= 0:
        raise HTTPException(status_code=400, detail="Producto agotado")

    carrito = _obtener_carrito_abierto(session, cliente)

    # ¿ya existe la línea?
    query = select(LineaCarrito).where(
        LineaCarrito.carrito_id == carrito.id,
        LineaCarrito.articulo_id == articulo.id,
    )
    linea = session.exec(query).first()

    cantidad_nueva = datos.cantidad
    if linea:
        cantidad_nueva = linea.cantidad + datos.cantidad

    if cantidad_nueva > articulo.existencias:
        raise HTTPException(
            status_code=400,
            detail="No hay stock suficiente para esa cantidad",
        )

    if linea:
        linea.cantidad = cantidad_nueva
        linea.precio_unitario = articulo.precio
    else:
        linea = LineaCarrito(
            carrito_id=carrito.id,
            articulo_id=articulo.id,
            cantidad=datos.cantidad,
            precio_unitario=articulo.precio,
        )
        session.add(linea)

    carrito.actualizado = datetime.utcnow()
    session.add(carrito)
    session.commit()
    session.refresh(carrito)
    return _carrito_a_schema(carrito)


@app.delete("/carrito/{articulo_id}", response_model=schemas.CarritoPublico)
def quitar_del_carrito(
    articulo_id: int,
    cliente: Cliente = Depends(get_cliente_actual),
    session: Session = Depends(get_session),
):
    carrito = _obtener_carrito_abierto(session, cliente)

    query = select(LineaCarrito).where(
        LineaCarrito.carrito_id == carrito.id,
        LineaCarrito.articulo_id == articulo_id,
    )
    linea = session.exec(query).first()
    if not linea:
        raise HTTPException(status_code=404, detail="El producto no está en el carrito")

    session.delete(linea)
    carrito.actualizado = datetime.utcnow()
    session.add(carrito)
    session.commit()
    session.refresh(carrito)
    return _carrito_a_schema(carrito)


@app.post("/carrito/cancelar", response_model=schemas.CarritoPublico)
def cancelar_compra(
    cliente: Cliente = Depends(get_cliente_actual),
    session: Session = Depends(get_session),
):
    carrito = _obtener_carrito_abierto(session, cliente)

    for linea in list(carrito.lineas):
        session.delete(linea)

    carrito.actualizado = datetime.utcnow()
    session.add(carrito)
    session.commit()
    session.refresh(carrito)
    return _carrito_a_schema(carrito)


# =============
# FINALIZAR COMPRA
# =============

@app.post("/carrito/finalizar", response_model=schemas.CompraDetalle)
def finalizar_compra(
    datos: schemas.DatosEnvioPago,
    cliente: Cliente = Depends(get_cliente_actual),
    session: Session = Depends(get_session),
):
    carrito = _obtener_carrito_abierto(session, cliente)
    if not carrito.lineas:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    # verificar stock
    for linea in carrito.lineas:
        if linea.articulo is None:
            raise HTTPException(status_code=400, detail="Producto inexistente")
        if linea.cantidad > linea.articulo.existencias:
            raise HTTPException(
                status_code=400,
                detail=f"No hay stock suficiente para {linea.articulo.titulo}",
            )

    subtotal, iva, envio, total = _calcular_totales(carrito.lineas)

    # descontar stock y crear orden
    orden = Orden(
        cliente_id=cliente.id,
        direccion_envio=datos.direccion,
        tarjeta=datos.tarjeta,
        subtotal=subtotal,
        iva=iva,
        costo_envio=envio,
        total=total,
    )
    session.add(orden)
    session.commit()
    session.refresh(orden)

    productos_publicos: list[schemas.LineaCarritoPublica] = []

    for linea in carrito.lineas:
        articulo = linea.articulo
        articulo.existencias -= linea.cantidad
        session.add(articulo)

        renglon = LineaOrden(
            orden_id=orden.id,
            articulo_id=articulo.id,
            nombre_producto=articulo.titulo,
            cantidad=linea.cantidad,
            precio_unitario=linea.precio_unitario,
        )
        session.add(renglon)

        productos_publicos.append(
            schemas.LineaCarritoPublica(
                articulo_id=articulo.id,
                nombre=articulo.titulo,
                imagen=articulo.imagen,
                cantidad=linea.cantidad,
                precio_unitario=articulo.precio_unitario,
                subtotal=linea.cantidad * linea.precio_unitario,
            )
        )

    # cerrar carrito actual
    for linea in list(carrito.lineas):
        session.delete(linea)
    carrito.estado = "cerrado"
    carrito.actualizado = datetime.utcnow()
    session.add(carrito)

    # crear nuevo carrito vacío para próximas compras
    nuevo_carrito = CarritoCompra(cliente_id=cliente.id)
    session.add(nuevo_carrito)

    session.commit()
    session.refresh(orden)

    return schemas.CompraDetalle(
        id=orden.id,
        fecha=orden.fecha,
        direccion_envio=orden.direccion_envio,
        tarjeta=orden.tarjeta,
        subtotal=orden.subtotal,
        iva=orden.iva,
        costo_envio=orden.costo_envio,
        total=orden.total,
        productos=productos_publicos,
    )


# =============
# COMPRAS
# =============

@app.get("/compras", response_model=list[schemas.CompraResumen])
def listar_compras(
    cliente: Cliente = Depends(get_cliente_actual),
    session: Session = Depends(get_session),
):
    query = select(Orden).where(Orden.cliente_id == cliente.id).order_by(Orden.fecha.desc())
    compras = session.exec(query).all()
    return [
        schemas.CompraResumen(id=c.id, fecha=c.fecha, total=c.total) for c in compras
    ]


@app.get("/compras/{compra_id}", response_model=schemas.CompraDetalle)
def detalle_compra(
    compra_id: int,
    cliente: Cliente = Depends(get_cliente_actual),
    session: Session = Depends(get_session),
):
    orden = session.get(Orden, compra_id)
    if not orden or orden.cliente_id != cliente.id:
        raise HTTPException(status_code=404, detail="Compra no encontrada")

    lineas = session.exec(
        select(LineaOrden).where(LineaOrden.orden_id == orden.id)
    ).all()

    productos: list[schemas.LineaCarritoPublica] = []
    for l in lineas:
        productos.append(
            schemas.LineaCarritoPublica(
                articulo_id=l.articulo_id,
                nombre=l.nombre_producto,
                imagen="",
                cantidad=l.cantidad,
                precio_unitario=l.precio_unitario,
                subtotal=l.cantidad * l.precio_unitario,
            )
        )

    return schemas.CompraDetalle(
        id=orden.id,
        fecha=orden.fecha,
        direccion_envio=orden.direccion_envio,
        tarjeta=orden.tarjeta,
        subtotal=orden.subtotal,
        iva=orden.iva,
        costo_envio=orden.costo_envio,
        total=orden.total,
        productos=productos,
    )
