# 📦 Sistema de Checkout y Pedidos - Documentación

## 🔄 Flujo Completo de Compra

### 1. **Preparación del Carrito**
```
POST /carrito/agregar
- Agregar productos al carrito
- Validar stock automáticamente
- Actualizar cantidades si es necesario
```

### 2. **Preview del Checkout**
```
GET /checkout/preview
- Ver costos detallados antes de confirmar
- Subtotal + IVA (21%) + Envío - Descuentos
- Reglas de envío:
  * Gratis para compras > $50,000
  * Reducido ($5,000) para compras > $25,000
  * Estándar ($8,500) para compras menores
```

### 3. **Procesamiento de Pedido**
```
POST /checkout
- Procesar pago (simulado)
- Crear pedido desde carrito
- Actualizar stock automáticamente
- Vaciar carrito después del pedido
- Generar número de seguimiento
```

## 🛒 Endpoints de Checkout

### `GET /checkout/preview`
Obtiene preview de costos antes del checkout.

**Respuesta:**
```json
{
  "subtotal": 15000.0,
  "impuestos": 3150.0,
  "costo_envio": 8500.0,
  "descuento": 0.0,
  "total": 26650.0,
  "cantidad_items": 3
}
```

### `POST /checkout`
Procesa el checkout completo y crea el pedido.

**Request:**
```json
{
  "direccion_entrega": {
    "direccion": "Av. San Martín 1234, Piso 5, Depto B",
    "ciudad": "San Miguel de Tucumán",
    "codigo_postal": "4000",
    "telefono": "3814567890"
  },
  "info_pago": {
    "metodo_pago": "tarjeta_credito",
    "numero_tarjeta": "4532123456789012",
    "nombre_titular": "Juan Perez"
  },
  "notas": "Entregar en horario de oficina"
}
```

## 📋 Gestión de Pedidos

### `GET /pedidos`
Lista todos los pedidos del usuario autenticado.

### `GET /pedidos/{id}`
Obtiene detalles de un pedido específico.

### `GET /pedidos/numero/{numero_pedido}`
Busca pedido por número (ej: PED-20251104-1234).

### `PUT /pedidos/{id}/cancelar`
Cancela un pedido (solo si está pendiente/confirmado).

## 📊 Estados de Pedidos

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| `pendiente` | Recién creado | Cancelar |
| `confirmado` | Pago procesado | Cancelar |
| `preparando` | En preparación | - |
| `enviado` | En camino | - |
| `entregado` | Finalizado | - |
| `cancelado` | Cancelado | - |

## 💳 Métodos de Pago Soportados

- `tarjeta_credito` - Requiere número y titular
- `tarjeta_debito` - Requiere número y titular  
- `transferencia` - Datos bancarios
- `efectivo` - Pago contra entrega
- `mercado_pago` - Integración externa

## 🔐 Endpoints Administrativos

### `PUT /admin/pedidos/{id}/estado`
Actualiza estado de pedidos (simulación de panel admin).

### `GET /admin/pedidos`
Lista todos los pedidos del sistema.

## ⚡ Características Avanzadas

### 🎯 **Validaciones Automáticas**
- Stock disponible antes de checkout
- Formato de tarjetas y datos de entrega
- Estados válidos para cancelación

### 📦 **Gestión de Inventario**
- Descuento automático de stock al confirmar
- Restauración de stock al cancelar
- Validación en tiempo real

### 🧮 **Cálculos Inteligentes**
- IVA automático (21%)
- Envío gratuito por volumen
- Descuentos por compras grandes
- Fechas estimadas de entrega

### 🔄 **Workflow Completo**
1. Agregar productos → Carrito
2. Preview → Validar costos
3. Checkout → Crear pedido
4. Seguimiento → Estados en tiempo real
5. Entrega → Finalización

## 🧪 Ejemplos de Uso

Ver archivo `pruebas.rest` para ejemplos completos de:
- Flujo completo de compra
- Gestión de pedidos
- Endpoints administrativos
- Casos de error y validaciones

## 🔍 Números de Seguimiento

Formato automático: `TRK{6_digits}` (ej: TRK123456)
Generado automáticamente al marcar como "enviado".