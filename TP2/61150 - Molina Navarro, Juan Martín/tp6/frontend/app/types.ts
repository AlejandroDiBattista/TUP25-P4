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

export interface CarritoItem {
  producto_id: number;
  titulo: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  categoria: string;
  imagen: string;
}

export interface CarritoDetalle {
  items: CarritoItem[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export interface Compra {
  id: number;
  fecha: string;
  direccion: string;
  tarjeta_final: string;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  items: CarritoItem[];
}
