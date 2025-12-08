import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerProductos(
  categoria?: string,
  busqueda?: string
): Promise<Producto[]> {
  let url = `${API_URL}/api/productos`;
  const params = new URLSearchParams();
  
  if (categoria) {
    params.append('categoria', categoria);
  }
  
  if (busqueda) {
    params.append('busqueda', busqueda);
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }
  
  return response.json();
}

export async function obtenerCategorias(): Promise<string[]> {
  const response = await fetch(`${API_URL}/api/categorias`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener categorías');
  }
  
  const data = await response.json();
  return data.categorias || [];
}
