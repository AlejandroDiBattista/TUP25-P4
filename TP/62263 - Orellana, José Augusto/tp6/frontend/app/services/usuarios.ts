import type { Carrito, Usuario } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerPerfil(token: string): Promise<Usuario | null> {
  try {
    const response = await fetch(`${API_URL}/perfil`, {
      cache: 'no-store',
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return null;
  }
}

export async function obtenerCarrito(token: string): Promise<Carrito | null> {
  try {
    const response = await fetch(`${API_URL}/carrito`, {
      cache: 'no-store',
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return null;
  }
}
