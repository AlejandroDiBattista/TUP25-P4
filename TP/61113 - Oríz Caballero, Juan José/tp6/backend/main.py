from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from pathlib import Path
from typing import List
import hashlib
import uuid
import json

from db import engine, get_session
from models.productos import Producto
from models.usuarios import UsuarioCreate, Usuario, UsuarioRead
from models.carrito import Carrito, CarritoItem
from models.compras import Compra, CompraItem

app = FastAPI(title="TP6 - API Ecommerce")

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

# Simple session/token store (en memoria)
import hmac

# simple secret for token signing (in production use a secure env var)
SECRET = b"super-secret-key-change-this"

auth_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def create_token(user_id: int) -> str:
    # token format: <user_id>:<hmac_hex>
    uid = str(user_id)
    sig = hmac.new(SECRET, uid.encode("utf-8"), hashlib.sha256).hexdigest()
    token = f"{uid}:{sig}"
    return token


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)) -> int:
    token = credentials.credentials
    if not token or ":" not in token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    uid_str, sig = token.split(":", 1)
    expected = hmac.new(SECRET, uid_str.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    try:
        return int(uid_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")


@app.on_event("startup")
def on_startup():
    # Crear tablas
    from sqlmodel import SQLModel

    SQLModel.metadata.create_all(engine)

    # Poblar productos si la tabla está vacía
    with Session(engine) as session:
        count = session.exec(select(Producto)).first()
        if not count:
            ruta_productos = Path(__file__).parent / "productos.json"
            if ruta_productos.exists():
                with open(ruta_productos, "r", encoding="utf-8") as f:
                    productos = json.load(f)
                    for p in productos:
                        # nuevo modelo Producto usa 'nombre' en lugar de 'titulo'
                        prod = Producto(
                            nombre=p.get("titulo", ""),
                            descripcion=p.get("descripcion", ""),
                            precio=float(p.get("precio", 0)),
                            categoria=p.get("categoria", ""),
                            existencia=int(p.get("existencia", 0)),
                        )
                        session.add(prod)
                    session.commit()


@app.get("/", response_model=dict)
def root():
    return {"mensaje": "API TP6 - E-commerce"}


# --- Usuarios / Auth ---
@app.post("/registrar", response_model=UsuarioRead)
def registrar(usuario: UsuarioCreate, session: Session = Depends(get_session)):
    # verificar email único
    existing = session.exec(select(Usuario).where(Usuario.email == usuario.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = Usuario(nombre=usuario.nombre, email=usuario.email, hashed_password=hash_password(usuario.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.post("/iniciar-sesion")
def iniciar_sesion(form: dict, session: Session = Depends(get_session)):
    email = form.get("email")
    password = form.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="email y password requeridos")
    user = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not user or user.hashed_password != hash_password(password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = create_token(user.id)
    return {"access_token": token}


@app.get('/me', response_model=UsuarioRead)
def me(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    user = session.get(Usuario, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@app.post("/cerrar-sesion")
def cerrar_sesion(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    return {"ok": True}



def _map_producto(prod: Producto) -> dict:
    """Mapea el objeto Producto del modelo (nuevo esquema) a la forma que espera el front.

    Devuelve claves: id, titulo, descripcion, precio, categoria, existencia, imagen, valoracion
    """

    imagen = f"imagenes/{prod.id:04d}.png" if getattr(prod, "id", None) else ""
    return {
        "id": prod.id,
        "titulo": getattr(prod, "nombre", ""),
        "descripcion": getattr(prod, "descripcion", ""),
        "precio": getattr(prod, "precio", 0.0),
        "categoria": getattr(prod, "categoria", ""),
        "existencia": getattr(prod, "existencia", 0),
        "imagen": imagen,
        "valoracion": 0.0,
    }


@app.get("/productos")
def listar_productos(q: str = None, categoria: str = None, session: Session = Depends(get_session)):
    query = select(Producto)
    if q:
        q_like = f"%{q.lower()}%"
        # buscar en nombre (antes 'titulo') y descripcion
        query = select(Producto).where(
            (Producto.nombre.ilike(q_like)) | (Producto.descripcion.ilike(q_like))
        )
    if categoria:
        query = query.where(Producto.categoria == categoria)
    productos = session.exec(query).all()
    return [_map_producto(p) for p in productos]


@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int, session: Session = Depends(get_session)):
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _map_producto(producto)


@app.get("/v2/productos")
def listar_productos_v2(q: str = None, categoria: str = None, session: Session = Depends(get_session)):
    """Versión v2 del endpoint de productos: devuelve los mismos productos pero añade un campo `api_version`.
    Esto permite diferenciar implementaciones y clientes que consumen la versión personalizada.
    """
    query = select(Producto)
    if q:
        q_like = f"%{q.lower()}%"
        query = select(Producto).where(
            (Producto.nombre.ilike(q_like)) | (Producto.descripcion.ilike(q_like))
        )
    if categoria:
        query = query.where(Producto.categoria == categoria)
    productos = session.exec(query).all()
    mapped = [_map_producto(p) for p in productos]
    # marcar versión
    for p in mapped:
        p["api_version"] = "v2"
    return mapped


@app.get("/v2/productos/{producto_id}")
def obtener_producto_v2(producto_id: int, session: Session = Depends(get_session)):
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    mapped = _map_producto(producto)
    mapped["api_version"] = "v2"
    return mapped


# --- Carrito ---
@app.post("/carrito")
def agregar_al_carrito(body: dict, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    product_id = body.get("product_id")
    cantidad = int(body.get("cantidad", 1))
    if cantidad <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")
    producto = session.get(Producto, product_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    # revisar si ya hay un item en el carrito y validar contra el stock total

    # obtener o crear carrito abierto
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "open")).first()
    if not carrito:
        carrito = Carrito(usuario_id=user_id, estado="open")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)

    # buscar item
    item = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == product_id)).first()
    existing_qty = item.cantidad if item else 0
    new_qty = existing_qty + cantidad
    # validar stock disponible (producto.existencia representa stock disponible en tienda)
    if producto.existencia < cantidad:
        raise HTTPException(status_code=400, detail="No hay suficiente stock")

    # actualizar item y decrementar stock inmediatamente
    if item:
        item.cantidad = new_qty
    else:
        item = CarritoItem(carrito_id=carrito.id, producto_id=product_id, cantidad=cantidad)
        session.add(item)

    # decrementar existencia por la cantidad añadida
    producto.existencia -= cantidad
    session.commit()
    return {"ok": True}


@app.delete("/carrito/{product_id}")
def quitar_del_carrito(product_id: int, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "open")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    item = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == product_id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Producto no en carrito")
    # restaurar stock del producto según la cantidad en el item
    prod = session.get(Producto, item.producto_id)
    if prod:
        prod.existencia += item.cantidad
    session.delete(item)
    session.commit()
    return {"ok": True}


@app.get("/carrito")
def ver_carrito(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "open")).first()
    if not carrito:
        return {"items": []}
    items = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)).all()
    resultado = []
    for it in items:
        prod = session.get(Producto, it.producto_id)
        resultado.append({
            "producto": _map_producto(prod) if prod else None,
            "cantidad": it.cantidad,
        })
    return {"items": resultado}


@app.patch("/carrito/{product_id}")
def ajustar_cantidad_carrito(product_id: int, body: dict, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    # body: { "cantidad": N }
    cantidad = int(body.get("cantidad", 0))
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "open")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    item = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == product_id)).first()
    prod = session.get(Producto, product_id)
    if cantidad <= 0:
        if item:
            # restore stock
            if prod:
                prod.existencia += item.cantidad
            session.delete(item)
            session.commit()
        return {"ok": True}
    if not prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if not item:
        # create item if none (only if stock available)
        if prod.existencia < cantidad:
            raise HTTPException(status_code=400, detail="No hay suficiente stock")
        item = CarritoItem(carrito_id=carrito.id, producto_id=product_id, cantidad=cantidad)
        session.add(item)
        prod.existencia -= cantidad
        session.commit()
        return {"ok": True}

    # ajustar existente
    diff = cantidad - item.cantidad
    if diff > 0:
        if prod.existencia < diff:
            raise HTTPException(status_code=400, detail="No hay suficiente stock")
        prod.existencia -= diff
    elif diff < 0:
        prod.existencia += (-diff)
    item.cantidad = cantidad
    session.commit()
    return {"ok": True}


@app.post("/carrito/finalizar")
def finalizar_compra(body: dict, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    direccion = body.get("direccion")
    tarjeta = body.get("tarjeta")
    if not direccion or not tarjeta:
        raise HTTPException(status_code=400, detail="direccion y tarjeta requeridos")

    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "open")).first()
    if not carrito:
        raise HTTPException(status_code=400, detail="Carrito vacío")
    items = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)).all()
    if not items:
        raise HTTPException(status_code=400, detail="Carrito vacío")

    subtotal = 0.0
    iva = 0.0
    compra_items = []
    for it in items:
        prod = session.get(Producto, it.producto_id)
        # asumimos que la existencia ya fue descontada al agregar al carrito
        line_total = prod.precio * it.cantidad
        subtotal += line_total
        # IVA por categoría
        if prod.categoria and prod.categoria.lower() == "electrónica":
            iva += line_total * 0.10
        else:
            iva += line_total * 0.21
        compra_items.append({
            "producto_id": prod.id,
            "cantidad": it.cantidad,
            "nombre": getattr(prod, "nombre", ""),
            "precio_unitario": prod.precio,
        })

    envio = 0.0 if subtotal > 1000 else 50.0
    total = subtotal + iva + envio

    # crear compra
    compra = Compra(usuario_id=user_id, direccion=direccion, tarjeta=tarjeta, subtotal=subtotal, iva=iva, envio=envio, total=total)
    session.add(compra)
    session.commit()
    session.refresh(compra)

    # crear items de compra (el stock ya fue descontado al agregar al carrito)
    for ci in compra_items:
        item = CompraItem(compra_id=compra.id, producto_id=ci["producto_id"], cantidad=ci["cantidad"], nombre=ci["nombre"], precio_unitario=ci["precio_unitario"])
        session.add(item)
    # finalizar carrito
    carrito.estado = "finalizado"
    session.commit()

    return {"compra_id": compra.id, "total": total}


@app.post("/carrito/cancelar")
def cancelar_compra(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    carrito = session.exec(select(Carrito).where(Carrito.usuario_id == user_id, Carrito.estado == "open")).first()
    if not carrito:
        return {"ok": True}
    items = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)).all()
    for it in items:
        # restaurar stock
        prod = session.get(Producto, it.producto_id)
        if prod:
            prod.existencia += it.cantidad
        session.delete(it)
    session.commit()
    return {"ok": True}


@app.get("/compras")
def resumen_compras(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    compras = session.exec(select(Compra).where(Compra.usuario_id == user_id)).all()
    return compras


@app.get("/compras/{compra_id}")
def detalle_compra(compra_id: int, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    compra = session.get(Compra, compra_id)
    if not compra or compra.usuario_id != user_id:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    items = session.exec(select(CompraItem).where(CompraItem.compra_id == compra.id)).all()
    return {"compra": compra, "items": items}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
