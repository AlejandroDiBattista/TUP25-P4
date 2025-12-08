import { CarritoDetalle, CompraFinalizada } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerCarrito(token: string): Promise<CarritoDetalle> {
  const response = await fetch(`${API_URL}/carrito`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el carrito');
  }

  return response.json();
}

export async function agregarAlCarrito(
  token: string,
  payload: { producto_id: number; cantidad: number }
): Promise<CarritoDetalle> {
  const response = await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error((await response.json()).detail ?? 'No se pudo agregar al carrito');
  }

  return response.json();
}

export async function quitarDelCarrito(token: string, productoId: number): Promise<CarritoDetalle> {
  const response = await fetch(`${API_URL}/carrito/${productoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error((await response.json()).detail ?? 'No se pudo quitar del carrito');
  }

  return response.json();
}

export async function cancelarCarrito(token: string): Promise<CarritoDetalle> {
  const response = await fetch(`${API_URL}/carrito/cancelar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error((await response.json()).detail ?? 'No se pudo cancelar el carrito');
  }

  return response.json();
}

export async function finalizarCarrito(
  token: string,
  payload: { direccion: string; tarjeta: string }
): Promise<CompraFinalizada> {
  const response = await fetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error((await response.json()).detail ?? 'No se pudo finalizar la compra');
  }

  return response.json();
}
