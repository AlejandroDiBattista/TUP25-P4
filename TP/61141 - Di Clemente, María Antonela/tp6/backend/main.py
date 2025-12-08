from fastapi import FastAPI, Depends
from sqlmodel import Session, select
from models.productos import Producto
from models.usuarios import Usuario
from schemas import UsuarioCreate
from models.carrito import CarritoItem
from models.compras import Compra
from database import create_db_and_tables, get_session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
from pathlib import Path
from auth import registrar_usuario, iniciar_sesion, get_current_user
from fastapi import Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from auth import create_access_token, verify_password
from datetime import datetime
from typing import List


app = FastAPI(title="API Productos")

# Montar directorio de imágenes como archivos estáticos
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Crear las tablas al iniciar
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    inicializar_datos()

# Carga los productos del archivo JSON si la base de datos está vacía
def inicializar_datos():
    from sqlmodel import select
    from database import engine

# Si no hay productos, se cargan desde productos.json
    with Session(engine) as session:
         if not session.exec(select(Producto)).first():
            ruta = Path(__file__).parent / "productos.json"
            if ruta.exists():
                with open(ruta, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for p in data:
                        session.add(Producto(**p))
                session.commit()
                print("Productos cargados desde productos.json")
            else:
                print("No se encontró el archivo productos.json")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar productos desde el archivo JSON
def cargar_productos():
    ruta_productos = Path(__file__).parent / "productos.json"
    with open(ruta_productos, "r", encoding="utf-8") as archivo:
        return json.load(archivo)

@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}

# Productos
@app.get("/productos", response_model=list[Producto])
def listar_productos(session: Session = Depends(get_session)):
    productos = session.exec(select(Producto)).all()
    # Si no hay productos en la BD, cargamos los del JSON
    if not productos:
        data = cargar_productos()
        for p in data:
            session.add(Producto(**p))
        session.commit()
        productos = session.exec(select(Producto)).all()
    return productos

# Obtener detalle de un producto por ID
@app.get("/productos/{producto_id}", response_model=Producto)
def detalle_producto(producto_id: int, session: Session = Depends(get_session)):
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

# Autentificacion
@app.post("/registrar")
def registrar(usuario: UsuarioCreate, session: Session = Depends(get_session)):
    return registrar_usuario(usuario, session)

# Iniciar sesion
@app.post("/iniciar-sesion")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(Usuario).where(Usuario.email == form_data.username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    access_token = create_access_token(data={"sub": user.email})
    return {
        "mensaje": "Inicio de sesión exitoso",
        "access_token": access_token,
        "token_type": "bearer"
    }

# Cerrar sesión
@app.post("/cerrar-sesion")
def cerrar_sesion():
    return {"mensaje": "Sesión cerrada. El token ya no es válido en el cliente."}

# Endpoint de prueba protegido con JWT
@app.get("/protegido")
def endpoint_protegido(usuario: Usuario = Depends(get_current_user)):
    return {"mensaje": f"Hola {usuario.nombre}, estás autenticado"}

# Usuarios
@app.post("/usuarios/", response_model=Usuario)
def crear_usuario(usuario: Usuario, session: Session = Depends(get_session)):
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return usuario

@app.get("/usuarios/", response_model=List[Usuario])
def listar_usuarios(session: Session = Depends(get_session)):
    return session.exec(select(Usuario)).all()

#  Carrito 
@app.post("/carrito/", response_model=CarritoItem)
def agregar_al_carrito(
    item: CarritoItem,
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(get_current_user)
):
    # Validar usuario
    if not usuario or not usuario.id:
        raise HTTPException(status_code=403, detail="Usuario no válido")

    # Buscar producto
    producto = session.get(Producto, item.producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Buscar si ya hay un item del mismo producto para este usuario
    existente = session.exec(
        select(CarritoItem).where(
            (CarritoItem.usuario_id == usuario.id) &
            (CarritoItem.producto_id == item.producto_id)
        )
    ).first()

    if existente:
        nueva_cantidad = existente.cantidad + item.cantidad
        if nueva_cantidad > producto.existencia:
            raise HTTPException(
                status_code=400,
                detail=f"No hay stock suficiente. Disponible: {producto.existencia}, intentás: {nueva_cantidad}"
            )
        existente.cantidad = nueva_cantidad
        session.add(existente)
        session.commit()
        session.refresh(existente)
        return existente
    else:
        # Nuevo item: validar stock
        if item.cantidad > producto.existencia:
            raise HTTPException(
                status_code=400,
                detail=f"No hay stock suficiente. Disponible: {producto.existencia}, intentás: {item.cantidad}"
            )
        item.usuario_id = usuario.id
        session.add(item)
        session.commit()
        session.refresh(item)
        return item

# Ver contenido del carrito
@app.get("/carrito/", response_model=list[CarritoItem])
def ver_carrito(usuario: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    items = session.exec(select(CarritoItem).where(CarritoItem.usuario_id == usuario.id)).all()
    return items

# Quitar producto del carrito
@app.delete("/carrito/{producto_id}")
def eliminar_del_carrito(producto_id: int, session: Session = Depends(get_session)):
    item = session.exec(select(CarritoItem).where(CarritoItem.producto_id == producto_id)).first()
    if not item:
        return {"mensaje": "El producto no está en el carrito"}
    session.delete(item)
    session.commit()
    return {"mensaje": f"Producto con ID {producto_id} eliminado del carrito"}

# Historial compras
@app.get("/compras/", response_model=list[Compra])
def ver_compras(usuario: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    compras = session.exec(select(Compra).where(Compra.usuario_id == usuario.id)).all()
    return compras

# Ver detalle de una compra especifica
@app.get("/compras/{compra_id}", response_model=Compra)
def detalle_compra(compra_id: int, usuario: Usuario = Depends(get_current_user), session: Session = Depends(get_session)):
    compra = session.get(Compra, compra_id)
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    if compra.usuario_id != usuario.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta compra")
    return compra

# Cancelar compra (vaciar carrito)
@app.post("/carrito/cancelar")
def cancelar_carrito(session: Session = Depends(get_session)):
    items = session.exec(select(CarritoItem)).all()
    if not items:
        return {"mensaje": "El carrito ya está vacío"}
    for item in items:
        session.delete(item)
    session.commit()
    return {"mensaje": "Compra cancelada, carrito vaciado"}


# Finalizar compra con IVA y envío
@app.post("/carrito/finalizar")
def finalizar_compra(
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(get_current_user)  
):
    items = session.exec(select(CarritoItem).where(CarritoItem.usuario_id == usuario.id)).all()
    if not items:
        return {"mensaje": "El carrito está vacío"}

    subtotal = 0
    for item in items:
        producto = session.get(Producto, item.producto_id)
        if producto:
            subtotal += producto.precio * item.cantidad
            producto.existencia -= item.cantidad  # Actualiza el stock

    # Calcular IVA según categoría
    iva = 0
    for item in items:
        producto = session.get(Producto, item.producto_id)
        if producto:
            tasa_iva = 0.10 if producto.categoria.lower() == "electrónica" else 0.21
            iva += producto.precio * item.cantidad * tasa_iva

    total = subtotal + iva
    envio = 0 if total > 1000 else 50
    total += envio

    # Crear compra asociada al usuario
    compra = Compra(
        total=total,
        fecha=datetime.utcnow(),
        usuario_id=usuario.id
    )
    session.add(compra)

    # Vaciar carrito
    for item in items:
        session.delete(item)

    session.commit()
    return {
        "mensaje": "Compra finalizada con éxito",
        "subtotal": subtotal,
        "iva": iva,
        "envio": envio,
        "total": total
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
