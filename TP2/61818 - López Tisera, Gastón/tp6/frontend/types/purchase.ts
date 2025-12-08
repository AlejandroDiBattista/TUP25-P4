export interface PurchaseItem {
  id: number;
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Purchase {
  id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  envio: number;
  total: number;
  items: PurchaseItem[];
}

