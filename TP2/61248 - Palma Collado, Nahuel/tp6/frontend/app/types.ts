export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion?: number | null;
  existencia: number;
  imagen?: string | null;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expira_en: string;
}

export interface CarritoItem {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  categoria: string;
  imagen?: string | null;
  valoracion?: number | null;
}

export interface CarritoDetalle {
  id: number;
  estado: string;
  total_items: number;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  items: CarritoItem[];
}

export interface CompraResumen {
  id: number;
  fecha: string;
  total: number;
  envio: number;
  subtotal: number;
  iva: number;
  direccion: string;
}

export interface CompraDetalle extends CompraResumen {
  items: CarritoItem[];
}

export interface CompraFinalizada {
  compra: CompraDetalle;
  carrito: CarritoDetalle;
}
