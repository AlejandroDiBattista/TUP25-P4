import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerProductos(): Promise<Producto[]> {
  try {
    const response = await fetch(`${API_URL}/productos`, {
      cache: 'no-store',
      // solicita CORS en el navegador si aplica
      mode: 'cors',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Error al obtener productos: ${response.status} ${response.statusText} ${text}`);
    }

    return response.json();
  } catch (err: any) {
    // Información más detallada para debugging
    console.error('Falló fetch a backend:', API_URL, err);
    throw new Error(`No se pudo conectar al backend en ${API_URL}. Asegurate de que uvicorn esté corriendo en el puerto 8000. Detalle: ${err?.message || err}`);
  }
}
