'use client';

import { Producto } from '../types';
import { api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerProductos(categoria?: string, busqueda?: string): Promise<Producto[]> {
  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (busqueda) params.append('busqueda', busqueda);

  const response = await api.get(`/productos`, { params });
  
  if (!response) {
    throw new Error('Error al obtener productos');
  }
  
  return response.data;
}

export async function obtenerProducto(id: number): Promise<Producto> {
  const response = await api.get(`/productos/${id}`);
  
  if (!response) {
    throw new Error('Error al obtener producto');
  }
  
  return response.data;
}
