export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  categoria?: string;
  valoracion?: number;
  stock: number;
  imagen?: string;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
}

export interface CarritoItem {
  id: number;
  usuario_id: number;
  producto_id: number;
  cantidad: number;
  producto?: Producto;
}

export interface Compra {
  id: number;
  fecha: string;
  total: number;
  direccion: string;
}

export interface CompraDetalle extends Compra {
  tarjeta: string;
  subtotal: number;
  iva: number;
  envio: number;
  items: CompraItemDetalle[];
}

export interface CompraItemDetalle {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface CompraItem {
  producto_id: number;
  cantidad: number;
  subtotal: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
}
