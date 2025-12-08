import { CompraDetalle, CompraResumen } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerHistorial(token: string): Promise<CompraResumen[]> {
  const response = await fetch(`${API_URL}/compras`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el historial de compras');
  }

  return response.json();
}

export async function obtenerDetalleCompra(token: string, compraId: number): Promise<CompraDetalle> {
  const response = await fetch(`${API_URL}/compras/${compraId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el detalle de la compra');
  }

  return response.json();
}
