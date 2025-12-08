from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
from pathlib import Path
from datetime import datetime
from typing import List

import json

from database import create_db_and_tables, get_session, engine
from models import (
    Usuario,
    UsuarioCreate,
    Producto,
    ItemCarrito,
    ItemCarritoCreate,
    Compra,
    ItemCompra,
    DatosCompra,
)
from auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
)

app = FastAPI(title="TP6 Shop API")

# Montar directorio de imágenes
imagenes_dir = Path(__file__).parent / "imagenes"
if imagenes_dir.exists():
    app.mount("/imagenes", StaticFiles(directory=str(imagenes_dir)), name="imagenes")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:3003"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Crear tablas
    create_db_and_tables()

    # Cargar productos desde JSON si la tabla está vacía
    ruta = Path(__file__).parent / "productos.json"
    if ruta.exists():
        with Session(engine) as session:
            # Verificar si ya hay productos en la base de datos
            existing = session.exec(select(Producto)).all()
            if not existing:  # Solo cargar si no hay productos
                try:
                    with open(ruta, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        print(f"Cargando {len(data)} productos desde productos.json...")
                        for p in data:
                            # Mapear campos del JSON (titulo -> nombre)
                            prod = Producto(
                                nombre=p.get("nombre") or p.get("titulo") or "",
                                descripcion=p.get("descripcion", ""),
                                precio=float(p.get("precio", 0)),
                                categoria=p.get("categoria", ""),
                                existencia=int(p.get("existencia", p.get("stock", 0))),
                                imagen=p.get("imagen", None),
                            )
                            session.add(prod)
                        session.commit()
                        print("Productos cargados exitosamente")
                except Exception as e:
                    print(f"Error al cargar productos: {e}")
            else:
                print(f"Ya hay {len(existing)} productos en la base de datos")


# --------- Autenticación ---------
@app.post("/registrar")
def registrar(usuario: UsuarioCreate, db: Session = Depends(get_session)):
    existing = db.exec(select(Usuario).where(Usuario.email == usuario.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    hashed = get_password_hash(usuario.password)
    nuevo = Usuario(nombre=usuario.nombre, email=usuario.email, hashed_password=hashed)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {"id": nuevo.id, "nombre": nuevo.nombre, "email": nuevo.email}


@app.post("/iniciar-sesion")
def iniciar_sesion(form: dict, db: Session = Depends(get_session)):
    # Aceptar JSON con {"username":..., "password":...}
    username = form.get("username")
    password = form.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="username y password requeridos")
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/cerrar-sesion")
def cerrar_sesion(current_user: Usuario = Depends(get_current_user)):
    # En este ejemplo no almacenamos blacklist, sólo devolvemos mensaje
    return {"message": "Sesión cerrada"}


# --------- Productos ---------
@app.get("/productos")
def listar_productos(categoria: str = None, busqueda: str = None, db: Session = Depends(get_session)):
    q = select(Producto)
    if categoria:
        q = q.where(Producto.categoria == categoria)
    if busqueda:
        q = q.where(Producto.nombre.contains(busqueda))
    productos = db.exec(q).all()
    resultado = []
    for p in productos:
        resultado.append({
            "id": p.id,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "precio": p.precio,
            "categoria": p.categoria,
            "existencia": p.existencia,
            "imagen": p.imagen,
            "agotado": (p.existencia <= 0),
        })
    return resultado


@app.get("/productos/{producto_id}")
def obtener_producto(producto_id: int, db: Session = Depends(get_session)):
    producto = db.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


# --------- Carrito ---------
@app.post("/carrito")
def agregar_al_carrito(item: ItemCarritoCreate, db: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    producto = db.get(Producto, item.producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if producto.existencia < item.cantidad:
        raise HTTPException(status_code=400, detail="No hay suficiente stock")

    # buscar o crear carrito activo
    carrito = db.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == None)).first()
    # Simplificamos: cada usuario tiene un carrito 'activo' por su usuario
    from models import Carrito
    carrito = db.exec(select(Carrito).where(Carrito.usuario_id == current_user.id, Carrito.estado == "activo")).first()
    if not carrito:
        carrito = Carrito(usuario_id=current_user.id, estado="activo")
        db.add(carrito)
        db.commit()
        db.refresh(carrito)

    # si ya existe el item en el carrito, sumar cantidad
    existing_item = db.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == item.producto_id)).first()
    if existing_item:
        existing_item.cantidad += item.cantidad
    else:
        nuevo = ItemCarrito(carrito_id=carrito.id, producto_id=item.producto_id, cantidad=item.cantidad)
        db.add(nuevo)

    producto.existencia -= item.cantidad
    db.commit()
    return {"message": "Producto agregado al carrito"}


@app.get("/carrito")
def ver_carrito(db: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    from models import Carrito
    carrito = db.exec(select(Carrito).where(Carrito.usuario_id == current_user.id, Carrito.estado == "activo")).first()
    if not carrito:
        return {"items": [], "subtotal": 0, "iva": 0, "envio": 0, "total": 0}

    items = []
    subtotal = 0.0
    iva_total = 0.0
    for it in carrito.items:
        prod = db.get(Producto, it.producto_id)
        line_total = prod.precio * it.cantidad
        iva = line_total * (0.10 if "electro" in (prod.categoria or "").lower() else 0.21)
        subtotal += line_total
        iva_total += iva
        items.append({
            "producto_id": prod.id,
            "nombre": prod.nombre,
            "precio": prod.precio,
            "cantidad": it.cantidad,
            "imagen": prod.imagen,
            "iva": iva,
        })

    envio = 0 if subtotal > 1000 else 50
    total = subtotal + iva_total + envio

    return {"items": items, "subtotal": subtotal, "iva": iva_total, "envio": envio, "total": total}


@app.delete("/carrito/{producto_id}")
def quitar_del_carrito(producto_id: int, db: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    from models import Carrito
    carrito = db.exec(select(Carrito).where(Carrito.usuario_id == current_user.id, Carrito.estado == "activo")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="No hay carrito activo")

    item = db.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito.id, ItemCarrito.producto_id == producto_id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Producto no encontrado en el carrito")

    producto = db.get(Producto, producto_id)
    producto.existencia += item.cantidad
    db.delete(item)
    db.commit()
    return {"message": "Producto eliminado del carrito"}


@app.post("/carrito/finalizar")
def finalizar_compra(datos: DatosCompra, db: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    from models import Carrito
    carrito = db.exec(select(Carrito).where(Carrito.usuario_id == current_user.id, Carrito.estado == "activo")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="No hay carrito activo")

    subtotal = 0.0
    iva_total = 0.0
    items_compra = []
    for it in carrito.items:
        prod = db.get(Producto, it.producto_id)
        line_total = prod.precio * it.cantidad
        iva = line_total * (0.10 if "electro" in (prod.categoria or "").lower() else 0.21)
        subtotal += line_total
        iva_total += iva
        items_compra.append(ItemCompra(producto_id=prod.id, cantidad=it.cantidad, nombre=prod.nombre, precio_unitario=prod.precio))

    envio = 0 if subtotal > 1000 else 50
    total = subtotal + iva_total + envio

    compra = Compra(usuario_id=current_user.id, fecha=datetime.now(), direccion=datos.direccion, tarjeta=datos.tarjeta, total=total, envio=envio)
    db.add(compra)
    db.commit()
    db.refresh(compra)

    # agregar items compra con compra_id
    for ic in items_compra:
        ic.compra_id = compra.id
        db.add(ic)
    carrito.estado = "finalizado"
    db.commit()

    return {"message": "Compra finalizada", "compra_id": compra.id}


@app.post("/carrito/cancelar")
def cancelar_compra(db: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    from models import Carrito
    carrito = db.exec(select(Carrito).where(Carrito.usuario_id == current_user.id, Carrito.estado == "activo")).first()
    if not carrito:
        raise HTTPException(status_code=404, detail="No hay carrito activo")

    # devolver stock
    for it in carrito.items:
        prod = db.get(Producto, it.producto_id)
        prod.existencia += it.cantidad

    # eliminar items y carrito
    for it in list(carrito.items):
        db.delete(it)
    db.delete(carrito)
    db.commit()
    return {"message": "Carrito cancelado"}


# --------- Compras ---------
@app.get("/compras")
def listar_compras(db: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    compras = db.exec(select(Compra).where(Compra.usuario_id == current_user.id).order_by(Compra.fecha)).all()
    resultado = []
    for idx, c in enumerate(compras, start=1):
        resultado.append({
            "id": c.id,
            "numero_compra": idx,  
            "fecha": c.fecha,
            "total": c.total,
            "envio": c.envio,
        })
    return resultado


@app.get("/compras/{compra_id}")
def ver_compra(compra_id: int, db: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    compra = db.get(Compra, compra_id)
    if not compra or compra.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Compra no encontrada")

    # Calcular el número de compra del usuario
    compras_usuario = db.exec(select(Compra).where(Compra.usuario_id == current_user.id).order_by(Compra.fecha)).all()
    numero_compra = next((idx for idx, c in enumerate(compras_usuario, start=1) if c.id == compra.id), None)

    items = db.exec(select(ItemCompra).where(ItemCompra.compra_id == compra.id)).all()
    return {
        "id": compra.id,
        "numero_compra": numero_compra,  # Número relativo al usuario
        "fecha": compra.fecha,
        "direccion": compra.direccion,
        "tarjeta": compra.tarjeta,
        "total": compra.total,
        "envio": compra.envio,
        "items": [
            {
                "producto_id": i.producto_id,
                "cantidad": i.cantidad,
                "nombre": i.nombre,
                "precio_unitario": i.precio_unitario
            } for i in items
        ]
    }


# --------- Endpoint para desarrollo: Reset de productos ---------
@app.post("/dev/reset-productos")
def reset_productos(db: Session = Depends(get_session)):
    """Endpoint para desarrollo: Elimina todos los productos y los recarga desde JSON"""
    try:
        # Eliminar todos los productos existentes
        db.exec(select(Producto)).all()
        productos_existentes = db.exec(select(Producto)).all()
        for producto in productos_existentes:
            db.delete(producto)
        db.commit()
        
        # Recargar productos desde JSON
        ruta = Path(__file__).parent / "productos.json"
        if ruta.exists():
            with open(ruta, "r", encoding="utf-8") as f:
                data = json.load(f)
                for p in data:
                    prod = Producto(
                        nombre=p.get("nombre") or p.get("titulo") or "",
                        descripcion=p.get("descripcion", ""),
                        precio=float(p.get("precio", 0)),
                        categoria=p.get("categoria", ""),
                        existencia=int(p.get("existencia", p.get("stock", 0))),
                        imagen=p.get("imagen", None),
                    )
                    db.add(prod)
                db.commit()
        
        return {"message": f"Productos reseteados exitosamente. {len(data)} productos cargados."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al resetear productos: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
