/**
 * Servicio de carrito para comunicarse con el backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AgregarProductoRequest {
  producto_id: number;
  cantidad: number;
}

export interface ItemCarrito {
  id: number;
  producto_id: number;
  titulo: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  imagen: string;
  existencia_disponible: number;
}

export interface CarritoResponse {
  carrito_id: number;
  estado: string;
  items: ItemCarrito[];
  total: number;
  cantidad_items: number;
}

/**
 * Agregar producto al carrito
 */
export async function agregarAlCarrito(
  token: string,
  data: AgregarProductoRequest
): Promise<{ mensaje: string }> {
  const response = await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al agregar producto al carrito');
  }

  return response.json();
}

/**
 * Obtener contenido del carrito
 */
export async function obtenerCarrito(token: string): Promise<CarritoResponse> {
  const response = await fetch(`${API_URL}/carrito`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener carrito');
  }

  return response.json();
}

/**
 * Eliminar producto del carrito
 */
export async function eliminarDelCarrito(
  token: string,
  productoId: number
): Promise<{ mensaje: string }> {
  const response = await fetch(`${API_URL}/carrito/${productoId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al eliminar producto del carrito');
  }

  return response.json();
}

/**
 * Cancelar carrito (vaciar)
 */
export async function cancelarCarrito(token: string): Promise<{ mensaje: string }> {
  const response = await fetch(`${API_URL}/carrito/cancelar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al cancelar carrito');
  }

  return response.json();
}

/**
 * Finalizar compra
 */
export async function finalizarCompra(
  token: string,
  datos: { direccion: string; tarjeta: string }
): Promise<any> {
  const response = await fetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al finalizar compra');
  }

  return response.json();
}
