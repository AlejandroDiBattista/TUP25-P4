import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Filtros {
  search?: string;
  categoria?: string; 
}

export async function obtenerProductos(filtros: Filtros = {}): Promise<Producto[]> {
  // Normalizar filtros
  const search = filtros.search?.trim();
  const categoria =
    filtros.categoria && filtros.categoria.toLowerCase() !== 'todas'
      ? filtros.categoria.trim()
      : undefined;

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (categoria) params.set('categoria', categoria);

  const url = `${API_URL}/productos${params.toString() ? `?${params.toString()}` : ''}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Error al obtener productos (${response.status}): ${text || response.statusText}`);
    }

    return (await response.json()) as Producto[];
  } catch (err) {
    console.error('obtenerProductos() falló:', err);
    throw err;
  }
}

/**
 * Obtener detalle de un producto por su ID.
 */
export async function obtenerProductoPorId(id: number): Promise<Producto> {
  const url = `${API_URL}/productos/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Error al obtener producto #${id} (${response.status}): ${text || response.statusText}`);
  }

  return (await response.json()) as Producto;
}

export async function obtenerCategorias(): Promise<string[]> {
  const productos = await obtenerProductos();
  const set = new Set<string>();
  productos.forEach((p) => set.add(p.categoria));
  // Orden alfabético con "Todas las categorías" al principio 
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
