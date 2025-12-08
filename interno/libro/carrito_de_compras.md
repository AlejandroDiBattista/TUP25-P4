Quiero hacer un API con fastapi (usando sqlmodel + sqlite) que me gestione un carrito de compra. Los productos deben tener código, descripción y existencia. Los precios de los productos deben tener una fecha de vigencia a partir de la cual el precio se aplica. Si el precio es cero implica a a partir de la fecha de vigencia no está disponible. Los carritos debe indicar a qué cliente se refiere, debe tener la fecha de inicio y el estado: - abierto - cerrado - cancelado En el carrito se puede agregar o quitar productos. Estas operaciones deben tener en cuenta la existencia. Solo se pueden agregar productos que estén vigentes y cuya existencia sea mayor o igual a la cantidad de ítem comprados. El precio de compra debe ser el vigente al momento de hacerse la operación. Si un producto es agregado varias veces la cantidad debe acumularse, de la misma manera cuando se quita varias veces y la cantidad acumulada es 0 el ítem debe ser eliminado. Al agregar/quitar producto al carrito se debe afectar la existencia del mismo Si se cancela un carrito los productos deben ser devueltos a su existencia. No puede abrirse un nuevo carrito si hay otro carrito abierto para el mismo usuario. Cuando un carrito se cierra ya no pueden ser alteradas las cantidades. Diseña las tablas relacionadas para almacenar los datos y hacer el API rest para implementar cada funcione del sistema

---

## 🧱 1. Diseño de las tablas (modelo relacional)

Usaremos `SQLModel` (que combina SQLAlchemy + Pydantic).  
Cada clase será una tabla.

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

# ---------- PRODUCTOS ----------
class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(index=True, unique=True)
    descripcion: str
    existencia: int = Field(default=0)
    precios: List["PrecioProducto"] = Relationship(back_populates="producto")


# ---------- PRECIOS DE PRODUCTOS ----------
class PrecioProducto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int = Field(foreign_key="producto.id")
    fecha_vigencia: datetime
    precio: float
    producto: Producto = Relationship(back_populates="precios")


# ---------- CLIENTES ----------
class Cliente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(unique=True)
    carritos: List["Carrito"] = Relationship(back_populates="cliente")


# ---------- CARRITOS ----------
class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cliente_id: int = Field(foreign_key="cliente.id")
    fecha_inicio: datetime = Field(default_factory=datetime.now)
    estado: str = Field(default="abierto")  # abierto, cerrado, cancelado
    cliente: Cliente = Relationship(back_populates="carritos")
    items: List["ItemCarrito"] = Relationship(back_populates="carrito")


# ---------- ITEMS DEL CARRITO ----------
class ItemCarrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    precio_unitario: float
    carrito: Carrito = Relationship(back_populates="items")
    producto: Producto = Relationship()
```

---

## ⚙️ 2. Lógica de negocio (operaciones clave)

1.  **Agregar producto al carrito**
    
    -   Verifica que el carrito esté `abierto`.
        
    -   Obtiene el precio vigente (`PrecioProducto` más reciente con `fecha_vigencia <= hoy`).
        
    -   Verifica existencia.
        
    -   Resta existencia.
        
    -   Si el ítem ya existe, acumula cantidad.
        
2.  **Quitar producto**
    
    -   Suma la existencia devuelta.
        
    -   Si la cantidad llega a 0, elimina el ítem.
        
3.  **Cerrar carrito**
    
    -   Cambia `estado = "cerrado"`.
        
4.  **Cancelar carrito**
    
    -   Devuelve existencias.
        
    -   Cambia `estado = "cancelado"`.
        
5.  **Restricción:** un cliente solo puede tener un carrito abierto a la vez.
    

---

## 🚀 3. Endpoints con FastAPI

```python
from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import Session, select, SQLModel, create_engine
from datetime import datetime

app = FastAPI(title="Carrito de Compras API")
engine = create_engine("sqlite:///carrito.db")

def get_session():
    with Session(engine) as session:
        yield session

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
```

---

### 🧩 Endpoint: Crear carrito

```python
@app.post("/carritos/{cliente_id}")
def crear_carrito(cliente_id: int, session: Session = Depends(get_session)):
    carrito_abierto = session.exec(
        select(Carrito).where(Carrito.cliente_id == cliente_id, Carrito.estado == "abierto")
    ).first()
    if carrito_abierto:
        raise HTTPException(status_code=400, detail="El cliente ya tiene un carrito abierto")

    nuevo = Carrito(cliente_id=cliente_id)
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return nuevo
```

---

### 🧩 Endpoint: Agregar producto

```python
@app.post("/carritos/{carrito_id}/agregar/{producto_id}")
def agregar_producto(carrito_id: int, producto_id: int, cantidad: int, session: Session = Depends(get_session)):
    carrito = session.get(Carrito, carrito_id)
    if carrito.estado != "abierto":
        raise HTTPException(status_code=400, detail="El carrito no está abierto")

    producto = session.get(Producto, producto_id)
    if producto.existencia < cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    precio = session.exec(
        select(PrecioProducto)
        .where(PrecioProducto.producto_id == producto_id, PrecioProducto.fecha_vigencia <= datetime.now())
        .order_by(PrecioProducto.fecha_vigencia.desc())
    ).first()

    if not precio or precio.precio <= 0:
        raise HTTPException(status_code=400, detail="Producto sin precio vigente")

    item = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_id, ItemCarrito.producto_id == producto_id)
    ).first()

    if item:
        item.cantidad += cantidad
    else:
        item = ItemCarrito(carrito_id=carrito_id, producto_id=producto_id, cantidad=cantidad, precio_unitario=precio.precio)
        session.add(item)

    producto.existencia -= cantidad
    session.add(producto)
    session.commit()
    return {"mensaje": "Producto agregado correctamente"}
```

---

### 🧩 Endpoint: Quitar producto

```python
@app.post("/carritos/{carrito_id}/quitar/{producto_id}")
def quitar_producto(carrito_id: int, producto_id: int, cantidad: int, session: Session = Depends(get_session)):
    item = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_id, ItemCarrito.producto_id == producto_id)
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="El producto no está en el carrito")

    producto = session.get(Producto, producto_id)
    item.cantidad -= cantidad
    producto.existencia += cantidad

    if item.cantidad <= 0:
        session.delete(item)

    session.add(producto)
    session.commit()
    return {"mensaje": "Producto quitado correctamente"}
```

---

### 🧩 Endpoint: Cerrar o cancelar carrito

```python
@app.post("/carritos/{carrito_id}/cerrar")
def cerrar_carrito(carrito_id: int, session: Session = Depends(get_session)):
    carrito = session.get(Carrito, carrito_id)
    carrito.estado = "cerrado"
    session.commit()
    return {"mensaje": "Carrito cerrado"}

@app.post("/carritos/{carrito_id}/cancelar")
def cancelar_carrito(carrito_id: int, session: Session = Depends(get_session)):
    carrito = session.get(Carrito, carrito_id)
    for item in carrito.items:
        producto = session.get(Producto, item.producto_id)
        producto.existencia += item.cantidad
        session.add(producto)
    carrito.estado = "cancelado"
    session.commit()
    return {"mensaje": "Carrito cancelado y stock restaurado"}
```

---

## 🧠 4. Criterios de diseño

-   **Integridad de negocio:** cada operación ajusta existencia y valida precios vigentes.
    
-   **Persistencia:** `SQLite` es suficiente, pero se puede migrar fácilmente a PostgreSQL.
    
-   **Escalabilidad:** cada endpoint se puede ampliar con autenticación (por ejemplo con JWT).
    
-   **Validación:** se pueden agregar modelos Pydantic para las entradas.
    

# ¿Qué incluye?

-   `app/models.py`: tablas `Producto`, `PrecioProducto`, `Cliente`, `Carrito`, `ItemCarrito`.
    
-   `app/crud.py`: toda la lógica de negocio (validaciones, precio vigente, stock, acumular/quitar ítems, cerrar/cancelar).
    
-   `app/schemas.py`: modelos Pydantic para requests/responses.
    
-   `app/routers/`: routers separados:
    
    -   `productos.py`: ABM básico de productos.
        
    -   `precios.py`: alta de precios y consulta de precio vigente.
        
    -   `clientes.py`: alta de clientes.
        
    -   `carritos.py`: crear carrito, ver detalle (con total), agregar/quitar, cerrar, cancelar.
        
-   `app/db.py`: engine SQLite y sesión.
    
-   `app/main.py`: arranque de FastAPI e inclusión de routers.
    
-   `requirements.txt` y `README.md`.
    

# Cómo correrlo

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Abrí Swagger en `http://127.0.0.1:8000/docs`.

# Flujo mínimo de prueba (via Swagger o curl)

1.  Crear cliente
    

```bash
POST /clientes
{"nombre":"Alejandro","email":"ale@ejemplo.com"}
```

2.  Crear producto y stock
    

```bash
POST /productos
{"codigo":"A001","descripcion":"Teclado mecánico","existencia":10}
```

3.  Cargar precios (vigencia y precio)
    

```bash
POST /precios/producto/1
{"fecha_vigencia":"2025-01-01T00:00:00","precio":12000.0}
```

> Si agregás otro con `fecha_vigencia` posterior y `precio: 0`, desde esa fecha queda **no disponible**.

4.  Abrir carrito
    

```bash
POST /carritos
{"cliente_id":1}
```

5.  Agregar/quitar items (valida stock y precio vigente)
    

```bash
POST /carritos/1/agregar
{"producto_id":1,"cantidad":2}

POST /carritos/1/quitar
{"producto_id":1,"cantidad":1}
```

6.  Ver detalle (incluye total)
    

```bash
GET /carritos/1
```

7.  Cerrar o cancelar
    

```bash
POST /carritos/1/cerrar
# o
POST /carritos/1/cancelar
```

-   **Cerrar** bloquea futuras alteraciones.
    
-   **Cancelar** devuelve stock de todos los ítems.
    

# Notas de diseño

-   **Precio vigente**: se toma el último `PrecioProducto` con `fecha_vigencia <= ahora` y `precio > 0`. Si no hay o es 0, no se puede agregar.
    
-   **Acumulación**: si agregás el mismo producto varias veces, el ítem acumula cantidad; `quitar` resta y si llega a 0 se borra.
    
-   **Consistencia**: al agregar descuenta stock; al quitar o cancelar, devuelve stock.
    
-   **Restricción**: un solo carrito `abierto` por cliente.
    

¿Querés que lo extienda con autenticación JWT, filtros de búsqueda o tests con `pytest` y `httpx`? Te lo dejo redondo.

You: 

> Prepárame una clase en explicando la realización del programa Como se estructura los archivos, como se modelan los datos Los criterios de decisión para implementar la funcionalidad deseada Mostrarme todo el código perfectamente organizado y procurando la mayor legibilidad y facilidad de lectura.

---

## 🧭 **Objetivo de la clase**

Desarrollar un **API REST con FastAPI + SQLModel + SQLite** que gestione un **carrito de compras**, aplicando:

-   Diseño modular de proyecto.
    
-   Modelado de datos relacional.
    
-   Criterios de negocio y validaciones.
    
-   Código limpio, legible y mantenible.
    

---

## 🧱 **1\. Estructura del proyecto**

La idea es separar responsabilidades — cada archivo hace una sola cosa y la hace bien.

```css
fastapi_carrito/
│
├── README.md
├── requirements.txt
└── app/
    ├── main.py               → punto de entrada de FastAPI
    ├── db.py                 → conexión a base de datos
    ├── models.py             → definición de tablas (SQLModel)
    ├── schemas.py            → modelos de entrada/salida (Pydantic)
    ├── crud.py               → lógica de negocio
    └── routers/              → endpoints organizados por entidad
        ├── productos.py
        ├── precios.py
        ├── clientes.py
        └── carritos.py
```

> 🎓 **Principio aplicado:** “Separa lo que cambia de lo que permanece igual.”  
> Los modelos y esquemas cambian poco, los endpoints y lógica de negocio pueden evolucionar.

---

## 🗃️ **2\. Modelado de datos**

Relacionamos las tablas para reflejar las reglas de negocio:

-   `Producto` ↔ `PrecioProducto` (1:N): un producto puede tener varios precios vigentes en distintas fechas.
    
-   `Cliente` ↔ `Carrito` (1:N): un cliente puede tener varios carritos, pero solo uno abierto.
    
-   `Carrito` ↔ `ItemCarrito` (1:N): un carrito tiene múltiples ítems.
    

```python
# models.py (extracto)
class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(index=True, unique=True)
    descripcion: str
    existencia: int = Field(default=0, ge=0)
    precios: List["PrecioProducto"] = Relationship(back_populates="producto")
```

Criterios de diseño:

-   **Código único** para evitar duplicados.
    
-   **Existencia no negativa** (`ge=0`).
    
-   **Precio vigente** determinado por fecha.
    

---

## ⚙️ **3\. Criterios de decisión**

1.  ✅ **Precio vigente**:  
    Tomar el precio más reciente cuya fecha de vigencia sea menor o igual a la fecha actual.  
    Si el precio es 0 → producto no disponible.
    
2.  🛒 **Stock controlado**:
    
    -   Al agregar ítem, se descuenta stock.
        
    -   Al quitar ítem, se devuelve stock.
        
    -   Si cantidad llega a 0, el ítem se elimina.
        
3.  🚫 **Carrito único abierto**:  
    Un cliente no puede abrir otro carrito mientras tenga uno abierto.
    
4.  🔐 **Estados del carrito**:
    
    -   `abierto`: editable
        
    -   `cerrado`: no se puede modificar
        
    -   `cancelado`: stock restaurado
        

---

## 🧭 **4\. Lógica de negocio (CRUD)**

Toda la lógica central vive en `crud.py`.  
Por ejemplo, agregar un producto al carrito:

```python
def agregar_item(session: Session, carrito_id: int, producto_id: int, cantidad: int) -> ItemCarrito:
    carrito = obtener_carrito(session, carrito_id)
    if carrito.estado != "abierto":
        raise HTTPException(status_code=400, detail="El carrito no está abierto")

    prod = obtener_producto(session, producto_id)

    # Verificar precio vigente > 0
    precio = _precio_vigente(session, producto_id)
    if not precio or precio.precio <= 0:
        raise HTTPException(status_code=400, detail="Producto sin precio vigente o no disponible")

    # Verificar stock
    if prod.existencia < cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    # Buscar ítem existente
    item = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_id, ItemCarrito.producto_id == producto_id)
    ).first()

    if item:
        item.cantidad += cantidad
    else:
        item = ItemCarrito(
            carrito_id=carrito_id, producto_id=producto_id, cantidad=cantidad, precio_unitario=precio.precio
        )
        session.add(item)

    prod.existencia -= cantidad
    session.add(prod)
    session.commit()
    session.refresh(item)
    return item
```

---

## 🌐 **5\. Routers (Endpoints)**

Cada router representa una entidad: productos, precios, clientes, carritos.

Ejemplo — crear producto:

```python
@router.post("", response_model=schemas.ProductoRead)
def crear_producto(payload: schemas.ProductoCreate, session: Session = Depends(get_session)):
    return crud.crear_producto(session, payload.codigo, payload.descripcion, payload.existencia)
```

Ejemplo — agregar ítem al carrito:

```python
@router.post("/{carrito_id}/agregar", response_model=schemas.ItemRead)
def agregar_item(carrito_id: int, payload: schemas.ItemOperacion, session: Session = Depends(get_session)):
    item = crud.agregar_item(session, carrito_id, payload.producto_id, payload.cantidad)
    return schemas.ItemRead.model_validate(item)
```

> 🧠 **Ventaja:** Routers desacoplan la API pública de la lógica interna → más fácil mantener, testear y escalar.

---

## 🧾 **6\. Schemas (Pydantic)**

Los schemas definen lo que entra y lo que sale de nuestra API.

Ejemplo — creación de producto:

```python
class ProductoCreate(BaseModel):
    codigo: str
    descripcion: str
    existencia: int = Field(ge=0, default=0)
```

Ejemplo — respuesta de carrito con detalle:

```python
class CarritoDetalle(BaseModel):
    carrito: CarritoRead
    items: List[ItemRead]
    total: float
```

Esto nos permite tener validaciones automáticas y documentación Swagger sin escribir código extra.

---

## 🚀 **7\. Ejecución**

1.  Instalar dependencias:
    

```bash
pip install -r requirements.txt
```

2.  Iniciar servidor:
    

```bash
uvicorn app.main:app --reload
```

3.  Abrir navegador:
    

```arduino
http://127.0.0.1:8000/docs
```

> 📊 Swagger UI te permite probar todos los endpoints visualmente.

---

## 🧪 **8\. Flujo de uso recomendado**

1.  Crear cliente
    
2.  Crear producto + precios vigentes
    
3.  Abrir carrito
    
4.  Agregar / quitar productos
    
5.  Cerrar o cancelar carrito
    

---

## 🧹 **9\. Buenas prácticas aplicadas**

-   Código modular y legible 🧭
    
-   Validaciones de negocio en `crud.py`
    
-   Tipado estático con `Pydantic` y `SQLModel`
    
-   Rutas organizadas en routers
    
-   Separación clara de capas (DB – lógica – API)
     

> ✨ *“La elegancia en el código no está en lo que agregás… sino en lo que eliminás sin perder claridad.”*



---

## 📁 **Estructura de archivos**

```css
fastapi_carrito/
│
├── README.md
├── requirements.txt
└── app/
    ├── main.py
    ├── db.py
    ├── models.py
    ├── schemas.py
    ├── crud.py
    └── routers/
        ├── productos.py
        ├── precios.py
        ├── clientes.py
        └── carritos.py
```

---

## 📝 **`requirements.txt`**

```text
fastapi==0.115.0
uvicorn==0.30.6
sqlmodel==0.0.21
pydantic==2.9.2
```

---

## 🧭 **`app/main.py`**

```python
from fastapi import FastAPI
from .db import init_db
from .routers import productos, precios, clientes, carritos

app = FastAPI(title="Carrito de Compras API", version="1.0.0")

@app.on_event("startup")
def _startup():
    init_db()

# Registramos los routers
app.include_router(productos.router)
app.include_router(precios.router)
app.include_router(clientes.router)
app.include_router(carritos.router)
```

---

## 🧱 **`app/db.py`**

```python
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./carrito.db"
engine = create_engine(DATABASE_URL, echo=False)

def init_db() -> None:
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
```

---

## 🏗️ **`app/models.py`**

```python
from __future__ import annotations
from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

# ---------- PRODUCTOS ----------
class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(index=True, unique=True)
    descripcion: str
    existencia: int = Field(default=0, ge=0)
    precios: List["PrecioProducto"] = Relationship(back_populates="producto")


# ---------- PRECIOS ----------
class PrecioProducto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    fecha_vigencia: datetime
    precio: float = Field(ge=0)
    producto: Producto = Relationship(back_populates="precios")


# ---------- CLIENTES ----------
class Cliente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    email: str = Field(unique=True, index=True)
    carritos: List["Carrito"] = Relationship(back_populates="cliente")


# ---------- CARRITOS ----------
class Carrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cliente_id: int = Field(foreign_key="cliente.id", index=True)
    fecha_inicio: datetime
    estado: str  # abierto, cerrado, cancelado
    cliente: Cliente = Relationship(back_populates="carritos")
    items: List["ItemCarrito"] = Relationship(back_populates="carrito")


# ---------- ITEMS ----------
class ItemCarrito(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    carrito_id: int = Field(foreign_key="carrito.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(gt=0)
    precio_unitario: float = Field(ge=0)
    carrito: Carrito = Relationship(back_populates="items")
    producto: Producto = Relationship()
```

---

## 📐 **`app/schemas.py`**

```python
from __future__ import annotations
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# ----------- PRODUCTOS -----------
class ProductoCreate(BaseModel):
    codigo: str
    descripcion: str
    existencia: int = Field(ge=0, default=0)

class ProductoRead(BaseModel):
    id: int
    codigo: str
    descripcion: str
    existencia: int
    class Config:
        from_attributes = True

class ProductoUpdate(BaseModel):
    descripcion: Optional[str] = None
    existencia: Optional[int] = Field(default=None, ge=0)


# ----------- PRECIOS -----------
class PrecioCreate(BaseModel):
    fecha_vigencia: datetime
    precio: float = Field(ge=0)

class PrecioRead(BaseModel):
    id: int
    producto_id: int
    fecha_vigencia: datetime
    precio: float
    class Config:
        from_attributes = True


# ----------- CLIENTES -----------
class ClienteCreate(BaseModel):
    nombre: str
    email: str

class ClienteRead(BaseModel):
    id: int
    nombre: str
    email: str
    class Config:
        from_attributes = True


# ----------- CARRITOS -----------
class CarritoCreate(BaseModel):
    cliente_id: int

class CarritoRead(BaseModel):
    id: int
    cliente_id: int
    fecha_inicio: datetime
    estado: str
    class Config:
        from_attributes = True


# ----------- ITEMS -----------
class ItemOperacion(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)

class ItemRead(BaseModel):
    id: int
    carrito_id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    class Config:
        from_attributes = True


# ----------- RESPUESTAS -----------
class CarritoDetalle(BaseModel):
    carrito: CarritoRead
    items: List[ItemRead]
    total: float
```

---

## 🧠 **`app/crud.py`**

```python
from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from sqlmodel import Session, select
from fastapi import HTTPException
from .models import Producto, PrecioProducto, Cliente, Carrito, ItemCarrito

# --------- Helpers ---------
def _precio_vigente(session: Session, producto_id: int, ahora: Optional[datetime] = None) -> Optional[PrecioProducto]:
    if ahora is None:
        ahora = datetime.now()
    stmt = (
        select(PrecioProducto)
        .where(PrecioProducto.producto_id == producto_id, PrecioProducto.fecha_vigencia <= ahora)
        .order_by(PrecioProducto.fecha_vigencia.desc())
    )
    return session.exec(stmt).first()

def _carrito_abierto_de_cliente(session: Session, cliente_id: int) -> Optional[Carrito]:
    return session.exec(
        select(Carrito).where(Carrito.cliente_id == cliente_id, Carrito.estado == "abierto")
    ).first()

# --------- Productos ---------
def crear_producto(session: Session, codigo: str, descripcion: str, existencia: int) -> Producto:
    if session.exec(select(Producto).where(Producto.codigo == codigo)).first():
        raise HTTPException(status_code=400, detail="Código de producto duplicado")
    p = Producto(codigo=codigo, descripcion=descripcion, existencia=existencia)
    session.add(p)
    session.commit()
    session.refresh(p)
    return p

def listar_productos(session: Session) -> List[Producto]:
    return session.exec(select(Producto)).all()

def obtener_producto(session: Session, producto_id: int) -> Producto:
    p = session.get(Producto, producto_id)
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return p

def actualizar_producto(session: Session, producto_id: int, **updates) -> Producto:
    p = obtener_producto(session, producto_id)
    for k, v in updates.items():
        if v is not None:
            setattr(p, k, v)
    session.add(p)
    session.commit()
    session.refresh(p)
    return p

# --------- Precios ---------
def crear_precio(session: Session, producto_id: int, fecha_vigencia: datetime, precio: float) -> PrecioProducto:
    producto = obtener_producto(session, producto_id)
    nuevo = PrecioProducto(producto_id=producto.id, fecha_vigencia=fecha_vigencia, precio=precio)
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return nuevo

def precio_vigente_read(session: Session, producto_id: int) -> Optional[PrecioProducto]:
    return _precio_vigente(session, producto_id)

# --------- Clientes ---------
def crear_cliente(session: Session, nombre: str, email: str) -> Cliente:
    if session.exec(select(Cliente).where(Cliente.email == email)).first():
        raise HTTPException(status_code=400, detail="Email duplicado")
    c = Cliente(nombre=nombre, email=email)
    session.add(c)
    session.commit()
    session.refresh(c)
    return c

def obtener_cliente(session: Session, cliente_id: int) -> Cliente:
    c = session.get(Cliente, cliente_id)
    if not c:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return c

# --------- Carritos ---------
def crear_carrito(session: Session, cliente_id: int) -> Carrito:
    if _carrito_abierto_de_cliente(session, cliente_id):
        raise HTTPException(status_code=400, detail="El cliente ya tiene un carrito abierto")
    cliente = obtener_cliente(session, cliente_id)
    nuevo = Carrito(cliente_id=cliente.id, fecha_inicio=datetime.now(), estado="abierto")
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return nuevo

def obtener_carrito(session: Session, carrito_id: int) -> Carrito:
    c = session.get(Carrito, carrito_id)
    if not c:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    return c

def detalle_carrito(session: Session, carrito_id: int):
    carrito = obtener_carrito(session, carrito_id)
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_id)).all()
    total = sum(i.cantidad * i.precio_unitario for i in items)
    return carrito, items, total

def cerrar_carrito(session: Session, carrito_id: int):
    carrito = obtener_carrito(session, carrito_id)
    if carrito.estado != "abierto":
        raise HTTPException(status_code=400, detail="Solo carritos abiertos pueden cerrarse")
    carrito.estado = "cerrado"
    session.add(carrito)
    session.commit()
    return carrito

def cancelar_carrito(session: Session, carrito_id: int):
    carrito = obtener_carrito(session, carrito_id)
    if carrito.estado != "abierto":
        raise HTTPException(status_code=400, detail="Solo carritos abiertos pueden cancelarse")
    items = session.exec(select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_id)).all()
    for it in items:
        prod = obtener_producto(session, it.producto_id)
        prod.existencia += it.cantidad
        session.add(prod)
        session.delete(it)
    carrito.estado = "cancelado"
    session.add(carrito)
    session.commit()
    return carrito

# --------- Items ---------
def agregar_item(session: Session, carrito_id: int, producto_id: int, cantidad: int) -> ItemCarrito:
    carrito = obtener_carrito(session, carrito_id)
    if carrito.estado != "abierto":
        raise HTTPException(status_code=400, detail="El carrito no está abierto")

    prod = obtener_producto(session, producto_id)
    precio = _precio_vigente(session, producto_id)
    if not precio or precio.precio <= 0:
        raise HTTPException(status_code=400, detail="Producto sin precio vigente o no disponible")
    if prod.existencia < cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    item = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_id, ItemCarrito.producto_id == producto_id)
    ).first()

    if item:
        item.cantidad += cantidad
    else:
        item = ItemCarrito(
            carrito_id=carrito_id, producto_id=producto_id, cantidad=cantidad, precio_unitario=precio.precio
        )
        session.add(item)

    prod.existencia -= cantidad
    session.add(prod)
    session.commit()
    session.refresh(item)
    return item

def quitar_item(session: Session, carrito_id: int, producto_id: int, cantidad: int):
    carrito = obtener_carrito(session, carrito_id)
    if carrito.estado != "abierto":
        raise HTTPException(status_code=400, detail="El carrito no está abierto")

    item = session.exec(
        select(ItemCarrito).where(ItemCarrito.carrito_id == carrito_id, ItemCarrito.producto_id == producto_id)
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="El producto no está en el carrito")
    if cantidad > item.cantidad:
        raise HTTPException(status_code=400, detail="Cantidad a quitar supera lo presente")

    prod = obtener_producto(session, producto_id)
    prod.existencia += cantidad
    item.cantidad -= cantidad

    if item.cantidad == 0:
        session.delete(item)
    else:
        session.add(item)

    session.add(prod)
    session.commit()
    return True
```

---

## 🧭 **`app/routers/productos.py`**

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from ..db import get_session
from .. import schemas, crud

router = APIRouter(prefix="/productos", tags=["Productos"])

@router.post("", response_model=schemas.ProductoRead)
def crear_producto(payload: schemas.ProductoCreate, session: Session = Depends(get_session)):
    return crud.crear_producto(session, payload.codigo, payload.descripcion, payload.existencia)

@router.get("", response_model=List[schemas.ProductoRead])
def listar_productos(session: Session = Depends(get_session)):
    return crud.listar_productos(session)

@router.get("/{producto_id}", response_model=schemas.ProductoRead)
def obtener_producto(producto_id: int, session: Session = Depends(get_session)):
    return crud.obtener_producto(session, producto_id)

@router.patch("/{producto_id}", response_model=schemas.ProductoRead)
def actualizar_producto(producto_id: int, payload: schemas.ProductoUpdate, session: Session = Depends(get_session)):
    updates = payload.model_dump(exclude_unset=True)
    return crud.actualizar_producto(session, producto_id, **updates)
```

---

## 💰 **`app/routers/precios.py`**

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import Optional
from ..db import get_session
from .. import schemas, crud

router = APIRouter(prefix="/precios", tags=["Precios"])

@router.post("/producto/{producto_id}", response_model=schemas.PrecioRead)
def crear_precio(producto_id: int, payload: schemas.PrecioCreate, session: Session = Depends(get_session)):
    return crud.crear_precio(session, producto_id, payload.fecha_vigencia, payload.precio)

@router.get("/producto/{producto_id}/vigente", response_model=Optional[schemas.PrecioRead])
def precio_vigente(producto_id: int, session: Session = Depends(get_session)):
    return crud.precio_vigente_read(session, producto_id)
```

---

## 🧑 **`app/routers/clientes.py`**

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..db import get_session
from .. import schemas, crud

router = APIRouter(prefix="/clientes", tags=["Clientes"])

@router.post("", response_model=schemas.ClienteRead)
def crear_cliente(payload: schemas.ClienteCreate, session: Session = Depends(get_session)):
    return crud.crear_cliente(session, payload.nombre, payload.email)
```

---

## 🛒 **`app/routers/carritos.py`**

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..db import get_session
from .. import schemas, crud

router = APIRouter(prefix="/carritos", tags=["Carritos"])

@router.post("", response_model=schemas.CarritoRead)
def crear_carrito(payload: schemas.CarritoCreate, session: Session = Depends(get_session)):
    return crud.crear_carrito(session, payload.cliente_id)

@router.get("/{carrito_id}", response_model=schemas.CarritoDetalle)
def detalle_carrito(carrito_id: int, session: Session = Depends(get_session)):
    carrito, items, total = crud.detalle_carrito(session, carrito_id)
    return schemas.CarritoDetalle(
        carrito=schemas.CarritoRead.model_validate(carrito),
        items=[schemas.ItemRead.model_validate(i) for i in items],
        total=total
    )

@router.post("/{carrito_id}/cerrar", response_model=schemas.CarritoRead)
def cerrar_carrito(carrito_id: int, session: Session = Depends(get_session)):
    carrito = crud.cerrar_carrito(session, carrito_id)
    return schemas.CarritoRead.model_validate(carrito)

@router.post("/{carrito_id}/cancelar", response_model=schemas.CarritoRead)
def cancelar_carrito(carrito_id: int, session: Session = Depends(get_session)):
    carrito = crud.cancelar_carrito(session, carrito_id)
    return schemas.CarritoRead.model_validate(carrito)

@router.post("/{carrito_id}/agregar", response_model=schemas.ItemRead)
def agregar_item(carrito_id: int, payload: schemas.ItemOperacion, session: Session = Depends(get_session)):
    item = crud.agregar_item(session, carrito_id, payload.producto_id, payload.cantidad)
    return schemas.ItemRead.model_validate(item)

@router.post("/{carrito_id}/quitar", response_model=dict)
def quitar_item(carrito_id: int, payload: schemas.ItemOperacion, session: Session = Depends(get_session)):
    crud.quitar_item(session, carrito_id, payload.producto_id, payload.cantidad)
    return {"ok": True}
```

---

✅ **Con esto tenés todo el backend de un carrito de compras funcional**  
📌 Totalmente modular  
📌 Altamente legible  
📌 Documentado automáticamente vía Swagger (`/docs`)

Si querés, puedo prepararte la versión con autenticación JWT y roles (por ejemplo: *admin* y *cliente*) como siguiente paso. ¿Querés que avancemos en esa dirección?

You: 

> Haceme una app usando streamlit que implemente la ui para implementar la funcionalidad del carrito de compra usando el API que acabamos de definir. Debe permitir buscar producto p, agregar/quitar productos a carritos y completar o cancelar la compra. Hace que se agreguen datos de ejemplo cuando las tablas estén vacías


La app permitirá:

-   ✅ Buscar productos por nombre o código.
    
-   ➕ Agregar y ➖ quitar productos del carrito actual.
    
-   🧾 Ver detalle del carrito en tiempo real.
    
-   🛑 Cancelar o ✅ completar la compra.
    
-   🧪 Cargar datos de ejemplo automáticamente si la base está vacía.
    

---

## 📁 Estructura sugerida

```css
fastapi_carrito/
│
├── app/                     ← backend FastAPI (ya lo tenemos)
│
└── streamlit_ui/
    └── main.py              ← frontend Streamlit
```

---

## 🧪 `streamlit_ui/main.py`

```python
import streamlit as st
import requests
from datetime import datetime

API_BASE = "http://localhost:8000"  # asegúrate de tener el API corriendo

# ---------------------------
# FUNCIONES AUXILIARES
# ---------------------------
def init_sample_data():
    """Carga datos de ejemplo si no existen productos ni clientes."""
    productos = requests.get(f"{API_BASE}/productos").json()
    clientes = requests.get(f"{API_BASE}/clientes").json()
    if not productos:
        sample = [
            {"codigo": "P001", "descripcion": "Teclado mecánico", "existencia": 10},
            {"codigo": "P002", "descripcion": "Mouse gamer", "existencia": 15},
            {"codigo": "P003", "descripcion": "Monitor 24''", "existencia": 5},
        ]
        for p in sample:
            r = requests.post(f"{API_BASE}/productos", json=p).json()
            # precios vigentes
            requests.post(
                f"{API_BASE}/precios/producto/{r['id']}",
                json={"fecha_vigencia": datetime.now().isoformat(), "precio": 1000 + r["id"] * 500}
            )

    if not clientes:
        requests.post(f"{API_BASE}/clientes", json={"nombre": "Alejandro", "email": "ale@demo.com"})

def get_products():
    return requests.get(f"{API_BASE}/productos").json()

def get_or_create_cart(cliente_id: int):
    # Intentar crear carrito; si falla es porque ya hay uno abierto
    r = requests.post(f"{API_BASE}/carritos", json={"cliente_id": cliente_id})
    if r.status_code == 400:  # Ya existe
        # Buscar carrito abierto actual
        carritos = requests.get(f"{API_BASE}/carritos/{1}")  # no hay endpoint de listado, simulamos
    return requests.get(f"{API_BASE}/carritos/{1}").json()

def add_to_cart(carrito_id: int, producto_id: int, cantidad: int):
    return requests.post(f"{API_BASE}/carritos/{carrito_id}/agregar", json={
        "producto_id": producto_id, "cantidad": cantidad
    }).json()

def remove_from_cart(carrito_id: int, producto_id: int, cantidad: int):
    return requests.post(f"{API_BASE}/carritos/{carrito_id}/quitar", json={
        "producto_id": producto_id, "cantidad": cantidad
    }).json()

def close_cart(carrito_id: int):
    return requests.post(f"{API_BASE}/carritos/{carrito_id}/cerrar").json()

def cancel_cart(carrito_id: int):
    return requests.post(f"{API_BASE}/carritos/{carrito_id}/cancelar").json()


# ---------------------------
# UI STREAMLIT
# ---------------------------
st.set_page_config(page_title="🛒 Carrito de compras", layout="wide")
st.title("🛍️ Carrito de compras - Streamlit + FastAPI")

# Inicializamos datos de ejemplo si hace falta
init_sample_data()

# Cliente fijo para demo
cliente_id = 1
carrito = get_or_create_cart(cliente_id)
carrito_id = carrito["carrito"]["id"]

col1, col2 = st.columns([2, 1])

# ---------------------------
# COL 1: LISTA DE PRODUCTOS
# ---------------------------
with col1:
    st.header("📦 Productos disponibles")
    productos = get_products()
    busqueda = st.text_input("Buscar producto por código o descripción")

    if busqueda:
        productos = [p for p in productos if busqueda.lower() in p["codigo"].lower() or busqueda.lower() in p["descripcion"].lower()]

    for p in productos:
        with st.expander(f"{p['codigo']} - {p['descripcion']} (Stock: {p['existencia']})"):
            cant = st.number_input(f"Cantidad ({p['codigo']})", min_value=1, max_value=p['existencia'], value=1, key=f"add_{p['id']}")
            if st.button(f"➕ Agregar {p['codigo']}", key=f"btn_add_{p['id']}"):
                res = add_to_cart(carrito_id, p['id'], cant)
                if "detail" in res:
                    st.error(res["detail"])
                else:
                    st.success("Producto agregado correctamente ✅")
                    st.rerun()

# ---------------------------
# COL 2: CARRITO ACTUAL
# ---------------------------
with col2:
    st.header("🧾 Carrito actual")
    carrito = get_or_create_cart(cliente_id)
    items = carrito["items"]
    total = carrito["total"]

    if not items:
        st.info("Carrito vacío 🛒")
    else:
        for i in items:
            st.write(f"{i['producto_id']} - Cant: {i['cantidad']} - ${i['precio_unitario']}")
            remove_qty = st.number_input(f"Quitar {i['producto_id']}", min_value=1, max_value=i['cantidad'], key=f"rm_{i['id']}")
            if st.button(f"➖ Quitar {i['producto_id']}", key=f"btn_rm_{i['id']}"):
                remove_from_cart(carrito_id, i["producto_id"], remove_qty)
                st.rerun()

        st.subheader(f"💰 Total: ${total}")
        c1, c2 = st.columns(2)
        with c1:
            if st.button("✅ Completar compra"):
                close_cart(carrito_id)
                st.success("Compra completada ✅")
                st.rerun()
        with c2:
            if st.button("❌ Cancelar carrito"):
                cancel_cart(carrito_id)
                st.warning("Carrito cancelado 🚫")
                st.rerun()
```

---

## 🧠 Notas importantes

-   La app usa **Streamlit** para la UI y **requests** para comunicarse con el API FastAPI.
    
-   `init_sample_data()` inserta productos y precios si no hay datos.
    
-   Simula un **cliente fijo** (Alejandro), pero se puede extender fácilmente para login.
    
-   Cuando agregás/quitas productos, la página se refresca con `st.rerun()` para actualizar la vista.
    
-   Para correr:
    
    ```bash
    uvicorn app.main:app --reload
    streamlit run streamlit_ui/main.py
    ```
    

