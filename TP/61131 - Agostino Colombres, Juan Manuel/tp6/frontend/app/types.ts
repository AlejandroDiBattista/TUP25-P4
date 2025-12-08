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

export interface RegistroForm {
  nombre: string;
  email: string;
  password: string;
}

export interface RegistroResponse {
  id: number;
  nombre: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  nombre: string;
  token_type: string;
}

export interface CompraItemPayload {
  producto_id: number;
  cantidad: number;
}

export interface CompraRequest {
  direccion: string;
  tarjeta: string;
  items: CompraItemPayload[];
}

export interface CompraResponse {
  id: number;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export interface CompraItemResponse {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  categoria?: string | null;
}

export interface CompraDetalleResponse {
  id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  items: CompraItemResponse[];
}
