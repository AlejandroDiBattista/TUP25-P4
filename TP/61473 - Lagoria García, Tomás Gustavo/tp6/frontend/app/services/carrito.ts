import { Carrito, AgregarCarritoRequest, CompraCreate } from '../types';
import { obtenerToken } from './auth';
import { ApiClient } from '../utils/api-client';

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
 * Obtener carrito actual del usuario
 */
export async function obtenerCarrito(): Promise<Carrito> {
  const response = await ApiClient.fetch(`${API_URL}/carrito`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener carrito');
  }
  
  return response.json();
}

/**
 * Agregar producto al carrito
 */
export async function agregarAlCarrito(
  producto_id: number, 
  cantidad: number = 1
): Promise<Carrito> {
  const body: AgregarCarritoRequest = { producto_id, cantidad };
  
  const response = await ApiClient.fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
    }
    const error = await response.json();
    throw new Error(error.detail || 'Error al agregar producto al carrito');
  }
  
  return response.json();
}

/**
 * Quitar producto del carrito
 */
export async function quitarDelCarrito(producto_id: number): Promise<Carrito> {
  const response = await ApiClient.fetch(`${API_URL}/carrito/${producto_id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al quitar producto del carrito');
  }
  
  return response.json();
}

/**
 * Cancelar carrito (vaciar)
 */
export async function cancelarCarrito(): Promise<void> {
  const response = await ApiClient.fetch(`${API_URL}/carrito/cancelar`, {
    method: 'POST',
    headers: getHeaders()
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al cancelar carrito');
  }
}

/**
 * Finalizar compra
 */
export async function finalizarCompra(
  direccion: string, 
  tarjeta: string
): Promise<any> {
  const body: CompraCreate = { direccion, tarjeta };
  
  const response = await ApiClient.fetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al finalizar compra');
  }
  
  return response.json();
}
