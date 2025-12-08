import { Carrito } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerCarrito(): Promise<Carrito> {
  const response = await fetch(`${API_URL}/carrito`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al obtener carrito');
  }

  return response.json();
}

export async function agregarAlCarrito(producto_id: number, cantidad: number): Promise<{ mensaje: string }> {
  const response = await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ producto_id, cantidad }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al agregar al carrito');
  }

  return response.json();
}

export async function actualizarCantidad(producto_id: number, cantidad: number): Promise<{ mensaje: string }> {
  const response = await fetch(`${API_URL}/carrito/${producto_id}?cantidad=${cantidad}`, {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al actualizar cantidad');
  }

  return response.json();
}

export async function eliminarDelCarrito(producto_id: number): Promise<{ mensaje: string }> {
  const response = await fetch(`${API_URL}/carrito/${producto_id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al eliminar del carrito');
  }

  return response.json();
}

export async function vaciarCarrito(): Promise<{ mensaje: string }> {
  const response = await fetch(`${API_URL}/carrito/cancelar`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al vaciar carrito');
  }

  return response.json();
}
