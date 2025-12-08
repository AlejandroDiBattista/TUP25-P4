import { CompraResumen, CompraDetalle } from '../types';
import { obtenerToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Obtener headers con token de autenticación
 */
function getHeaders() {
  const token = obtenerToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Listar todas las compras del usuario
 */
export async function listarCompras(): Promise<CompraResumen[]> {
  const response = await fetch(`${API_URL}/compras`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener compras');
  }
  
  return response.json();
}

/**
 * Obtener detalle de una compra específica
 */
export async function obtenerDetalleCompra(id: number): Promise<CompraDetalle> {
  const response = await fetch(`${API_URL}/compras/${id}`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener detalle de compra');
  }
  
  return response.json();
}
