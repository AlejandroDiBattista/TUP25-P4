import { Compra } from '../types';
import { obtenerToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getHeaders(): Promise<HeadersInit> {
  const token = obtenerToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function finalizarCompra(
  direccion: string,
  tarjeta: string
): Promise<Compra> {
  const headers = await getHeaders();
  
  try {
    const res = await fetch(`${API_URL}/compras/finalizar`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ direccion, tarjeta }),
    });

    if (!res.ok) {
      let errorDetail = 'Error al finalizar compra';
      try {
        const error = await res.json();
        errorDetail = error.detail || error.message || errorDetail;
      } catch {
        errorDetail = `Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorDetail);
    }

    return res.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en ' + API_URL);
    }
    throw error;
  }
}

export async function obtenerCompras(): Promise<Compra[]> {
  const headers = await getHeaders();
  
  try {
    const res = await fetch(`${API_URL}/compras`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      let errorDetail = 'Error al obtener compras';
      try {
        const error = await res.json();
        errorDetail = error.detail || error.message || errorDetail;
      } catch {
        errorDetail = `Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorDetail);
    }

    return res.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en ' + API_URL);
    }
    throw error;
  }
}

export async function obtenerCompraDetalle(compraId: number): Promise<Compra> {
  const headers = await getHeaders();
  
  try {
    const res = await fetch(`${API_URL}/compras/${compraId}`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      let errorDetail = 'Error al obtener compra';
      try {
        const error = await res.json();
        errorDetail = error.detail || error.message || errorDetail;
      } catch {
        errorDetail = `Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorDetail);
    }

    return res.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en ' + API_URL);
    }
    throw error;
  }
}

