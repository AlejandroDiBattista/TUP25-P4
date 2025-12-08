import { CarritoItem, Compra, CheckoutRequest } from '../types';
import { obtenerToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getHeaders() {
  const token = obtenerToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function obtenerCarrito(): Promise<CarritoItem[]> {
  const response = await fetch(`${API_URL}/carrito`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener carrito');
  }

  return response.json();
}

export async function agregarAlCarrito(productoId: number, cantidad: number): Promise<void> {
  const response = await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ producto_id: productoId, cantidad }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al agregar al carrito');
  }
}

export async function quitarDelCarrito(productoId: number): Promise<void> {
  const response = await fetch(`${API_URL}/carrito/${productoId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al quitar del carrito');
  }
}

export async function vaciarCarritoBackend(): Promise<void> {
  const response = await fetch(`${API_URL}/carrito/cancelar`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al vaciar carrito');
  }
}

export async function finalizarCompra(data: CheckoutRequest): Promise<Compra> {
  const response = await fetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al finalizar compra');
  }

  return response.json();
}
