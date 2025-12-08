// frontend/app/types.ts

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  existencia: number;
}

export interface ItemCarritoCreate {
  producto_id: number;
  cantidad: number;
}

export interface ItemCarritoResponse {
  id: number;
  producto_id: number;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
  subtotal: number;
}

export interface CarritoResponse {
  id: number;
  estado: string;
  items: ItemCarritoResponse[];
  total: number;
  cantidad_items: number;
}

// --- TIPOS DE COMPRA (Commit 9 y 10) ---

export interface CompraCreate {
  direccion: string;
  tarjeta: string;
}

export interface CompraResponse {
  id: number;
  usuario_id: number;
  fecha: string;
  direccion: string;
  total: number;
  envio: number;
  items: ItemCarritoResponse[]; 
}

export interface CompraResumenResponse {
  id: number;
  fecha: string;
  total: number;
  cantidad_items: number;
}