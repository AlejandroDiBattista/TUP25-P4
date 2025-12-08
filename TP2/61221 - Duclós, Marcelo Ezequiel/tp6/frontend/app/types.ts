export interface Producto {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion?: number;
  existencia: number;
  imagen: string;
  disponible: boolean;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  fecha_registro: string;
}

export interface ItemCarrito {
  id: number;
  producto_id: number;
  cantidad: number;
  subtotal: number;
  fecha_agregado: string;
  producto?: Producto;
}

export interface Carrito {
  id: number;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  total_items: number;
  subtotal: number;
  items: ItemCarrito[];
}

export interface Compra {
  id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  subtotal: number;
  descuento: number;
  iva: number;
  envio: number;
  total: number;
}

export interface CompraItem {
  id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  nombre: string;
  categoria: string;
  producto?: Producto;
}

export interface CompraDetallada {
  id: number;
  fecha: string;
  fecha_compra?: string;
  direccion: string;
  tarjeta: string;
  subtotal: number;
  descuento: number;
  iva: number;
  envio: number;
  total: number;
  items: CompraItem[];
  total_items: number;
}
