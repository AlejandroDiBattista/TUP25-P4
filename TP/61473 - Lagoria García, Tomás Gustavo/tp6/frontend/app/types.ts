// ==================== PRODUCTOS ====================
export interface Producto {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion: number;
  existencia: number;
  imagen: string;
  disponible: boolean;
}

// ==================== AUTENTICACIÓN ====================
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

// ==================== CARRITO ====================
export interface ItemCarrito {
  id: number;
  producto_id: number;
  titulo: string;        // Nombre del producto
  precio: number;        // Precio unitario
  cantidad: number;
  subtotal: number;
  imagen: string;
}

export interface Carrito {
  id: number;
  items: ItemCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export interface AgregarCarritoRequest {
  producto_id: number;
  cantidad: number;
}

// ==================== COMPRAS ====================
export interface CompraCreate {
  direccion: string;
  tarjeta: string;
}

export interface CompraResumen {
  id: number;
  fecha: string;
  total: number;
  cantidad_items: number;
}

export interface ItemCompra {
  id: number;
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  categoria: string;
  imagen: string;
}

export interface CompraDetalle {
  id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  items: ItemCompra[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  cantidad_items: number;
}
