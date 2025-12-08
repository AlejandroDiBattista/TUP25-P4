import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ProductoQuery {
  buscar?: string;
  categoria?: string;
}

export async function obtenerProductos(params: ProductoQuery = {}): Promise<Producto[]> {
  const query = new URLSearchParams();
  if (params.buscar) query.set('buscar', params.buscar);
  if (params.categoria) query.set('categoria', params.categoria);

  const response = await fetch(`${API_URL}/productos${query.toString() ? `?${query}` : ''}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }
  
  return response.json();
}
