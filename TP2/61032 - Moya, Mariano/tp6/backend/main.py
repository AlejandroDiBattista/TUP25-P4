
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select, SQLModel, create_engine
from models.db_models import Usuario, Carrito, CarritoItem, Producto, Compra, CompraItem
from fastapi import Header
from typing import Optional
from pathlib import Path
import json


# Definir engine para la base de datos SQLite
engine = create_engine("sqlite:///database.db")
SQLModel.metadata.create_all(engine)
app = FastAPI(title="API Productos")

# Seed inicial de productos desde productos.json si la tabla está vacía
def seed_productos():
    from sqlmodel import Session, select
    try:
        with Session(engine) as session:
            existe = session.exec(select(Producto)).first()
            if existe:
                return  # Ya hay productos
            ruta = Path(__file__).parent / "productos.json"
            if not ruta.exists():
                return
            data = json.loads(ruta.read_text(encoding="utf-8"))
            for p in data:
                prod = Producto(
                    id=p.get("id"),
                    nombre=p.get("titulo", ""),
                    descripcion=p.get("descripcion", ""),
                    precio=p.get("precio", 0.0),
                    categoria=p.get("categoria", ""),
                    existencia=p.get("existencia", 0),
                    imagen=p.get("imagen")
                )
                session.add(prod)
            session.commit()
    except Exception:
        pass

seed_productos()

# Utilidad para obtener usuario desde token
def get_usuario_id_from_token(token: Optional[str]) -> Optional[int]:
    if token and token.startswith("fake-token-"):
        try:
            return int(token.replace("fake-token-", ""))
        except:
            return None
    return None

def get_current_user(Authorization: Optional[str] = Header(None)) -> int:
    usuario_id = get_usuario_id_from_token(Authorization.replace("Bearer ", "") if Authorization else None)
    if not usuario_id:
        raise HTTPException(status_code=401, detail="No autenticado")
    return usuario_id

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

# Endpoint: Ver contenido del carrito
@app.get("/carrito")
def ver_carrito(usuario_id: int = Depends(get_current_user)):
    with Session(engine) as session:
        carrito = session.exec(select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")).first()
        if not carrito:
            return {"productos": []}
        items = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)).all()
        productos = []
        for item in items:
            prod = session.get(Producto, item.producto_id)
            if prod:
                productos.append({"id": prod.id, "nombre": prod.nombre, "cantidad": item.cantidad, "precio": prod.precio})
        return {"productos": productos}

# Modelo para agregar producto al carrito
class CarritoAdd(BaseModel):
    producto_id: int
    cantidad: int

# Endpoint: Agregar producto al carrito
@app.post("/carrito")
def agregar_carrito(data: CarritoAdd, usuario_id: int = Depends(get_current_user)):
    with Session(engine) as session:
        producto = session.get(Producto, data.producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        # Validar stock considerando cantidad ya en carrito
        carrito_existente = session.exec(select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")).first()
        ya_en_carrito = 0
        if carrito_existente:
            item_exist = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito_existente.id, CarritoItem.producto_id == data.producto_id)).first()
            ya_en_carrito = item_exist.cantidad if item_exist else 0
        if producto.existencia < data.cantidad + ya_en_carrito:
            raise HTTPException(status_code=400, detail="No hay suficiente existencia")
        carrito = carrito_existente
        if not carrito:
            carrito = Carrito(usuario_id=usuario_id, estado="activo")
            session.add(carrito)
            session.commit()
            session.refresh(carrito)
        item = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == data.producto_id)).first()
        if item:
            item.cantidad += data.cantidad
        else:
            item = CarritoItem(carrito_id=carrito.id, producto_id=data.producto_id, cantidad=data.cantidad)
            session.add(item)
        session.commit()
        return {"mensaje": "Producto agregado al carrito"}

# Endpoint: Quitar producto del carrito
@app.delete("/carrito/{product_id}")
def quitar_carrito(product_id: int, usuario_id: int = Depends(get_current_user)):
    with Session(engine) as session:
        carrito = session.exec(select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")).first()
        if not carrito:
            raise HTTPException(status_code=404, detail="Carrito no encontrado")
        item = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id, CarritoItem.producto_id == product_id)).first()
        if not item:
            raise HTTPException(status_code=404, detail="Producto no está en el carrito")
        session.delete(item)
        session.commit()
        return {"mensaje": "Producto quitado del carrito"}

# Endpoint: Cancelar compra (vaciar carrito)
@app.post("/carrito/cancelar")
def cancelar_carrito(usuario_id: int = Depends(get_current_user)):
    with Session(engine) as session:
        carrito = session.exec(select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")).first()
        if not carrito:
            return {"mensaje": "No hay carrito activo"}
        items = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)).all()
        for item in items:
            session.delete(item)
        session.commit()
        return {"mensaje": "Carrito cancelado y vaciado"}
from datetime import datetime

# Modelo para finalizar compra
class CompraFinalizar(BaseModel):
    direccion: str
    tarjeta: str

# Endpoint: Finalizar compra
@app.post("/carrito/finalizar")
def finalizar_compra(data: CompraFinalizar, usuario_id: int = Depends(get_current_user)):
    with Session(engine) as session:
        carrito = session.exec(select(Carrito).where(Carrito.usuario_id == usuario_id, Carrito.estado == "activo")).first()
        if not carrito:
            raise HTTPException(status_code=404, detail="No hay carrito activo")
        items = session.exec(select(CarritoItem).where(CarritoItem.carrito_id == carrito.id)).all()
        if not items:
            raise HTTPException(status_code=400, detail="El carrito está vacío")
        total = 0.0
        compra_items = []
        iva_total = 0.0
        for item in items:
            producto = session.get(Producto, item.producto_id)
            if not producto:
                continue
            if producto.existencia < item.cantidad:
                raise HTTPException(status_code=400, detail=f"No hay suficiente stock de {producto.nombre}")
            producto.existencia -= item.cantidad
            session.add(producto)
            subtotal = producto.precio * item.cantidad
            total += subtotal
            # IVA 10% si categoria electrónica, 21% resto
            rate = 0.10 if (producto.categoria or "").lower().startswith("elect") else 0.21
            iva_total += subtotal * rate
            compra_items.append({
                "producto_id": producto.id,
                "cantidad": item.cantidad,
                "nombre": producto.nombre,
                "precio_unitario": producto.precio
            })
        iva = round(iva_total, 2)
        # Regla: Envío gratuito para compras superiores a $1000; caso contrario $50 fijo
        envio = 0.0 if total > 1000 else 50.0
        total_final = round(total + iva + envio, 2)
        compra = Compra(
            usuario_id=usuario_id,
            fecha=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            direccion=data.direccion,
            tarjeta=data.tarjeta,
            total=total_final,
            envio=envio
        )
        session.add(compra)
        session.commit()
        session.refresh(compra)
        for ci in compra_items:
            compra_item = CompraItem(
                compra_id=compra.id,
                producto_id=ci["producto_id"],
                cantidad=ci["cantidad"],
                nombre=ci["nombre"],
                precio_unitario=ci["precio_unitario"]
            )
            session.add(compra_item)
        # Vaciar carrito
        for item in items:
            session.delete(item)
        session.commit()
        return {
            "mensaje": "Compra realizada con éxito",
            "compra_id": compra.id,
            "total": total_final,
            "iva": iva,
            "envio": envio
        }

# Endpoint: Ver historial de compras
@app.get("/compras")
def ver_compras(usuario_id: int = Depends(get_current_user)):
    with Session(engine) as session:
        compras = session.exec(select(Compra).where(Compra.usuario_id == usuario_id)).all()
        resultado = []
        for compra in compras:
            resultado.append({
                "id": compra.id,
                "fecha": compra.fecha,
                "total": compra.total,
                "envio": compra.envio,
                "direccion": compra.direccion
            })
        return resultado

# Endpoint: Ver detalle de una compra
@app.get("/compras/{id}")
def ver_detalle_compra(id: int, usuario_id: int = Depends(get_current_user)):
    with Session(engine) as session:
        compra = session.get(Compra, id)
        if not compra or compra.usuario_id != usuario_id:
            raise HTTPException(status_code=404, detail="Compra no encontrada")
        items = session.exec(select(CompraItem).where(CompraItem.compra_id == compra.id)).all()
        detalle_items = []
        for item in items:
            detalle_items.append({
                "producto_id": item.producto_id,
                "nombre": item.nombre,
                "cantidad": item.cantidad,
                "precio_unitario": item.precio_unitario
            })
        return {
            "id": compra.id,
            "fecha": compra.fecha,
            "total": compra.total,
            "envio": compra.envio,
            "direccion": compra.direccion,
            "items": detalle_items
        }
import hashlib

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

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Modelos para entrada JSON
class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    password: str

class UsuarioLogin(BaseModel):
    email: str
    password: str


# Endpoint: Iniciar sesión (JSON)
@app.post("/iniciar-sesion")
def iniciar_sesion(data: UsuarioLogin):
    with Session(engine) as session:
        usuario = session.exec(select(Usuario).where(Usuario.email == data.email)).first()
        if not usuario or hash_password(data.password) != usuario.password:
            raise HTTPException(status_code=401, detail="Credenciales inválidas.")
        # Simular token para pruebas
        token = f"fake-token-{usuario.id}"
        return {"access_token": token, "token_type": "bearer", "usuario_id": usuario.id, "nombre": usuario.nombre, "email": usuario.email}


@app.post("/registrar")
def registrar_usuario(data: UsuarioRegistro):
    with Session(engine) as session:
        existe = session.exec(select(Usuario).where(Usuario.email == data.email)).first()
        if existe:
            raise HTTPException(status_code=400, detail="El email ya está registrado.")
        usuario = Usuario(nombre=data.nombre, email=data.email, password=hash_password(data.password))
        session.add(usuario)
        session.commit()
        session.refresh(usuario)
        return {"mensaje": "Usuario registrado correctamente."}

@app.post("/cerrar-sesion")
def cerrar_sesion(Authorization: Optional[str] = Header(None)):
    # Con tokens fake no persistimos estado; respondemos OK para cumplir el contrato.
    return {"mensaje": "Sesión cerrada"}

@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}


def cargar_productos():
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        return json.load(archivo)

# Endpoint: Listar productos con filtros (desde DB)
@app.get("/productos")
def obtener_productos(categoria: str = None, q: str = None):
    with Session(engine) as session:
        query = select(Producto)
        productos_db = session.exec(query).all()
        def to_dict(p: Producto):
            d = {
                "id": p.id,
                "titulo": p.nombre,
                "precio": p.precio,
                "descripcion": p.descripcion or "",
                "categoria": p.categoria or "",
                "valoracion": 0,
                "existencia": p.existencia or 0,
                "imagen": p.imagen or "",
            }
            d["agotado"] = d["existencia"] <= 0
            return d
        productos = [to_dict(p) for p in productos_db]
        if categoria:
            productos = [p for p in productos if p.get("categoria", "").lower() == categoria.lower()]
        if q:
            ql = q.lower()
            productos = [p for p in productos if ql in p.get("titulo", "").lower() or ql in p.get("descripcion", "").lower()]
        return productos

# Endpoint: Detalle de producto (desde DB)
@app.get("/productos/{id}")
def obtener_producto(id: int):
    with Session(engine) as session:
        p = session.get(Producto, id)
        if not p:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        d = {
            "id": p.id,
            "titulo": p.nombre,
            "precio": p.precio,
            "descripcion": p.descripcion or "",
            "categoria": p.categoria or "",
            "valoracion": 0,
            "existencia": p.existencia or 0,
            "imagen": p.imagen or "",
        }
        d["agotado"] = d["existencia"] <= 0
        return d

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
