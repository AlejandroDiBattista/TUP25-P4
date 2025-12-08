import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface FiltrosProductos {
  categoria?: string;
  buscar?: string;
}

function buildQueryString(filtros: FiltrosProductos): string {
  const params = new URLSearchParams();

  if (filtros.categoria) {
    params.set('categoria', filtros.categoria.trim());
  }

  if (filtros.buscar) {
    params.set('buscar', filtros.buscar.trim());
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

interface FetchOptions {
  signal?: AbortSignal;
}

export async function obtenerProductos(
  filtros: FiltrosProductos = {},
  opciones: FetchOptions = {},
): Promise<Producto[]> {
  const query = buildQueryString(filtros);
  const response = await fetch(`${API_URL}/productos${query}`, {
    cache: 'no-store',
    signal: opciones.signal,
  });

  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }

  const productos: Producto[] = await response.json();
  return productos;
}

export async function obtenerProductoPorId(
  productoId: number,
  opciones: FetchOptions = {},
): Promise<Producto> {
  const response = await fetch(`${API_URL}/productos/${productoId}`, {
    cache: 'no-store',
    signal: opciones.signal,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Producto no encontrado');
    }
    throw new Error('Error al obtener el producto');
  }

  const producto: Producto = await response.json();
  return producto;
}
