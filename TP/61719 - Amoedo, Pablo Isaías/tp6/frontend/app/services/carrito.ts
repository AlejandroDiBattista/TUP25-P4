'use client';

import { api } from '@/lib/api';

export interface ItemCarrito {
  carrito_id: number;
  producto_id: number;
  nombre: string;
  imagen: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  iva: number;
}

export interface Carrito {
  carrito: ItemCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export async function obtenerCarrito(): Promise<Carrito> {
  const response = await api.get('/carrito');
  return response.data;
}

export async function agregarAlCarrito(producto_id: number, cantidad: number = 1): Promise<any> {
  const response = await api.post('/carrito', { producto_id, cantidad });
  return response.data;
}



export async function eliminarDelCarrito(producto_id: number): Promise<any> {
  const response = await api.delete(`/carrito/${producto_id}`);
  return response.data;
}

export async function cancelarCarrito(): Promise<any> {
  const response = await api.delete('/carrito');
  return response.data;
}

export interface CompraRequest {
  direccion: string;
  tarjeta: string;
}

export async function finalizarCompra(compraData: CompraRequest): Promise<any> {
  const response = await api.post('/comprar', compraData);
  return response.data;
}
