'use client';

import { api } from '@/lib/api';

export interface CompraResumen {
  compra_id: number;
  fecha: string;
  total: number;
  estado: string;
}

export interface DetalleCompra {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface CompraDetalle {
  compra_id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  productos: DetalleCompra[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export async function obtenerHistorialCompras(): Promise<CompraResumen[]> {
  try {
    const response = await api.get('/compras');
    return response.data.compras || [];
  } catch (error: any) {
    console.error('Error al obtener historial:', error);
    if (error.response?.status === 401) {
      throw new Error('No autenticado. Por favor inicia sesión nuevamente.');
    }
    throw error;
  }
}

export async function obtenerDetalleCompra(compra_id: number): Promise<CompraDetalle> {
  try {
    const response = await api.get(`/compras/${compra_id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener detalle:', error);
    if (error.response?.status === 401) {
      throw new Error('No autenticado. Por favor inicia sesión nuevamente.');
    }
    throw error;
  }
}
