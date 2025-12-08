import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface FiltrosProductos {
  categoria?: string;
  busqueda?: string;
}

export async function obtenerProductos(filtros?: FiltrosProductos): Promise<Producto[]> {
  const params = new URLSearchParams();

  if (filtros?.categoria) {
    params.set('categoria', filtros.categoria);
  }

  if (filtros?.busqueda) {
    params.set('busqueda', filtros.busqueda);
  }

  const query = params.toString();
  const response = await fetch(`${API_URL}/productos${query ? `?${query}` : ''}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }
  
  return response.json();
}
