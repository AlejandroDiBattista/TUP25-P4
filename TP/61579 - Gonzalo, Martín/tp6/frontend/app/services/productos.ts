import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerProductos(
  buscar?: string,
  categoria?: string
): Promise<Producto[]> {
  const params = new URLSearchParams();
  if (buscar) params.append('buscar', buscar);
  if (categoria) params.append('categoria', categoria);
  
  const query = params.toString();
  const url = query ? `${API_URL}/productos?${query}` : `${API_URL}/productos`;
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }
  
  return response.json();
}

export async function obtenerProductoPorId(id: string | number): Promise<Producto> {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener el producto');
  }
  
  return response.json();
}
