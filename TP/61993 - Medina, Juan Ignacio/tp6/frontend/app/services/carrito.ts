import { CarritoItem } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerCarrito(token: string): Promise<CarritoItem[]> {
  const response = await fetch(`${API_URL}/carrito`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Error al obtener carrito');
  return response.json();
}

export async function agregarAlCarrito(token: string, producto_id: number, cantidad: number) {
  const response = await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ producto_id, cantidad })
  });
  if (!response.ok) throw new Error('Error al agregar producto al carrito');
  return response.json();
}

export async function quitarDelCarrito(token: string, producto_id: number) {
  const response = await fetch(`${API_URL}/carrito/${producto_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Error al quitar producto del carrito');
  return response.json();
}

export async function finalizarCompra(token: string, direccion: string, tarjeta: string) {
  const response = await fetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ direccion, tarjeta })
  });
  if (!response.ok) throw new Error('Error al finalizar compra');
  return response.json();
}
