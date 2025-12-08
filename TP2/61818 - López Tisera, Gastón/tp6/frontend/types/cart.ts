export interface CartItem {
  id: number;
  producto_id: number;
  cantidad: number;
}

export interface Cart {
  id: number;
  estado: string;
  created_at: string;
  updated_at: string;
  items: CartItem[];
}

export interface CartTotals {
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export interface CartItemPayload {
  producto_id: number;
  cantidad: number;
}

export interface CheckoutPayload {
  direccion: string;
  tarjeta: string;
}

