 
export interface Producto {
  id: number;
  nombre?: string;
  descripcion?: string;
  precio: number;
  categoria?: string;
  valoracion?: number;
  existencia?: number;
  imagen?: string;
}

export interface CompraItem {
  id?: number;
  compra_id?: number;
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio_unitario: number;
}

export interface Compra {
  id: number;
  usuario_id?: number;
  fecha: number; // timestamp
  direccion?: string;
  tarjeta?: string;
  total: number;
  envio: number;
  items?: CompraItem[];
}
