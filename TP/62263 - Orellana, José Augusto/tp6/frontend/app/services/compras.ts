import type { Compra } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerCompras(token: string): Promise<Compra[]> {
  const response = await fetch(`${API_URL}/compras`, {
    cache: 'no-store',
    headers: {
      Cookie: `token=${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el historial de compras.');
  }

  return response.json();
}

export async function obtenerCompraDetalle(id: number, token: string): Promise<Compra | null> {
  const response = await fetch(`${API_URL}/compras/${id}`, {
    cache: 'no-store',
    headers: {
      Cookie: `token=${token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
