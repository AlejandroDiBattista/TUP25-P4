# from enunciados.tp6.backend import models
from fastapi import FastAPI, Depends, HTTPException, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
from pathlib import Path

from contextlib import asynccontextmanager
from database import create_db_and_tables, engine, get_session

from sqlmodel import Session, select, delete
from models.productos import Producto

from models.carrito import Carrito, CarritoItem
from models.schemas import CarritoRespuesta

# Se trae los "contratos" que se definieron
from models.schemas import (
    UsuarioRegistro,
    UsuarioRespuesta,
    UsuarioLogin,
    Token,
    ProductoRespuesta,
    CarritoRespuesta,
    CarritoItemRespuesta,
    CarritoAgregarProducto
)

# Se trae el modelo de la base de datos de Usuario
from models.usuarios import Usuario

# Se trae la función para hashear contraseñas
from security import (
    obtener_hash_contrasenia,
    verificar_contrasenia,
    crear_token_sesion,
    obtener_usuario_desde_token
)

#
from models.compras import Compra, ItemCompra
from models.schemas import (
    CompraFinalizar,
    CompraRespuesta,
    ItemCompraRespuesta
)

from typing import Optional

# Dependencia para obtener el usuario autenticado desde el token en la cookie
def get_usuario_actual(
    token: Optional[str] = Cookie(default=None),
    session: Session = Depends(get_session)
) -> Usuario:
    """Dependencia para obtener el usuario autenticado desde el token en la cookie."""
    if not token:
        # Si no hay token, no está autenticado
        raise HTTPException(
            status_code=401,
            detail="No autenticado."
        )

    # Se usa la función de seguridad para validar el token
    usuario = obtener_usuario_desde_token(token, session)

    if not usuario:
        # Si el token no es válido o expiró
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado."
        )

    # Se devuelve el usuario autenticado
    return usuario

# Dependencia del carrito
def get_carrito_actual(
    usuario_actual: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
) -> Carrito:
    """Dependencia para obtener el carrito del usuario autenticado."""
    # Se crea la consulta para buscar el carrito por usuario_id
    statement = select(Carrito).where(Carrito.usuario_id == usuario_actual.id)

    carrito = session.exec(statement).first()

    if not carrito:
        # Si no existe, se crea uno nuevo
        print(f"Usuario {usuario_actual.email} no tiene carrito. Creando uno...")
        nuevo_carrito = Carrito(usuario_id=usuario_actual.id)
        session.add(nuevo_carrito)
        session.commit()
        session.refresh(nuevo_carrito)
        return nuevo_carrito

    # Si existe, se devuelve
    return carrito

# Función lifespan para inicializar la base de datos al iniciar la aplicación
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("iniciando la aplicación...")
    print("Creando la base de datos y las tablas si no existen...")

    create_db_and_tables()

    print("Base de datos y tablas listas.")

    # Lógia para inicializar datos en la base de datos
    print("Verificando carga inicial de productos...")

    # Se abre una sesión con la base de datos
    with Session(engine) as session:
        # 1. Se verifica si hay productos en la base de datos
        # Se crea una consulta para seleccionar el primer producto
        statement = select(Producto).limit(1)

        # Se ejecuta la consulta
        primer_producto = session.exec(statement).first()

        # 2. Si no hay productos, se cargan desde el archivo JSON
        if primer_producto is None:
            print("La tabla 'producto' está vacía. Cargando datos desde productos.")

            # Ruta al JSON de productos
            ruta_productos = Path(__file__).parent / "productos.json"

            with open(ruta_productos, "r", encoding="utf-8") as archivo:
                datos_json = json.load(archivo)

                # 3. Iterar y crear modelos
                for item_json in datos_json:
                    # Se crea un objeto Producto de SQLModel
                    producto_a_crear = Producto(**item_json)

                    # 4. Se agrega a la sesión
                    session.add(producto_a_crear)

            # 5. Se guardan TODOS los productos en la base de datos
            session.commit()
            print(f"¡Éxito! Se cargaron {len(datos_json)} productos en la base de datos.")
        else:
            print("La tabla 'producto' ya tiene datos. No se realiza la carga inicial.")

    print("Servidor listo.")
    yield
    # Esto se ejecuta al apagar la aplicación
    print("Apagando la aplicación...")

# Se agrega el lifespan a la aplicación FastAPI
app = FastAPI(
    title="API de E-Commerce - TP6",
    lifespan=lifespan
)

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

@app.get("/")
def root():
    return {"mensaje": "API de Productos - use /productos para obtener el listado"}

@app.get("/productos", response_model=list[ProductoRespuesta])
def obtener_productos(
    session: Session = Depends(get_session),
    categoria: Optional[str] = None,
    busqueda: Optional[str] = None
):
    # Se crea la consulta base
    statement = select(Producto)

    # Filtros opcionales
    if categoria:
        statement = statement.where(Producto.categoria == categoria)
    
    if busqueda:
        statement = statement.where(
            (Producto.titulo.ilike(f"%{busqueda}%")) |
            (Producto.descripcion.ilike(f"%{busqueda}%"))
        )

    # Se ejecuta la consulta
    productos = session.exec(statement).all()

    # Se devuelve la lista de productos
    return productos

@app.get("/productos/{id}", response_model=ProductoRespuesta)
def obtener_producto_por_id(
    id: int,
    session: Session = Depends(get_session)
):
    # Se busca el producto por ID
    producto = session.get(Producto, id)

    # Se valida que exista
    if not producto:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado."
        )

    # Se devuelve el producto encontrado
    return producto

@app.post("/registrar", response_model=UsuarioRespuesta)
def registrar_usuario(usuario_data: UsuarioRegistro, session: Session = Depends(get_session)):
    # 1. Verificar si el usuario ya existe
    statement = select(Usuario).where(Usuario.email == usuario_data.email)
    usuario_existente = session.exec(statement).first()

    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado."
        )

    # 2. Hashear la contraseña
    hash_contrasenia = obtener_hash_contrasenia(usuario_data.contrasenia)

    # 3. Crear el nuevo usuario en la base de datos
    nuevo_usuario = Usuario(
        nombre=usuario_data.nombre,
        email=usuario_data.email,
        contrasenia=hash_contrasenia
    )

    # 4. Guardar en la base de datos
    session.add(nuevo_usuario)
    session.commit()
    # Se refresca para obtener el ID generado
    session.refresh(nuevo_usuario)

    # 5. Devolver la respuesta
    return nuevo_usuario

@app.post("/iniciar-sesion", response_model=Token)
def iniciar_sesion(
    from_data: UsuarioLogin,
    response: Response,
    session: Session = Depends(get_session)
):
    # 1. Buscar el usuario por email
    statement = select(Usuario).where(Usuario.email == from_data.email)
    usuario = session.exec(statement).first()

    # 2. Verificar que el usuario exista y la contraseña sea correcta
    if not usuario or not verificar_contrasenia(from_data.contrasenia, usuario.contrasenia):
        raise HTTPException(
            status_code=401,
            detail="Credenciales inválidas."
        )

    # 3. Crear un token de sesión
    token, expiracion = crear_token_sesion()

    # 4. Guardar el token y su expiración en la base de datos
    usuario.token = token
    usuario.token_expiration = expiracion
    session.add(usuario)
    session.commit()

    # 5. Enviar el token como una cookie
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="none",
        secure=True,
        expires=expiracion
    )

    # Se devuelve el token también en el JSON
    return Token(access_token=token)

@app.get("/perfil", response_model=UsuarioRespuesta)
def obtener_perfil(usuario_actual: Usuario = Depends(get_usuario_actual)):
    """Endpoint para obtener el perfil del usuario autenticado."""
    return usuario_actual

@app.post("/cerrar-sesion")
def cerrar_sesion(
    response: Response,
    usuario_actual: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    """Endpoint para cerrar sesión del usuario autenticado."""
    # Se elimina el token del usuario
    usuario_actual.token = None
    usuario_actual.token_expiration = None
    session.add(usuario_actual)
    session.commit()

    # Se elimina la cookie del token
    response.delete_cookie(
        key="token",
        samesite="none",
        secure=True
    )

    return {"mensaje": "Sesión cerrada correctamente."}

@app.get("/carrito", response_model=CarritoRespuesta)
def obtener_carrito(carrito_actual: Carrito = Depends(get_carrito_actual)):
    """Endpoint para obtener el carrito del usuario autenticado."""
    return carrito_actual

@app.post("/carrito", response_model=CarritoRespuesta)
def agregar_al_carrito(
    datos_item: CarritoAgregarProducto,
    carrito_actual: Carrito = Depends(get_carrito_actual),
    session: Session = Depends(get_session)
):
    """Endpoint para agregar un producto al carrito del usuario autenticado."""
    # Validar que el producto exista y tenga stock
    producto = session.get(Producto, datos_item.producto_id)

    if not producto:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado."
        )
    
    if producto.existencia < datos_item.cantidad:
        raise HTTPException(
            status_code=400,
            detail="Stock insuficiente."
        )
    
    # Borrar si el item ya existe en el carrito
    item_existente = None

    # Verificar si el producto ya está en el carrito
    for item in carrito_actual.items:
        if item.producto_id == datos_item.producto_id:
            item_existente = item
            break

    # 
    if item_existente:
        # Si ya está, validar que la suma no supere el stock disponible
        if item_existente.cantidad + datos_item.cantidad > producto.existencia:
            raise HTTPException(
                status_code=400,
                detail="Stock insuficiente."
            )

        # Si ya está, actualizar la cantidad
        item_existente.cantidad += datos_item.cantidad
        session.add(item_existente)
    else:
        # Si no está, crear un nuevo CarritoItem
        nuevo_item = CarritoItem(
            carrito_id=carrito_actual.id,
            producto_id=datos_item.producto_id,
            cantidad=datos_item.cantidad
        )
        session.add(nuevo_item)

    # Se guardan los cambios y se devuelve el carrito actualizado
    session.commit()
    # Se refresca el carrito para obtener los items actualizados
    session.refresh(carrito_actual)

    return carrito_actual

@app.delete("/carrito/{producto_id}", response_model=CarritoRespuesta)
def quitar_del_carrito(
    producto_id: int,
    carrito_actual: Carrito = Depends(get_carrito_actual),
    session: Session = Depends(get_session)
):
    """Endpoint para quitar un producto del carrito del usuario autenticado."""
    # Buscar el item que coincida con el carrito y el producto
    statement = select(CarritoItem).where(
        CarritoItem.carrito_id == carrito_actual.id,
        CarritoItem.producto_id == producto_id
    )
    item_a_eliminar = session.exec(statement).first()

    # Se valida que exista el item
    if not item_a_eliminar:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado en el carrito."
        )
    
    # Se elimina el item
    session.delete(item_a_eliminar)
    session.commit()

    # Se devuelve el carrito actualizado
    session.refresh(carrito_actual)
    return carrito_actual

@app.post("/carrito/finalizar", response_model=CompraRespuesta)
def finalizar_compra(
    datos_compra: CompraFinalizar,
    carrito_actual: Carrito = Depends(get_carrito_actual),
    usuario_actual: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    """Endpoint para finalizar la compra del carrito del usuario autenticado."""
    # Se valida que el carrito no esté vacío
    if not carrito_actual.items:
        raise HTTPException(
            status_code=400,
            detail="El carrito está vacío."
        )
    
    subtotal = 0.0
    total_iva = 0.0

    # Se calculan totales y se verifica stock
    for item in carrito_actual.items:
        producto = item.producto

        # Se valida el stock
        if producto.existencia < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {producto.titulo}."
            )
        
        # Se calcula el subtotal
        item_total = producto.precio * item.cantidad
        subtotal += item_total

        # Se calcula el IVA
        if producto.categoria.lower() == 'electrónica':
            total_iva += item_total * 0.10
        else:
            total_iva += item_total * 0.21

    # Se calcula envío y total final
    costo_envio = 0
    if 0 < subtotal < 1000:
        costo_envio = 50.0

    total_final = subtotal + total_iva + costo_envio

    # Se crea la compra y se ocultan los datos de la tarjeta
    tarjeta_oculta = f"xxxx-xxxx-xxxx-{datos_compra.tarjeta[-4:]}"

    nueva_compra = Compra(
        usuario_id=usuario_actual.id,
        direccion=datos_compra.direccion,
        tarjeta=tarjeta_oculta,
        total=total_final,
        envio=costo_envio,
        iva=total_iva
    )
    session.add(nueva_compra)
    session.commit()
    session.refresh(nueva_compra)

    # Se mueven los items y se actualiza el stock
    for item in carrito_actual.items:
        # Se crea el ItemCompra "congelado"
        item_compra_nuevo = ItemCompra(
            compra_id=nueva_compra.id,
            producto_id=item.producto.id,
            nombre=item.producto.titulo,
            cantidad=item.cantidad,
            precio_unitario=item.producto.precio
        )
        session.add(item_compra_nuevo)

        # Se actualiza el stock del producto
        item.producto.existencia -= item.cantidad
        session.add(item.producto)

    # Se vacía el carrito
    statement_vaciar = delete(CarritoItem).where(
        CarritoItem.carrito_id == carrito_actual.id
    )
    session.exec(statement_vaciar)

    # Se guardan todos los cambios
    session.commit()
    session.refresh(nueva_compra)

    return nueva_compra

@app.post("/carrito/cancelar", response_model=CarritoRespuesta)
def vaciar_carrito(
    carrito_actual: Carrito = Depends(get_carrito_actual),
    session: Session = Depends(get_session)
):
    """Endpoint para vaciar el carrito del usuario autenticado."""
    # Se eliminan todos los items del carrito
    statement_vaciar = delete(CarritoItem).where(
        CarritoItem.carrito_id == carrito_actual.id
    )

    # Se ejecuta el borrado
    session.exec(statement_vaciar)
    session.commit()

    # Se refresca el carrito
    session.refresh(carrito_actual)

    return carrito_actual

@app.get("/compras", response_model=list[CompraRespuesta])
def obtener_historial_compras(
    usuario_actual: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    """Endpoint para obtener el historial de compras del usuario autenticado."""
    # Se crea la consulta para obtener las compras del usuario
    statement = select(Compra).where(
        Compra.usuario_id == usuario_actual.id
    )

    # Se ordenan por fecha de la más nueva a la más vieja
    statement = statement.order_by(Compra.fecha.desc())

    compras = session.exec(statement).all()

    # Se devuelve la lista de compras
    return compras

@app.get("/compras/{id}", response_model=CompraRespuesta)
def obtener_detalle_compra(
    id: int,
    usuario_actual: Usuario = Depends(get_usuario_actual),
    session: Session = Depends(get_session)
):
    """Endpoint para obtener el detalle de una compra específica del usuario autenticado."""
    # Se busca la compra por ID
    compra = session.get(Compra, id)

    # Se valida que la compra exista
    if not compra:
        raise HTTPException(
            status_code=404,
            detail="Compra no encontrada."
        )
    
    # Se valida que la compra pertenezca al usuario autenticado
    if compra.usuario_id != usuario_actual.id:
        raise HTTPException(
            status_code=403,
            detail="No autorizado para ver esta compra."
        )

    # Se devuelve la compra encontrada
    return compra

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
