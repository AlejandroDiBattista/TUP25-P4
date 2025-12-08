import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerProductos(): Promise<Producto[]> {
  const response = await fetch(`${API_URL}/productos`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }
  
  return response.json();
}

export async function obtenerProductoPorId(id: number): Promise<Producto> {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener producto');
  }
  
  return response.json();
}
