import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerProductos(): Promise<Producto[]> {
  try {
    const response = await fetch(`${API_URL}/productos`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      // Respuesta del servidor pero con status de error
      console.error(`API responded with status ${response.status} when fetching productos from ${API_URL}`);
      return [];
    }

    return response.json();
  } catch (err: any) {
    // Manejo de errores de red (ECONNREFUSED, timeout, etc.)
    console.error(`Error al conectarse a la API en ${API_URL}/productos:`, err?.message || err);

    // Devuelve un fallback vacío para que la página no rompa (evita 500).
    // Si prefieres que falle en vez de mostrar vacío, cambia esto para volver a lanzar el error.
    return [];
  }
}
