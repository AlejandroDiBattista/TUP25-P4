import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface OpcionesApi {
  buscar?: string;
  categoria?: string;
}

export async function obtenerProductos(
  opciones: OpcionesApi = {}
): Promise<Producto[]> {
  const { buscar, categoria } = opciones;

  const url = new URL(`${API_URL}/productos`);
  if (buscar) {
    url.searchParams.append('buscar', buscar);
  }
  if (categoria) {
    url.searchParams.append('categoria', categoria);
  }

  const response = await fetch(url.toString(), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }

  return response.json();
}
