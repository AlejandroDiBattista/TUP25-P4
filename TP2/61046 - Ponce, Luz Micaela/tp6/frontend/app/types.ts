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

export interface CompraItem {
  cantidad: number;
  nombre: string;
  precio_unitario: number;
  producto_id: number;
}

export interface Compra {
  id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  total: number;
  envio: number;
  usuario_id: number;
  productos: CompraItem[];
}

export type CompraResumen = Omit<Compra, 'productos'>;