export interface Producto {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion: number;
  existencia: number;
  imagen: string;
}

export interface Usuario {
  nombre: string;
  email: string;
}

export interface ItemCarrito {
  id: number;
  producto_id: number;
  titulo: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  iva: number;
  imagen: string;
}

export interface Carrito {
  items: ItemCarrito[];
  subtotal: number;
  iva: number;
  total: number;
}

export interface CompraItem {
  producto_id: number;
  titulo: string;
  imagen?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Compra {
  id: number;
  usuario_id: number;
  fecha: string;
  total: number;
  direccion: string;
  estado: string;
  items: CompraItem[];
}

export interface CompraResumen {
  id: number;
  fecha: string;
  total: number;
  estado: string;
}
