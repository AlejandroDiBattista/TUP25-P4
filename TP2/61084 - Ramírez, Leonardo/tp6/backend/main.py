from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import json
from typing import Optional, List
from fastapi import Header, Depends, HTTPException, Request
import datetime

# Persistencia con SQLModel
from sqlmodel import SQLModel, create_engine, Session, select
from models.productos import Producto
from models.usuario import Usuario
from models.compra import Compra
from pathlib import Path as _Path

app = FastAPI(title="API Productos")

# --- Dependencia para leer el token (acepta header con/sin "Bearer" o query param "token") ---
def get_user_from_header(request: Request):
    # lee header (case-insensitive) o query param "token"
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    token = None
    if auth:
        # aceptar "Bearer <token>" o solo "<token>".
        # además, soportar accidentalmente repetidos como "Bearer Bearer <token>".
        if auth.lower().startswith("bearer "):
            # quitar uno o más prefijos "Bearer "
            token = auth
            # eliminar repetidos de forma segura
            while token.lower().startswith("bearer "):
                token = token.split(" ", 1)[1].strip()
        else:
            token = auth.strip()
    else:
        # fallback a query param 'token'
        token = request.query_params.get("token")
    # si no hay token -> devuelve None (dependencia no estricta)
    if not token:
        return None
    usuario = tokens.get(token)
    if not usuario:
        # Fallback resiliente a reinicios en desarrollo:
        # si el servidor recargó y se vació el dict de tokens, aceptamos
        # tokens con el formato "token-<email>" si ese usuario existe.
        if token and token.startswith("token-"):
            email = token[len("token-"):]
            if any(u.get("email") == email for u in usuarios):
                # re-hidratar el token en memoria para próximas peticiones
                tokens[token] = email
                return email
        raise HTTPException(status_code=401, detail="Token inválido")
    return usuario

# Dependencia estricta: obliga a tener token válido (si no -> 401)
def get_user_strict(request: Request):
    user = get_user_from_header(request)
    if not user:
        raise HTTPException(status_code=401, detail="Token faltante")
    return user

# Montar imágenes estáticas
app.mount("/imagenes", StaticFiles(directory="imagenes"), name="imagenes")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- DATOS EN MEMORIA -----
usuarios = [
    {
        "email": "ramirezleonardo113@gmail.com",
        "password": "123456",
        "nombre": "Leonardo Ramírez"
    },
    # Usuarios de prueba para facilitar el ingreso durante la corrección/demos
    {"email": "admin@admin.com", "password": "admin", "nombre": "Admin"},
    {"email": "demo@demo.com", "password": "demo", "nombre": "Usuario Demo"},
]
tokens = {}
carrito = {}
# compras por usuario: { email: [compra, ...], ...}
compras = {}
# lista global para buscar compras por id
purchases_by_id = []

# ----- FUNCIONES AUXILIARES -----
def cargar_productos():
    """Obtener productos desde la base de datos. Si la tabla está vacía,
    `init_db()` se encargó de poblarla desde el JSON.
    Como fallback lee el archivo JSON si por alguna razón la DB no está disponible.
    """
    try:
        with Session(engine) as session:
            productos_db = session.exec(select(Producto)).all()
            # convertir objetos SQLModel a diccionarios con claves esperadas
            productos = []
            for p in productos_db:
                productos.append({
                    "id": p.id,
                    "titulo": p.titulo,
                    "precio": p.precio,
                    "descripcion": p.descripcion,
                    "categoria": p.categoria,
                    "valoracion": p.valoracion,
                    "existencia": p.existencia,
                    "imagen": p.imagen,
                })
            return productos
    except Exception:
        ruta_productos = Path(__file__).parent / "productos.json"
        with open(ruta_productos, "r", encoding="utf-8") as archivo:
            return json.load(archivo)


# -------------------
# Base de datos
# -------------------
DB_PATH = _Path(__file__).parent / "database.db"
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)


def init_db():
    """Crear tablas y poblar productos desde productos.json si la tabla está vacía."""
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Poblar usuarios si no existen
        usuarios_existentes = session.exec(select(Usuario)).all()
        if len(usuarios_existentes) == 0:
            for u in usuarios:
                usuario_db = Usuario(
                    email=u["email"],
                    password=u["password"],  # En producción: hashear con bcrypt
                    nombre=u["nombre"]
                )
                session.add(usuario_db)
            session.commit()
        
        # Poblar productos si no existen
        productos_existentes = session.exec(select(Producto)).all()
        if len(productos_existentes) == 0:
            # poblar desde productos.json
            ruta_productos = Path(__file__).parent / "productos.json"
            try:
                with open(ruta_productos, "r", encoding="utf-8") as archivo:
                    datos = json.load(archivo)
            except Exception:
                datos = []
            for p in datos:
                prod = Producto(
                    id=p.get("id"),
                    titulo=p.get("titulo") or p.get("nombre") or "",
                    descripcion=p.get("descripcion", ""),
                    precio=p.get("precio", 0.0),
                    categoria=p.get("categoria", ""),
                    valoracion=p.get("valoracion", 0.0),
                    existencia=p.get("existencia", 0),
                    imagen=p.get("imagen", ""),
                )
                session.add(prod)
            session.commit()


# Inicializar DB al arrancar el módulo
init_db()

# ----- ENDPOINTS DE AUTENTICACIÓN -----

# Modelos de entrada/salida
from pydantic import BaseModel

class UsuarioRegistro(BaseModel):
    email: str
    password: str
    nombre: str = ""

class UsuarioLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@app.post("/registrar")
def registrar_usuario(usuario: UsuarioRegistro):
    if any(u["email"] == usuario.email for u in usuarios):
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    usuarios.append({
        "email": usuario.email,
        "password": usuario.password,
        "nombre": usuario.nombre
    })
    return {"mensaje": "Usuario registrado correctamente"}

@app.post("/iniciar-sesion")
def iniciar_sesion(datos: UsuarioLogin):
    for u in usuarios:
        if u["email"] == datos.email and u["password"] == datos.password:
            token = f"token-{u['email']}"
            tokens[token] = u["email"]
            return TokenResponse(
                access_token=token,
                token_type="bearer"
            )
    raise HTTPException(status_code=401, detail="Credenciales inválidas")


@app.post("/cerrar-sesion")
async def cerrar_sesion(request: Request):
    # intenta leer token desde Authorization header (con/sin Bearer) o desde body JSON { "token": "..." }
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    token = None
    if auth:
        # reutilizar la misma lógica: quitar posibles repetidos "Bearer "
        token = auth
        while token.lower().startswith("bearer "):
            token = token.split(" ", 1)[1].strip()
    else:
        # probar query param 'token' y luego body
        token = request.query_params.get("token")
        if not token:
            try:
                data = await request.json()
                token = data.get("token")
            except Exception:
                token = None
    if token and token in tokens:
        del tokens[token]
        return {"mensaje": "Sesión cerrada correctamente"}
    raise HTTPException(status_code=400, detail="Token inválido")

# ----- ENDPOINTS DE PRODUCTOS -----
@app.get("/productos")
def obtener_productos(categoria: Optional[str] = None, busqueda: Optional[str] = None, buscar: Optional[str] = None):
    # aceptar "buscar" como alias para compatibilidad con los tests
    if not busqueda and buscar:
        busqueda = buscar
    productos = cargar_productos()
    if categoria:
        productos = [p for p in productos if p["categoria"].lower() == categoria.lower()]
    if busqueda:
        productos = [p for p in productos if busqueda.lower() in p["titulo"].lower()]
    return productos

@app.get("/productos/{id}")
def obtener_producto(id: int):
    productos = cargar_productos()
    for p in productos:
        if p["id"] == id:
            return p
    raise HTTPException(status_code=404, detail="Producto no encontrado")

# ----- ENDPOINTS DE GESTIÓN DE STOCK -----

@app.get("/productos/{id}/stock")
def consultar_stock(id: int):
    """
    Consultar el stock disponible de un producto específico.
    """
    with Session(engine) as session:
        producto = session.get(Producto, id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        return {
            "producto_id": producto.id,
            "titulo": producto.titulo,
            "existencia": producto.existencia,
            "precio": producto.precio,
            "categoria": producto.categoria
        }

@app.put("/productos/{id}/stock")
def actualizar_stock(id: int, datos: dict, auth_user: str = Depends(get_user_strict)):
    """
    Actualizar el stock de un producto manualmente.
    Requiere autenticación.
    
    Body puede contener:
    - { "existencia": <nuevo_valor> } -> Establece stock absoluto
    - { "ajuste": <cantidad> } -> Suma o resta del stock actual (ej: +10 o -5)
    """
    with Session(engine) as session:
        producto = session.get(Producto, id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        stock_anterior = producto.existencia
        
        if "existencia" in datos:
            nueva_existencia = datos["existencia"]
            if nueva_existencia < 0:
                raise HTTPException(status_code=400, detail="El stock no puede ser negativo")
            producto.existencia = nueva_existencia
        elif "ajuste" in datos:
            ajuste = datos["ajuste"]
            nueva_existencia = producto.existencia + ajuste
            if nueva_existencia < 0:
                raise HTTPException(status_code=400, detail="El ajuste resultaría en stock negativo")
            producto.existencia = nueva_existencia
        else:
            raise HTTPException(status_code=400, detail="Debe proporcionar 'existencia' o 'ajuste'")
        
        session.add(producto)
        session.commit()
        session.refresh(producto)
        
        return {
            "mensaje": "Stock actualizado correctamente",
            "producto_id": producto.id,
            "titulo": producto.titulo,
            "stock_anterior": stock_anterior,
            "stock_actual": producto.existencia,
            "cambio": producto.existencia - stock_anterior
        }

@app.get("/stock/bajo")
def productos_stock_bajo(limite: int = 10):
    """
    Obtener lista de productos con stock bajo (menor o igual al límite especificado).
    Por defecto retorna productos con 10 o menos unidades.
    """
    with Session(engine) as session:
        productos = session.exec(
            select(Producto).where(Producto.existencia <= limite)
        ).all()
        
        return [
            {
                "id": p.id,
                "titulo": p.titulo,
                "existencia": p.existencia,
                "categoria": p.categoria,
                "precio": p.precio
            }
            for p in productos
        ]

@app.get("/stock/agotados")
def productos_agotados():
    """
    Obtener lista de productos sin stock (existencia = 0).
    """
    with Session(engine) as session:
        productos = session.exec(
            select(Producto).where(Producto.existencia == 0)
        ).all()
        
        return [
            {
                "id": p.id,
                "titulo": p.titulo,
                "categoria": p.categoria,
                "precio": p.precio
            }
            for p in productos
        ]

@app.post("/stock/reponer")
def reponer_stock(datos: dict, auth_user: str = Depends(get_user_strict)):
    """
    Reponer stock de múltiples productos a la vez.
    Requiere autenticación.
    
    Body: {
        "productos": [
            {"id": 1, "cantidad": 50},
            {"id": 2, "cantidad": 30}
        ]
    }
    """
    if "productos" not in datos:
        raise HTTPException(status_code=400, detail="Debe proporcionar lista de 'productos'")
    
    resultados = []
    
    with Session(engine) as session:
        for item in datos["productos"]:
            producto_id = item.get("id")
            cantidad = item.get("cantidad")
            
            if not producto_id or cantidad is None:
                continue
            
            producto = session.get(Producto, producto_id)
            if producto:
                stock_anterior = producto.existencia
                producto.existencia += cantidad
                session.add(producto)
                
                resultados.append({
                    "id": producto.id,
                    "titulo": producto.titulo,
                    "stock_anterior": stock_anterior,
                    "stock_actual": producto.existencia,
                    "cantidad_agregada": cantidad
                })
        
        session.commit()
    
    return {
        "mensaje": f"Stock repuesto para {len(resultados)} productos",
        "productos": resultados
    }

# ----- ENDPOINTS DEL CARRITO -----
@app.post("/carrito")
def agregar_al_carrito(datos: dict, auth_user: Optional[str] = Depends(get_user_from_header)):
    # Prioriza usuario autenticado por token; si no, usa "usuario" en el body
    usuario = auth_user or datos.get("usuario")
    producto_id = datos.get("producto_id")
    cantidad = datos.get("cantidad", 1)

    if not usuario or not producto_id:
        raise HTTPException(status_code=400, detail="Faltan datos: usuario o producto_id")

    if usuario not in carrito:
        carrito[usuario] = []
    # Validar stock real en la base de datos
    with Session(engine) as session:
        producto = session.get(Producto, producto_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        if producto.existencia <= 0:
            raise HTTPException(status_code=400, detail="Producto sin stock disponible")

        # Cantidad actual en el carrito (si existe ya)
        cantidad_en_carrito = 0
        for it in carrito[usuario]:
            if it["producto_id"] == producto_id:
                cantidad_en_carrito += it["cantidad"]

        nueva_cantidad_total = cantidad_en_carrito + cantidad
        if nueva_cantidad_total > producto.existencia:
            raise HTTPException(status_code=400, detail="Stock insuficiente para la cantidad solicitada")

        # Actualizar (merge) en vez de duplicar líneas
        item_existente = next((it for it in carrito[usuario] if it["producto_id"] == producto_id), None)
        if item_existente:
            item_existente["cantidad"] = nueva_cantidad_total
        else:
            carrito[usuario].append({"producto_id": producto_id, "cantidad": cantidad})

    return {
        "mensaje": "Producto agregado al carrito",
        "producto_id": producto_id,
        "cantidad_en_carrito": nueva_cantidad_total,
        "stock_disponible": producto.existencia,
        "stock_restante": producto.existencia - nueva_cantidad_total
    }

@app.patch("/carrito/{product_id}")
def actualizar_cantidad_carrito(product_id: int, datos: dict, auth_user: Optional[str] = Depends(get_user_from_header)):
    """Actualizar la cantidad de un producto en el carrito.
    Body: { "cantidad": <nueva_cantidad> }
    - Si cantidad == 0 -> eliminar item.
    - Valida stock contra existencia en DB.
    """
    usuario = auth_user or datos.get("usuario")
    if not usuario:
        raise HTTPException(status_code=400, detail="Falta usuario o token")
    if usuario not in carrito:
        carrito[usuario] = []
    nueva_cantidad = datos.get("cantidad")
    if nueva_cantidad is None or nueva_cantidad < 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")

    # Buscar item existente
    item_existente = next((it for it in carrito[usuario] if it["producto_id"] == product_id), None)
    if not item_existente:
        raise HTTPException(status_code=404, detail="Producto no está en el carrito")

    if nueva_cantidad == 0:
        carrito[usuario] = [it for it in carrito[usuario] if it["producto_id"] != product_id]
        return {"mensaje": "Producto eliminado", "producto_id": product_id, "cantidad": 0}

    # Validar contra stock real
    with Session(engine) as session:
        producto = session.get(Producto, product_id)
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        if nueva_cantidad > producto.existencia:
            raise HTTPException(status_code=400, detail="Stock insuficiente para la cantidad solicitada")

    item_existente["cantidad"] = nueva_cantidad
    return {
        "mensaje": "Cantidad actualizada",
        "producto_id": product_id,
        "cantidad": nueva_cantidad,
        "stock_disponible": producto.existencia,
        "stock_restante": producto.existencia - nueva_cantidad
    }

@app.delete("/carrito/{product_id}")
def quitar_del_carrito(product_id: int, usuario: Optional[str] = None, auth_user: Optional[str] = Depends(get_user_from_header)):
    usuario = auth_user or usuario
    if not usuario:
        raise HTTPException(status_code=400, detail="Falta parámetro 'usuario' o token Authorization")
    if usuario not in carrito or not carrito[usuario]:
        raise HTTPException(status_code=404, detail="Carrito vacío")
    carrito[usuario] = [p for p in carrito[usuario] if p["producto_id"] != product_id]
    return {"mensaje": "Producto eliminado del carrito"}

from typing import Optional

@app.get("/carrito")
def ver_carrito(usuario: Optional[str] = None, auth_user: Optional[str] = Depends(get_user_from_header)):
    usuario = auth_user or usuario
    if usuario:
        return carrito.get(usuario, [])
    return carrito

# --- ENDPOINTS DE COMPRAS ---

@app.get("/compras")
def ver_compras(auth_user: str = Depends(get_user_strict)):
    # exigir token válido y devolver historial del usuario autenticado
    usuario = auth_user
    with Session(engine) as session:
        compras_db = session.exec(
            select(Compra).where(Compra.usuario_email == usuario)
        ).all()
        
        resultado = []
        for c in compras_db:
            resultado.append({
                "id": c.id,
                "usuario": c.usuario_email,
                "items": json.loads(c.items),
                "subtotal": c.subtotal,
                "iva": c.iva,
                "envio": c.envio,
                "total": c.total,
                "direccion": c.direccion,
                "fecha": c.fecha.isoformat()
            })
        return resultado
  
@app.get("/compras/{id}")
def detalle_compra(id: int):
    # Buscar compra en la base de datos
    with Session(engine) as session:
        compra_db = session.get(Compra, id)
        if not compra_db:
            raise HTTPException(status_code=404, detail="Compra no encontrada")
        
        c = {
            "id": compra_db.id,
            "usuario": compra_db.usuario_email,
            "items": json.loads(compra_db.items),
            "subtotal": compra_db.subtotal,
            "iva": compra_db.iva,
            "envio": compra_db.envio,
            "total": compra_db.total,
            "direccion": compra_db.direccion,
            "fecha": compra_db.fecha.isoformat()
        }
        
        if True:
            # Enriquecer con detalles de productos
            compra_detallada = c.copy()
            items_detallados = []
            
            productos = cargar_productos()
            prod_map = {p["id"]: p for p in productos}
            
            for item in c.get("items", []):
                producto = prod_map.get(item["producto_id"], {})
                items_detallados.append({
                    "producto_id": item["producto_id"],
                    "cantidad": item["cantidad"],
                    "titulo": producto.get("titulo", "Producto no encontrado"),
                    "precio": producto.get("precio", 0),
                    "imagen": producto.get("imagen", ""),
                    "categoria": producto.get("categoria", ""),
                    "subtotal": producto.get("precio", 0) * item["cantidad"]
                })
            
            compra_detallada["items_detallados"] = items_detallados
            return compra_detallada
    raise HTTPException(status_code=404, detail="Compra no encontrada")
 
@app.post("/carrito/cancelar")
def cancelar_compra(auth_user: str = Depends(get_user_strict)):
    usuario = auth_user
    carrito[usuario] = []
    return {"mensaje": "Carrito vaciado"}

@app.post("/carrito/finalizar")
def finalizar_compra(payload: dict, auth_user: str = Depends(get_user_strict)):
    """
    payload debe contener al menos 'direccion' y 'tarjeta'.
    Se utiliza el usuario del token; si no hay token se devuelve 401.
    """
    usuario = auth_user
    direccion = payload.get("direccion")
    tarjeta = payload.get("tarjeta")
    if not direccion or not tarjeta:
        raise HTTPException(status_code=400, detail="Faltan datos de pago/envío")

    items = carrito.get(usuario, [])
    if not items:
        raise HTTPException(status_code=400, detail="Carrito vacío")

    # Calcular subtotal e IVA diferenciado (10% electrónicos, 21% otros)
    subtotal = 0
    iva_total = 0
    productos = cargar_productos()
    prod_map = {p["id"]: p for p in productos}
    for it in items:
        pid = it["producto_id"]
        cantidad = it.get("cantidad", 1)
        producto = prod_map.get(pid, {})
        precio = producto.get("precio", 0)
        categoria = producto.get("categoria", "").lower()
        
        item_subtotal = precio * cantidad
        subtotal += item_subtotal
        
        # Calcular IVA: 10% para electrónicos, 21% para otros
        if "electr" in categoria:
            iva_total += item_subtotal * 0.10
        else:
            iva_total += item_subtotal * 0.21

    # Costo de envío: gratis si (subtotal + IVA) > 1000, sino $50
    envio = 0 if (subtotal + iva_total) > 1000 else 50
    total = subtotal + iva_total + envio

    # ============================================================
    # DESCUENTO DE STOCK: Actualizar existencias en la base de datos
    # ============================================================
    with Session(engine) as session:
        for it in items:
            pid = it["producto_id"]
            cantidad = it.get("cantidad", 1)
            
            # Obtener el producto de la base de datos
            producto_db = session.get(Producto, pid)
            
            if producto_db:
                # Descontar la cantidad vendida del stock disponible
                producto_db.existencia -= cantidad
                
                # Agregar a la sesión para guardar cambios
                session.add(producto_db)
        
        # Confirmar todos los cambios de stock en la base de datos
        session.commit()
    # ============================================================

    # Crear registro de compra en la base de datos
    with Session(engine) as session:
        compra_db = Compra(
            usuario_email=usuario,
            items=json.dumps(items),  # Convertir lista a JSON string
            subtotal=subtotal,
            iva=iva_total,
            envio=envio,
            total=total,
            direccion=direccion,
            tarjeta=tarjeta
        )
        session.add(compra_db)
        session.commit()
        session.refresh(compra_db)
        new_id = compra_db.id

    # Vaciar carrito
    carrito[usuario] = []

    return {"compra_id": new_id, "mensaje": "Compra finalizada correctamente"}
# ----- ROOT -----
@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}

# ----- EJECUCIÓN LOCAL -----
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
