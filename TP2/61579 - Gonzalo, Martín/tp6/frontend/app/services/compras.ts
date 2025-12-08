import { Compra, CheckoutRequest } from '../types';
import { obtenerToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getHeaders() {
  const token = obtenerToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function obtenerHistorialCompras(): Promise<Compra[]> {
  try {
    const response = await fetch(`${API_URL}/compras`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al obtener historial de compras');
    }

    return response.json();
  } catch (err: any) {
    console.error('Error en obtenerHistorialCompras:', err);
    throw err;
  }
}

export async function obtenerDetalleCompra(compraId: number): Promise<Compra> {
  const response = await fetch(`${API_URL}/compras/${compraId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener detalle de compra');
  }

  return response.json();
}
