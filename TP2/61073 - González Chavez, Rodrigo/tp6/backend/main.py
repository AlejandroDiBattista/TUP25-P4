from fastapi import FastAPI, HTTPException, Depends, status, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select, delete
from typing import Optional
import jwt
import bcrypt
import asyncio
from datetime import datetime, timedelta
import json
from pathlib import Path
from database import crear_db, get_session, engine
from models import Usuario, Producto, Carrito, ItemCarrito, Compra, ItemCompra

app = FastAPI(title="API Productos")

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

SECRET_KEY = "clave_muy_muy_secreta"
ALGORITHM = "HS256"

def hashed_password(password: str):
    if not password:
        raise ValueError("Contraseña vacía")
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

def verificar_contraseña(password: str, hashed_password: str):
    if not password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        return False

def crear_token(payload: dict):
    datos = payload.copy()
    expiracion = datetime.utcnow() + timedelta(hours=1)
    datos.update({"exp": expiracion})
    return jwt.encode(datos, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    if not token or token.lower() in ["null", "undefined", "bearer", "none"]:
        raise Exception("Token vacío o inválido")
    
    try:
        datos = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return datos
    except jwt.ExpiredSignatureError:
        raise Exception("Tóken expirado")
    except jwt.InvalidTokenError:
        raise Exception("Tóken Inválido")

def usuario_actual(request: Request, session: Session=Depends(get_session)):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Usuario no autenticado")
    
    token = auth.split(" ")[1]
    payload = verificar_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Tóken inválido")

    usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    
    return usuario

# Cargar productos desde el archivo JSON
def cargar_productos():
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        return json.load(archivo)
    
def normalizar_texto(texto: str):
    if not texto:
        return ""
    texto = texto.lower()
    texto = (texto
        .replace("á", "a",)
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
    )
    return texto

def cargar_productos_a_db():
    with Session(engine) as session:
        existentes = session.exec(select(Producto)).first()
        if not existentes:
            productos = cargar_productos()
            for producto in productos:
                nombre = producto.get("titulo") or producto.get("nombre", "")
                nuevo_producto = Producto(
                    nombre=nombre,
                    categoria=normalizar_texto(producto.get("categoria", "")),
                    precio=producto.get("precio", 0.0),
                    existencia=producto.get("existencia", 0),
                    descripcion=normalizar_texto(producto.get("descripcion", ""))
                )
                session.add(nuevo_producto)
            session.commit()
            return {"Mensaje": "Productos cargados en la base de datos"}
        else:
            return {"Mensaje": "Productos ya cargados previamente"}

def actualizar_nombres_vacios():
    with Session(engine) as session:
        productos_sin_nombre = session.exec(select(Producto).where(Producto.nombre == "")).all()
        if not productos_sin_nombre:
            return {"Mensaje": "Todos los productos tienen nombre"}

        productos_json = cargar_productos()
        for producto_db in productos_sin_nombre:
            producto_json = next((p for p in productos_json if p["id"] == producto_db.id), None)
            if producto_json:
                producto_db.nombre = producto_json.get("titulo") or producto_json.get("nombre", "")
        session.commit()
        return {"Mensaje": "Nombres actualizados correctamente"}

def normalizar_productos():
    with Session(engine) as session:
        productos = session.exec(select(Producto)).all()
        cambios = 0
        for producto in productos:
            descripcion_normalizada = normalizar_texto(producto.descripcion)
            categoria_normalizada = normalizar_texto(producto.categoria)
            if producto.descripcion != descripcion_normalizada or producto.categoria != categoria_normalizada:
                producto.descripcion = descripcion_normalizada
                producto.categoria = categoria_normalizada
                cambios += 1
        if cambios > 0:
            session.commit()
            return {"Mensaje": f"{cambios} productos normalizados"}

@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}

@app.on_event("startup")
def on_startup():
    crear_db()
    cargar_productos_a_db()
    normalizar_productos()
    actualizar_nombres_vacios()


@app.post("/registrar")
def registrar(data: dict, session: Session=Depends(get_session)):
    nombre = data.get("nombre")
    email = data.get("email")
    password = data.get("password")

    if not nombre or not email or not password:
        raise HTTPException(status_code=400, detail="Faltan datos")

    if session.exec(select(Usuario).where(Usuario.email == email)).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    hashed = hashed_password(password)
    usuario = Usuario(nombre=nombre, email=email, contraseña=hashed)
    session.add(usuario)
    session.commit()

    return {"mensaje": "Usuario registrado exitosamente"}

@app.post("/iniciar-sesion")
def iniciar_sesion(data: dict, session: Session=Depends(get_session)):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="El email y la contraseña son obligatorios")

    usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales Inválidas")
    
    if not verificar_contraseña(password, usuario.contraseña):
        raise HTTPException(status_code=401, detail="Credenciales Inválidas")
    
    token = crear_token({"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer", "nombre": usuario.nombre}

@app.post("/cerrar-sesion")
def cerrar_sesion():
    return {"mensaje": "Sesión cerrada exitosamente"}


@app.get("/productos")
def listar_productos(
    buscar: Optional[str] = None,
    categoria: Optional[str] = None,
    session: Session = Depends(get_session)):
    query = select(Producto)
    if buscar:
        buscar = normalizar_texto(buscar)
        query = query.where(
            (Producto.descripcion.contains(buscar)) |
            (Producto.nombre.contains(buscar))
        )
    if categoria:
        categoria = normalizar_texto(categoria)
        query = query.where(Producto.categoria.contains(categoria))

    productos = session.exec(query).all()

    productos_imagenes = []
    for producto in productos:
        productos_dict = producto.dict()
        productos_dict["imagen"] = f"{producto.id:04}.png"
        productos_imagenes.append(productos_dict)

    return productos_imagenes

@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int, session: Session=Depends(get_session)):
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto inexistente")
    return producto


def obtener_carrito_abierto(usuario: Usuario, session: Session):
    carrito = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario.id,
            Carrito.estado == "abierto"
        )
    ).first()
    if not carrito:
        carrito = Carrito(usuario_id=usuario.id, estado="abierto")
        session.add(carrito)
        session.commit()
        session.refresh(carrito)
    return carrito

@app.get("/carrito")
def ver_carrito(usuario: Usuario=Depends(usuario_actual), session: Session=Depends(get_session)):
    carrito = obtener_carrito_abierto(usuario, session)
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()

    productos = []
    subtotal = iva = 0
    for item in items:
        prod = session.get(Producto, item.producto_id)
        if not prod:
            continue
        sub = prod.precio * item.cantidad
        subtotal += sub
        iva_rate = 0.10 if "electronica" in prod.categoria.lower() else 0.21
        iva += sub * iva_rate
        productos.append({
            "producto_id": prod.id,
            "nombre": prod.nombre,
            "precio": prod.precio,
            "cantidad": item.cantidad,
            "imagen": prod.imagen if hasattr(prod, 'imagen') else None
        })

    envio = 0 if subtotal > 1000 else 50
    total = subtotal + iva + envio

    return {
        "productos": productos,
        "subtotal": subtotal,
        "iva": iva,
        "envio": envio,
        "total": total
    }

@app.post("/carrito")
def agregar_al_carrito(request: Request, usuario: Usuario=Depends(usuario_actual), session: Session=Depends(get_session)):
    data = asyncio.run(request.json())
    producto_id = data["producto_id"]
    cantidad = int(data.get("cantidad", 1))

    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    carrito = obtener_carrito_abierto(usuario, session)
    item = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == producto_id)).first()
    if item and cantidad < 0:
        nueva_cantidad = item.cantidad + cantidad
        if nueva_cantidad <= 0:
            session.delete(item)
            producto.existencia += item.cantidad
        else:
            diferencia -= cantidad
            producto.existencia += diferencia
            item.cantidad = nueva_cantidad
            session.add(item)
        session.add(producto)
        session.commit()
        return {"Mensaje": "Cantidad actualizada correctamente"}
    if not item and cantidad < 0:
        raise HTTPException(status_code=400, detail="No puedes restar un producto no presente")
    if producto.existencia < cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")
    if not item:
        item = ItemCarrito(
            carrito_id=carrito.id,
            producto_id=producto.id,
            cantidad=cantidad,
            precio_unitario=producto.precio
        )
    else:
        item.cantidad += cantidad

    producto.existencia -= cantidad

    session.add_all([item, producto])
    
    session.commit()

    return {"Mensaje": "Carrito actualizado correctamente"}

@app.delete("/carrito/{producto_id}")
def eliminar_producto(producto_id: int, usuario: Usuario=Depends(usuario_actual), session: Session=Depends(get_session)):
    carrito = obtener_carrito_abierto(usuario, session)    
    item = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == producto_id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="El Producto no está en el carrito")
    
    producto = session.get(Producto, producto_id)
    if producto:
        producto.existencia += item.cantidad
        session.add(producto)
    
    session.delete(item)
    session.commit()

    return {"Mensaje": f"Producto {producto.nombre} eliminado del carrito. Stock devuelto"} 

@app.post("/carrito/cancelar")
def cancelar_carrito(usuario: Usuario=Depends(usuario_actual), session: Session=Depends(get_session)):
    carrito = obtener_carrito_abierto(usuario, session)
    if not carrito:
        HTTPException(status_code=400, detail="No hay carrito abierto")
    
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()    
    for item in items:
        prod = session.get(Producto, item.producto_id)
        if prod:
            prod.existencia += item.cantidad
            session.add(prod)
        session.delete(item)

    carrito.estado = "cancelado"
    session.add(carrito)
    session.commit()
    return {"Mensaje": "Carrito cancelado y stock restablecido"}
    
@app.post("/carrito/finalizar")
def finalizar_carrito(data: dict = Body(...), usuario: Usuario=Depends(usuario_actual), session: Session=Depends(get_session)):
    direccion = data.get("direccion")
    tarjeta = data.get("tarjeta")
    if not direccion or not tarjeta:
        raise HTTPException(status_code=400, detail="Faltan datos de envío o pago")

    carrito = obtener_carrito_abierto(usuario, session)
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
    if not items:
        raise HTTPException(status_code=400, detail="El carrito está vacío")
    
    subtotal = iva = 0
    for item in items:
        prod = session.get(Producto, item.producto_id)
        if not prod:
            continue
        sub = prod.precio * item.cantidad
        subtotal += sub
        iva += sub * (0.10 if "electronica" in prod.categoria.lower() else 0.21)
    
    envio = 0 if subtotal > 1000 else 50
    total = subtotal + iva + envio

    compra = Compra(usuario_id=usuario.id, fecha=datetime.utcnow(), direccion=direccion, tarjeta=tarjeta, total=total, envio=envio)
    session.add(compra)
    session.commit()
    session.refresh(compra)

    for item in items:
        prod = session.get(Producto, item.producto_id)
        if prod:
            session.add(ItemCompra(
                compra_id=compra.id,
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                nombre=prod.nombre,
                precio_unitario=prod.precio
            ))
        session.delete(item)

    session.commit()

    return {"Mensaje": "Compra finalizada exitosamente", "compra_id": compra.id}


@app.get("/compras")
def listar_compras(usuario: Usuario=Depends(usuario_actual), session: Session=Depends(get_session)):
    compras = session.exec(select(Compra).where(Compra.usuario_id == usuario.id)).all()
    return compras

@app.get("/compras/{compra_id}")
def obtener_compra(compra_id: int, usuario: Usuario=Depends(usuario_actual), session: Session=Depends(get_session)):
    compra = session.get(Compra, compra_id)
    if not compra or compra.usuario_id != usuario.id:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    
    items = session.exec(select(ItemCompra).where(ItemCompra.compra_id == compra.id)).all()

    detalle = []
    for item in items:
        producto = session.get(Producto, item.producto_id)
        detalle.append({
            "id": item.id,
            "nombre": item.nombre,
            "cantidad": item.cantidad,
            "precio_unitario": item.precio_unitario,
            "categoria": producto.categoria if producto else None
        })

    return {"compra": compra, "items": detalle}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
