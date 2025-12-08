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
  id: number;
  nombre: string;
  email: string;
}

export interface CarritoItem {
  id: number;
  cantidad: number;
  producto_id: number;
  producto: Producto;
}

export interface Carrito {
  id: number;
  usuario_id: number;
  items: CarritoItem[];
}

export interface ItemCompra {
  id: number;
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Compra {
  id: number;
  usuario_id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  total: number;
  envio: number;
  iva: number;
  items: ItemCompra[];
}
