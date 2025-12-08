from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
from pathlib import Path
from sqlmodel import SQLModel, Session, create_engine, select
from models.productos import Producto, Usuario, Carrito, ItemCarrito, Compra, ItemCompra
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

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

DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(DATABASE_URL, echo=False)

def crear_tablas():
    SQLModel.metadata.create_all(engine)

@app.on_event("startup")
def startup_event():
    crear_tablas()
    cargar_productos_iniciales()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def cargar_productos_iniciales():
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        productos = json.load(archivo)
        with Session(engine) as session:
            for producto in productos:
                if not session.exec(select(Producto).where(Producto.id == producto["id"])).first():
                    # Copiar titulo a nombre para mantener compatibilidad
                    producto["nombre"] = producto.get("titulo", "")
                    session.add(Producto(**producto))
            session.commit()

SECRET_KEY = "your_secret_key_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def crear_token_acceso(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="iniciar-sesion", auto_error=False)

def obtener_usuario_actual(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    email = verificar_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    with Session(engine) as session:
        usuario = session.exec(select(Usuario).where(Usuario.email == email)).first()
        if not usuario:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return usuario

# Modelos Pydantic para requests
class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    contraseña: str

class LoginRequest(BaseModel):
    email: str
    contraseña: str

class AgregarCarritoRequest(BaseModel):
    producto_id: int
    cantidad: int

class FinalizarCompraRequest(BaseModel):
    direccion: str
    tarjeta: str

@app.post("/registrar")
def registrar_usuario(usuario: UsuarioRegistro):
    with Session(engine) as session:
        if session.exec(select(Usuario).where(Usuario.email == usuario.email)).first():
            raise HTTPException(status_code=400, detail="El usuario ya existe")
        nuevo_usuario = Usuario(
            nombre=usuario.nombre,
            email=usuario.email,
            contraseña_hashed=pwd_context.hash(usuario.contraseña)
        )
        session.add(nuevo_usuario)
        session.commit()
        return {"mensaje": "Usuario registrado exitosamente"}

@app.post("/iniciar-sesion")
def iniciar_sesion(login: LoginRequest):
    with Session(engine) as session:
        usuario = session.exec(select(Usuario).where(Usuario.email == login.email)).first()
        if not usuario or not pwd_context.verify(login.contraseña, usuario.contraseña_hashed):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        token = crear_token_acceso({"sub": usuario.email})
        return {"access_token": token, "token_type": "bearer", "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email}}

@app.post("/cerrar-sesion")
def cerrar_sesion():
    return {"mensaje": "Sesión cerrada exitosamente"}

@app.get("/productos")
def obtener_productos(
    categoria: Optional[str] = None,
    buscar: Optional[str] = None
):
    """Endpoint público para obtener productos - no requiere autenticación"""
    with Session(engine) as session:
        query = select(Producto)
        if categoria:
            query = query.where(Producto.categoria.ilike(f"%{categoria}%"))
        if buscar:
            query = query.where(
                (Producto.titulo.ilike(f"%{buscar}%")) | 
                (Producto.nombre.ilike(f"%{buscar}%")) | 
                (Producto.descripcion.ilike(f"%{buscar}%"))
            )
        productos = session.exec(query.limit(50)).all()
        if not productos:
            raise HTTPException(status_code=404, detail="No se encontraron productos")
        return productos

@app.get("/productos/{id}")
def obtener_producto(id: int):
    """Obtener detalles de un producto específico"""
    with Session(engine) as session:
        producto = session.exec(select(Producto).where(Producto.id == id)).first()
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        return producto

@app.post("/carrito")
def agregar_al_carrito(
    request: AgregarCarritoRequest,
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    if request.cantidad <= 0:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a 0")

    with Session(engine) as session:
        producto = session.exec(select(Producto).where(Producto.id == request.producto_id)).first()
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        if producto.existencia < request.cantidad:
            raise HTTPException(status_code=400, detail="Stock insuficiente para este producto")

        carrito = session.exec(
            select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "activo")
        ).first()
        if not carrito:
            carrito = Carrito(usuario_id=usuario.id, estado="activo")
            session.add(carrito)
            session.commit()
            session.refresh(carrito)

        item = session.exec(
            select(ItemCarrito).where(
                ItemCarrito.carrito_id == carrito.id, 
                ItemCarrito.producto_id == request.producto_id
            )
        ).first()
        
        if item:
            item.cantidad += request.cantidad
        else:
            item = ItemCarrito(carrito_id=carrito.id, producto_id=request.producto_id, cantidad=request.cantidad)
            session.add(item)

        producto.existencia -= request.cantidad
        session.commit()
        return {"mensaje": "Producto agregado al carrito"}

@app.get("/carrito")
def obtener_carrito(usuario: Usuario = Depends(obtener_usuario_actual)):
    """Ver contenido del carrito del usuario"""
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "activo")
        ).first()
        
        if not carrito:
            return {"items": [], "total": 0, "subtotal": 0, "iva": 0, "envio": 0}
        
        items_carrito = session.exec(
            select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
        ).all()
        
        items_respuesta = []
        subtotal = 0
        
        for item in items_carrito:
            producto = session.exec(select(Producto).where(Producto.id == item.producto_id)).first()
            if producto:
                subtotal_item = producto.precio * item.cantidad
                subtotal += subtotal_item
                items_respuesta.append({
                    "id": item.id,
                    "producto_id": producto.id,
                    "titulo": producto.titulo,
                    "nombre": producto.nombre,
                    "precio": producto.precio,
                    "cantidad": item.cantidad,
                    "imagen": producto.imagen,
                    "categoria": producto.categoria,
                    "subtotal": subtotal_item
                })
        
        # Calcular IVA: 21% general, 10% para electrónica
        iva = 0
        for item in items_respuesta:
            if "electr" in item["categoria"].lower():
                iva += item["subtotal"] * 0.10
            else:
                iva += item["subtotal"] * 0.21
        
        # Calcular envío
        envio = 0 if subtotal > 1000 else 50
        
        total = subtotal + iva + envio
        
        return {
            "items": items_respuesta,
            "subtotal": round(subtotal, 2),
            "iva": round(iva, 2),
            "envio": envio,
            "total": round(total, 2)
        }

@app.delete("/carrito/{producto_id}")
def quitar_del_carrito(producto_id: int, usuario: Usuario = Depends(obtener_usuario_actual)):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "activo")
        ).first()
        if not carrito:
            raise HTTPException(status_code=400, detail="No hay un carrito activo")

        item = session.exec(
            select(ItemCarrito).where(
                ItemCarrito.carrito_id == carrito.id, 
                ItemCarrito.producto_id == producto_id
            )
        ).first()
        if not item:
            raise HTTPException(status_code=404, detail="Producto no encontrado en el carrito")

        producto = session.exec(select(Producto).where(Producto.id == producto_id)).first()
        if producto:
            producto.existencia += item.cantidad

        session.delete(item)
        session.commit()
        return {"mensaje": "Producto eliminado del carrito"}

@app.post("/carrito/finalizar")
def finalizar_compra(
    request: FinalizarCompraRequest,
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    if not request.direccion or not request.tarjeta:
        raise HTTPException(status_code=400, detail="La dirección y la tarjeta son obligatorias")

    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "activo")
        ).first()
        
        if not carrito:
            raise HTTPException(status_code=400, detail="El carrito está vacío o no existe")

        items_carrito = session.exec(
            select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)
        ).all()
        
        if not items_carrito:
            raise HTTPException(status_code=400, detail="El carrito está vacío")

        # Calcular totales
        subtotal = 0
        iva = 0
        items_compra = []
        
        for item in items_carrito:
            producto = session.exec(select(Producto).where(Producto.id == item.producto_id)).first()
            if producto:
                subtotal_item = producto.precio * item.cantidad
                subtotal += subtotal_item
                
                # Calcular IVA según categoría
                if "electr" in producto.categoria.lower():
                    iva += subtotal_item * 0.10
                else:
                    iva += subtotal_item * 0.21
                
                items_compra.append(
                    ItemCompra(
                        producto_id=item.producto_id,
                        nombre=producto.titulo or producto.nombre,
                        precio_unitario=producto.precio,
                        cantidad=item.cantidad,
                    )
                )

        envio = 0 if subtotal > 1000 else 50
        total = subtotal + iva + envio

        compra = Compra(
            usuario_id=usuario.id,
            fecha=datetime.now().isoformat(),
            direccion=request.direccion,
            tarjeta=request.tarjeta,
            total=round(total, 2),
            envio=envio,
        )
        session.add(compra)
        session.commit()
        session.refresh(compra)
        
        # Agregar items a la compra
        for item_compra in items_compra:
            item_compra.compra_id = compra.id
            session.add(item_compra)
        
        carrito.estado = "finalizado"
        session.commit()
        
        return {"mensaje": "Compra finalizada exitosamente", "compra_id": compra.id, "total": round(total, 2)}

@app.post("/carrito/cancelar")
def cancelar_compra(usuario: Usuario = Depends(obtener_usuario_actual)):
    with Session(engine) as session:
        carrito = session.exec(
            select(Carrito).where(Carrito.usuario_id == usuario.id, Carrito.estado == "activo")
        ).first()
        if not carrito:
            raise HTTPException(status_code=400, detail="No hay un carrito activo para cancelar")

        items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id)).all()
        
        for item in items:
            producto = session.exec(select(Producto).where(Producto.id == item.producto_id)).first()
            if producto:
                producto.existencia += item.cantidad

        carrito.estado = "cancelado"
        session.commit()
        return {"mensaje": "Compra cancelada y carrito vaciado"}

@app.get("/compras")
def obtener_compras(usuario: Usuario = Depends(obtener_usuario_actual)):
    with Session(engine) as session:
        compras = session.exec(
            select(Compra).where(Compra.usuario_id == usuario.id)
        ).all()
        return compras

@app.get("/compras/{compra_id}")
def obtener_detalle_compra(compra_id: int, usuario: Usuario = Depends(obtener_usuario_actual)):
    with Session(engine) as session:
        compra = session.exec(
            select(Compra).where(Compra.id == compra_id, Compra.usuario_id == usuario.id)
        ).first()
        if not compra:
            raise HTTPException(status_code=404, detail="Compra no encontrada")
        
        items = session.exec(
            select(ItemCompra).where(ItemCompra.compra_id == compra.id)
        ).all()
        
        return {
            "id": compra.id,
            "fecha": compra.fecha,
            "direccion": compra.direccion,
            "tarjeta": compra.tarjeta,
            "total": compra.total,
            "envio": compra.envio,
            "items": items
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
