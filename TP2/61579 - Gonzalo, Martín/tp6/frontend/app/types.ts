// Producto
export interface Producto {
  id: number;
  titulo: string; 
  descripcion: string;
  precio: number;
  categoria: string;
  valoracion: number;
  existencia: number;
  imagen?: string;
}

// Usuario
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

// Token
export interface Token {
  access_token: string;
  token_type: string;
}

// Carrito
export interface CarritoItem {
  id: number;
  usuario_id: number;
  producto_id: number;
  cantidad: number;
}

// Compra
export interface CompraItem {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
}

export interface Compra {
  id: number;
  fecha: string;
  direccion: string;
  total: number;
  items: CompraItem[];
}

// Solicitudes
export interface UserRegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface CarritoItemRequest {
  producto_id: number;
  cantidad: number;
}

export interface CheckoutRequest {
  direccion: string;
  tarjeta: string;
}
