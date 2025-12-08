import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerProductos(params?: { buscar?: string; categoria?: string }): Promise<Producto[]> {
  const query = new URLSearchParams();
  if (params?.buscar) query.set('buscar', params.buscar);
  if (params?.categoria) query.set('categoria', params.categoria);
  const url = `${API_URL}/productos${query.toString() ? `?${query.toString()}` : ''}`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Error al obtener productos');
  return response.json();
}
