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

export interface ItemCarrito {
  id: number;
  producto_id: number;
  titulo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  categoria: string;
  subtotal: number;
}

export interface Carrito {
  items: ItemCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export interface ItemCompra {
  id: number;
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

export interface Compra {
  id: number;
  usuario_id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  total: number;
  envio: number;
  items?: ItemCompra[];
}
