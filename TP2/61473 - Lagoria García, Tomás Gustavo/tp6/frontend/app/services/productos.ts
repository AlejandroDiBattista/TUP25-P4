import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FiltrosProductos {
  categoria?: string;
  buscar?: string;
}

/**
 * Obtener lista de productos con filtros opcionales
 */
export async function obtenerProductos(
  filtros?: FiltrosProductos
): Promise<Producto[]> {
  const params = new URLSearchParams();
  
  if (filtros?.categoria && filtros.categoria !== 'todas') {
    params.append('categoria', filtros.categoria);
  }
  
  if (filtros?.buscar && filtros.buscar.trim()) {
    params.append('busqueda', filtros.buscar.trim());
  }
  
  const url = `${API_URL}/productos${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, { 
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }
  
  return response.json();
}

/**
 * Obtener detalles de un producto específico
 */
export async function obtenerProducto(id: number): Promise<Producto> {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener producto');
  }
  
  return response.json();
}
