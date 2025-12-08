// frontend/app/services/compras.ts
import Cookies from 'js-cookie';
import { Compra, CompraDetalle } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function getAuthHeaders() {
  const token = Cookies.get('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function obtenerCompras(): Promise<Compra[]> {
  try {
    const response = await fetch(`${API_URL}/compras/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener compras');
    }

    return response.json();
  } catch (error) {
    console.error('Error obteniendo compras:', error);
    throw error;
  }
}

export async function obtenerCompraPorId(id: number): Promise<CompraDetalle> {
  try {
    const response = await fetch(`${API_URL}/compras/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener compra');
    }

    return response.json();
  } catch (error) {
    console.error('Error obteniendo compra:', error);
    throw error;
  }
}