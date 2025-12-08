# 🧾 TP6: 2do Parcial

El trabajo práctico 2 será evaluado como el **2do parcial**.  
El trabajo es **individual** y debe ser realizado en el **repositorio personal** de cada alumno.

📅 **Fecha de entrega:**  
**Miércoles 12 de Noviembre** — desde las **21:00 hs hasta las 22:00 hs**.

---

## 🎯 Objetivo

Desarrollo de un **sitio de comercio electrónico simple** utilizando:

- **Frontend:** React  
- **Backend:** FastAPI  

---

## ⚙️ Funcionalidad

- Registrar usuario  
- Iniciar sesión  
- Cerrar sesión  
- Ver resumen de compras  
- Ver detalle de compras  
- Buscar productos (por contenido y categoría)  
- Agregar productos al carrito  
- Quitar productos del carrito  
- Cancelar compra  
- Finalizar compra  

---

## 🧰 Tecnologías

- **Frontend:** React (usando Next.js con Tailwind CSS y Shadcn UI)  
- **Backend:** FastAPI (API RESTful, SQLModel + SQLite)  

---

## 🗄️ Estructura de la base de datos

### 🧑 Usuario
- id  
- nombre  
- email  
- contraseña (hashed)

### 📦 Producto
- id  
- nombre  
- descripción  
- precio  
- categoría  
- existencia

### 🛒 Carrito
- id  
- usuario_id  
- estado  
- productos (lista de productos con cantidad)

**Item del carrito:**  
- producto_id  
- cantidad

### 💳 Compra
- id  
- usuario_id  
- fecha  
- dirección  
- tarjeta  
- total  
- envío  

**Item de compra:**  
- producto_id  
- cantidad  
- nombre  
- precio_unitario  

---

## 🌐 Endpoints de la API

| Método | Endpoint | Descripción |
|:-------|:----------|:-------------|
| **POST** | `/registrar` | Registrar un nuevo usuario |
| **POST** | `/iniciar-sesion` | Iniciar sesión y obtener token de autenticación |
| **POST** | `/cerrar-sesion` | Cerrar sesión (invalidar token) |
| **GET** | `/productos` | Obtener lista de productos (con filtros opcionales por categoría y búsqueda) |
| **GET** | `/productos/{id}` | Obtener detalles de un producto específico |
| **POST** | `/carrito` | Agregar producto al carrito |
| **DELETE** | `/carrito/{product_id}` | Quitar producto del carrito |
| **GET** | `/carrito` | Ver contenido del carrito |
| **POST** | `/carrito/finalizar` | Finalizar compra |
| **POST** | `/carrito/cancelar` | Cancelar compra (vaciar carrito) |
| **GET** | `/compras` | Ver resumen de compras del usuario |
| **GET** | `/compras/{id}` | Ver detalle de una compra específica |

---

## 🖥️ Pantallas principales

1. Pantalla de registro e inicio de sesión  
2. Pantalla de listado de productos con búsqueda y filtros / Carrito de compras  
3. Pantalla de finalización de compra (carrito + dirección y detalles de pago)  
4. Pantalla de compras anteriores (resumen + detalle)  

---

## 🔄 Flujo de trabajo

1. El usuario se registra e inicia sesión.  
2. El usuario navega por los productos, utilizando búsqueda y filtro de categoría.  
3. El usuario agrega productos al carrito.  
4. El usuario revisa el carrito y puede eliminar productos si lo desea.  
5. El usuario finaliza la compra proporcionando dirección y detalles de pago.  
6. El usuario puede ver un resumen de sus compras anteriores.  

---

## ⚖️ Reglas de uso

- Solo se puede agregar productos al carrito si **hay existencia disponible**.  
- El usuario debe estar **autenticado** para realizar compras y ver su historial.  
- El **precio total** se calcula sumando el precio unitario por la cantidad de cada producto en el carrito.  
- El **IVA** es del **21%** del total de la compra *(excepto productos electrónicos: 10%)*.  
- El **envío es gratuito** para compras superiores a **1000**, de lo contrario tiene un **costo fijo de 50**.  
- Los productos solo pueden eliminarse del carrito si **no ha sido finalizado**.  
- Una vez finalizada la compra, el carrito se vacía y se crea un registro de compra.  
- Los productos sin existencias deben mostrarse como **“Agotados”** y no pueden agregarse al carrito.  

---

## 🧪 Consideraciones adicionales

- Realizar **pruebas unitarias** para los endpoints de la API.  
- Implementar **manejo de errores adecuado** (ej. usuario no encontrado, producto agotado).  
- Cargar **datos iniciales de productos** en la base de datos para pruebas.  
- Los datos de los productos se encuentran en el archivo **`productos.json`**.  
- Las imágenes se encuentran en la carpeta **`/imagenes`**.  

---

## 📤 Instrucciones para la entrega

> **[!NOTA]**  
> El trabajo debe ser entregado el día **Miércoles 12 de Noviembre**, entre las **21:00 y 22:00 hs**.

Durante el desarrollo se deben hacer **commits frecuentes y descriptivos**  
(Mínimo **10 commits**).

---

## 🪟 Pantallas

1. Pantalla inicial de productos  
2. Pantalla de inicio de sesión  
3. Pantalla de registro de usuario  
4. Pantalla de compra (con carrito)  
5. Pantalla de confirmar compra  
6. Pantalla de historial de compras  
