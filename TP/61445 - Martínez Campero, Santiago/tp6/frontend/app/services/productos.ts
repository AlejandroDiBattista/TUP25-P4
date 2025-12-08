import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerProductos(
  categoria?: string,
  buscar?: string,
  ordenar?: string,
  precioMin?: string,
  precioMax?: string
): Promise<Producto[]> {
  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (buscar) params.append('buscar', buscar);
  if (ordenar) params.append('ordenar', ordenar);
  if (precioMin) params.append('precioMin', precioMin);
  if (precioMax) params.append('precioMax', precioMax);

  const url = `${API_URL}/productos${params.size > 0 ? `?${params}` : ''}`;
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function obtenerProducto(id: number): Promise<Producto> {
  const res = await fetch(`${API_URL}/productos/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function obtenerCategorias(): Promise<string[]> {
  const res = await fetch(`${API_URL}/productos/categorias/todas`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
