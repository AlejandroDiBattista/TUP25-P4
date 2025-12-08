export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  existencia: number;
  imagen?: string;
  valoracion?: number;
  titulo?: string;
}

export interface UsuarioPublico {
  id: number;
  nombre: string;
  email: string;
}

export interface CredencialesIngreso {
  email: string;
  password: string;
}

export interface DatosRegistro extends CredencialesIngreso {
  nombre: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UsuarioSesion {
  id: number;
  nombre?: string;
  email?: string;
}

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export type EstadoCarrito = "abierto" | "finalizado";

export interface Carrito {
  id: number;
  estado: EstadoCarrito;
  total: number;
  items: ItemCarrito[];
}

export interface CheckoutPayload {
  direccion: string;
  tarjeta: string;
}

export interface CheckoutResponse {
  compra_id: number;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export interface ItemCompra {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface CompraResumen {
  id: number;
  fecha: string;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  cantidad_items: number;
  direccion?: string;
  tarjeta?: string;
}

export interface CompraDetalle extends CompraResumen {
  items: ItemCompra[];
}
