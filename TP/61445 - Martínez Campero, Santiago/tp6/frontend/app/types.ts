export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  existencia: number;
  valoracion: number;
  imagen: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_creacion?: string;
  fecha_registro?: string;
}

export interface ItemCarrito {
  id: number;
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  precio_total: number;
  imagen: string;
}

export interface Carrito {
  id: number;
  estado: string;
  items: ItemCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface ItemCompra {
  id: number;
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  precio_total: number;
  imagen: string;
}

export interface Compra {
  id: number;
  usuario_id: number;
  fecha: string;
  estado: string;
  items: ItemCompra[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}
