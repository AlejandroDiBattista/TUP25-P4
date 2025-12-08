import { Compra, CompraResumen } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CheckoutData {
  direccion: string;
  tarjeta: string;
}

export async function finalizarCompra(data: CheckoutData): Promise<Compra> {
  const response = await fetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al finalizar compra');
  }

  return response.json();
}

export async function obtenerHistorialCompras(): Promise<CompraResumen[]> {
  const response = await fetch(`${API_URL}/compras`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al obtener historial de compras');
  }

  return response.json();
}

export async function obtenerDetalleCompra(compra_id: number): Promise<Compra> {
  const response = await fetch(`${API_URL}/compras/${compra_id}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al obtener detalle de compra');
  }

  return response.json();
}
