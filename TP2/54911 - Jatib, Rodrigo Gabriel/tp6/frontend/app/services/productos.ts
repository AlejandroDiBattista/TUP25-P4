import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function obtenerProductos(): Promise<Producto[]> {
  try {
    const response = await fetch(`${API_URL}/productos`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Error fetching productos, status:', response.status);
      return [];
    }

    return response.json();
  } catch (err) {
    // Network errors (ECONNREFUSED, DNS, etc.) will land here.
    console.error('Fetch failed in obtenerProductos:', err);
    return [];
  }
}
