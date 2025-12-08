from fastapi import FastAPI, HTTPException, Depends, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select
import json
from pathlib import Path
from datetime import datetime, timedelta
from models import Producto, Usuario, Carrito
from models.compra import Compra
from models.item_compra import ItemCompra
from schemas import UsuarioRegistro, UsuarioLogin, ProductoCreateDTO, ProductoUpdateDTO, CarritoAgregar, CompraCreateDTO, CompraDTO, CompraResumenDTO, CompraItemSchema
from auth import hash_password, verify_password, generar_token, obtener_usuario_actual, verificar_no_autenticado
from database import get_session, inicializar_tablas, engine

app = FastAPI(title="API Productos")

app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def inicializar_base_datos():
    inicializar_tablas()
    
    with Session(engine) as session:
        resultado = session.exec(select(Producto)).first()
        if not resultado:
            ruta_productos = Path(__file__).parent / "productos.json"
            with open(ruta_productos, "r", encoding="utf-8") as archivo:
                productos_data = json.load(archivo)
            
            for producto_data in productos_data:
                producto = Producto(**producto_data)
                session.add(producto)
            
            session.commit()

@app.on_event("startup")
def on_startup():
    inicializar_base_datos()

@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}

@app.get("/me")
def obtener_usuario_info(
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email
    }


@app.post("/registrar", status_code=status.HTTP_201_CREATED)
def registrar_usuario(
    usuario_data: UsuarioRegistro,
    session: Session = Depends(get_session)
):
    usuario_existente = session.exec(
        select(Usuario).where(Usuario.email == usuario_data.email)
    ).first()
    
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    nuevo_usuario = Usuario(
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        password=hash_password(usuario_data.password)
    )
    
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    
    return {"mensaje": "Usuario registrado exitosamente", "email": nuevo_usuario.email}

@app.post("/iniciar-sesion")
def iniciar_sesion(
    credenciales: UsuarioLogin,
    response: Response,
    session: Session = Depends(get_session)
):
    usuario = session.exec(
        select(Usuario).where(Usuario.email == credenciales.email)
    ).first()
    
    if not usuario or not verify_password(credenciales.password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Generar nuevo token (sobrescribe sesión anterior si existe)
    usuario.token = generar_token()
    usuario.token_expiracion = (datetime.now() + timedelta(hours=1)).isoformat()
    
    session.add(usuario)
    session.commit()
    
    response.set_cookie(
        key="token",
        value=usuario.token,
        max_age=3600,
        httponly=True,
        samesite="lax"
    )
    
    return {"access_token": usuario.token, "token_type": "bearer"}

@app.post("/cerrar-sesion")
def cerrar_sesion(
    response: Response,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    usuario.token = None
    usuario.token_expiracion = None
    session.add(usuario)
    session.commit()
    
    response.delete_cookie(key="token", samesite="lax")
    
    return {"mensaje": "Sesión cerrada exitosamente"}


@app.get("/productos")
def obtener_productos(
    buscar: str | None = None,
    categoria: str | None = None,
    session: Session = Depends(get_session)
):
    query = select(Producto)
    
    if buscar:
        buscar_lower = f"%{buscar.lower()}%"
        query = query.where(
            (Producto.titulo.ilike(buscar_lower)) | 
            (Producto.descripcion.ilike(buscar_lower))
        )
    
    if categoria:
        query = query.where(Producto.categoria.ilike(f"%{categoria}%"))
    
    productos = session.exec(query).all()
    return productos

@app.get("/productos/{producto_id}")
def obtener_producto_por_id(producto_id: int, session: Session = Depends(get_session)):
    producto = session.get(Producto, producto_id)
    
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    return producto

@app.post("/productos", status_code=status.HTTP_201_CREATED)
def crear_producto(
    producto_data: ProductoCreateDTO,
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    nuevo_producto = Producto(**producto_data.model_dump())
    
    session.add(nuevo_producto)
    session.commit()
    session.refresh(nuevo_producto)
    
    return nuevo_producto

@app.put("/productos/{producto_id}")
def actualizar_producto(
    producto_id: int,
    producto_data: ProductoUpdateDTO,
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    producto = session.get(Producto, producto_id)
    
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    datos_actualizacion = producto_data.model_dump(exclude_unset=True)
    for key, value in datos_actualizacion.items():
        setattr(producto, key, value)
    
    session.add(producto)
    session.commit()
    session.refresh(producto)
    
    return producto

@app.delete("/productos/{producto_id}")
def eliminar_producto(
    producto_id: int,
    session: Session = Depends(get_session),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    producto = session.get(Producto, producto_id)
    
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    session.delete(producto)
    session.commit()
    
    return {"mensaje": "Producto eliminado exitosamente", "id": producto_id}


@app.get("/carrito")
def ver_carrito(
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    items_carrito = session.exec(
        select(Carrito).where(Carrito.usuario_id == usuario.id)
    ).all()
    
    resultado = []
    subtotal_general = 0.0
    iva_total = 0.0
    
    for item in items_carrito:
        producto = session.get(Producto, item.producto_id)
        if not producto:
            continue
        
        subtotal_item = producto.precio * item.cantidad
        
        tasa_iva = 0.10 if "electrónica" in producto.categoria.lower() else 0.21
        iva_item = subtotal_item * tasa_iva
        
        resultado.append({
            "id": item.id,
            "producto_id": producto.id,
            "titulo": producto.titulo,
            "precio": producto.precio,
            "cantidad": item.cantidad,
            "subtotal": subtotal_item,
            "iva": iva_item,
            "imagen": producto.imagen
        })
        
        subtotal_general += subtotal_item
        iva_total += iva_item
    
    total = subtotal_general + iva_total
    
    return {
        "items": resultado,
        "subtotal": subtotal_general,
        "iva": iva_total,
        "total": total
    }

@app.post("/carrito", status_code=status.HTTP_201_CREATED)
def agregar_al_carrito(
    carrito_data: CarritoAgregar,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    producto = session.get(Producto, carrito_data.producto_id)
    
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    if producto.existencia < carrito_data.cantidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente. Disponible: {producto.existencia}"
        )
    
    item_existente = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario.id,
            Carrito.producto_id == carrito_data.producto_id
        )
    ).first()
    
    if item_existente:
        nueva_cantidad = item_existente.cantidad + carrito_data.cantidad
        if producto.existencia < nueva_cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente. Disponible: {producto.existencia}"
            )
        item_existente.cantidad = nueva_cantidad
        session.add(item_existente)
    else:
        nuevo_item = Carrito(
            usuario_id=usuario.id,
            producto_id=carrito_data.producto_id,
            cantidad=carrito_data.cantidad
        )
        session.add(nuevo_item)
    
    session.commit()
    
    return {"mensaje": "Producto agregado al carrito"}

@app.patch("/carrito/{producto_id}")
def actualizar_cantidad_carrito(
    producto_id: int,
    cantidad: int,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    item = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario.id,
            Carrito.producto_id == producto_id
        )
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado en el carrito"
        )
    
    if cantidad <= 0:
        session.delete(item)
        session.commit()
        return {"mensaje": "Producto eliminado del carrito", "cantidad": 0}
    
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    if cantidad > producto.existencia:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente. Disponible: {producto.existencia}"
        )
    
    item.cantidad = cantidad
    session.add(item)
    session.commit()
    
    return {"mensaje": "Cantidad actualizada", "cantidad": cantidad}

@app.delete("/carrito/{producto_id}")
def quitar_del_carrito(
    producto_id: int,
    decrementar: bool = False,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    item = session.exec(
        select(Carrito).where(
            Carrito.usuario_id == usuario.id,
            Carrito.producto_id == producto_id
        )
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado en el carrito"
        )
    
    if decrementar:
        if item.cantidad > 1:
            item.cantidad -= 1
            session.add(item)
            session.commit()
            return {"mensaje": "Cantidad decrementada", "cantidad": item.cantidad}
        else:
            session.delete(item)
            session.commit()
            return {"mensaje": "Producto eliminado del carrito", "cantidad": 0}
    else:
        session.delete(item)
        session.commit()
        return {"mensaje": "Producto eliminado del carrito"}

@app.post("/carrito/cancelar")
def cancelar_compra(
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    items = session.exec(
        select(Carrito).where(Carrito.usuario_id == usuario.id)
    ).all()
    
    for item in items:
        session.delete(item)
    
    session.commit()
    
    return {"mensaje": "Carrito vaciado exitosamente"}

@app.post("/carrito/finalizar", response_model=CompraDTO)
def finalizar_compra(
    compra_data: CompraCreateDTO,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    items = session.exec(select(Carrito).where(Carrito.usuario_id == usuario.id)).all()
    if not items:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    total = 0.0
    compra_items = []
    for item in items:
        producto = session.get(Producto, item.producto_id)
        if not producto or producto.existencia < item.cantidad:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para producto {item.producto_id}")
        subtotal = producto.precio * item.cantidad
        tasa_iva = 0.10 if "electrónica" in producto.categoria.lower() else 0.21
        iva = subtotal * tasa_iva
        total += subtotal + iva
        compra_items.append({
            "producto_id": item.producto_id,
            "cantidad": item.cantidad,
            "precio_unitario": producto.precio,
            "subtotal": subtotal
        })
        producto.existencia -= item.cantidad
        session.add(producto)

    compra = Compra(
        usuario_id=usuario.id,
        fecha=datetime.now(),
        total=total,
        direccion=compra_data.direccion,
        tarjeta=compra_data.tarjeta[-4:],
        estado="completada"
    )
    session.add(compra)
    session.commit()
    session.refresh(compra)

    for item in compra_items:
        item_compra = ItemCompra(
            compra_id=compra.id,
            producto_id=item["producto_id"],
            cantidad=item["cantidad"],
            precio_unitario=item["precio_unitario"],
            subtotal=item["subtotal"]
        )
        session.add(item_compra)
    session.commit()

    # Vaciar carrito
    for item in items:
        session.delete(item)
    session.commit()

    compra_items_db = session.exec(select(ItemCompra).where(ItemCompra.compra_id == compra.id)).all()
    items_schema = []
    for ic in compra_items_db:
        producto = session.get(Producto, ic.producto_id)
        items_schema.append(CompraItemSchema(
            producto_id=ic.producto_id,
            titulo=producto.titulo if producto else "Producto no disponible",
            imagen=producto.imagen if producto else None,
            cantidad=ic.cantidad,
            precio_unitario=ic.precio_unitario,
            subtotal=ic.subtotal
        ))

    return CompraDTO(
        id=compra.id,
        usuario_id=compra.usuario_id,
        fecha=compra.fecha,
        total=compra.total,
        direccion=compra.direccion,
        estado=compra.estado,
        items=items_schema
    )


@app.get("/compras", response_model=list[CompraResumenDTO])
def ver_historial_compras(
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    compras = session.exec(select(Compra).where(Compra.usuario_id == usuario.id).order_by(Compra.fecha.desc())).all()
    return [CompraResumenDTO(
        id=c.id,
        fecha=c.fecha,
        total=c.total,
        estado=c.estado
    ) for c in compras]

@app.get("/compras/{compra_id}", response_model=CompraDTO)
def ver_detalle_compra(
    compra_id: int,
    usuario: Usuario = Depends(obtener_usuario_actual),
    session: Session = Depends(get_session)
):
    compra = session.get(Compra, compra_id)
    if not compra or compra.usuario_id != usuario.id:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    items_db = session.exec(select(ItemCompra).where(ItemCompra.compra_id == compra.id)).all()
    items_schema = []
    for ic in items_db:
        producto = session.get(Producto, ic.producto_id)
        items_schema.append(CompraItemSchema(
            producto_id=ic.producto_id,
            titulo=producto.titulo if producto else "Producto no disponible",
            imagen=producto.imagen if producto else None,
            cantidad=ic.cantidad,
            precio_unitario=ic.precio_unitario,
            subtotal=ic.subtotal
        ))
    return CompraDTO(
        id=compra.id,
        usuario_id=compra.usuario_id,
        fecha=compra.fecha,
        total=compra.total,
        direccion=compra.direccion,
        estado=compra.estado,
        items=items_schema
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
