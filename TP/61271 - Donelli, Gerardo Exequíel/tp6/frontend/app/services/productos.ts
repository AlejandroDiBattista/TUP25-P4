import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Obtener lista de productos con filtros opcionales
 */
export async function obtenerProductos(
  categoria?: string,
  buscar?: string
): Promise<Producto[]> {
  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (buscar) params.append('buscar', buscar);
  
  const url = params.toString() 
    ? `${API_URL}/productos?${params.toString()}`
    : `${API_URL}/productos`;

  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }
  
  return response.json();
}

/**
 * Obtener detalle de un producto específico
 */
export async function obtenerProductoPorId(id: number): Promise<Producto> {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Producto no encontrado');
  }
  
  return response.json();
}

/**
 * Obtener categorías únicas de los productos
 */
export async function obtenerCategorias(): Promise<string[]> {
  const productos = await obtenerProductos();
  const categorias = [...new Set(productos.map(p => p.categoria))];
  return categorias.sort();
}

