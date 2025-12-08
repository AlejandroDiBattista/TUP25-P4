"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
import { getToken } from './auth';

export async function agregarAlCarrito(producto_id: number, cantidad = 1) {
  const token = getToken();
  if (!token) throw new Error('Debes iniciar sesión para agregar al carrito');

  const res = await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ producto_id, cantidad }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Error al agregar al carrito');
  }
  const data = await res.json();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart-updated'));
  return data;
}
