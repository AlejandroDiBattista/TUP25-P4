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

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  token?: string;
}

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

export interface Compra {
  id: number;
  usuario_id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  total: number;
  envio: number;
  items: {
    producto_id: number;
    nombre: string;
    precio_unitario: number;
    cantidad: number;
  }[];
}
