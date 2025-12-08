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
}

export interface SesionData {
  usuario: Usuario;
  token: string;
}

export interface ItemCarrito {
  id: number;
  carrito_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
}

export interface Carrito {
  id: number;
  usuario_id: number;
  estado: string;
  items: ItemCarrito[];
}

export interface ItemCompra {
  id: number;
  compra_id: number;
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio_unitario: number;
}

export interface Compra {
  id: number;
  usuario_id: number;
  fecha: string;
  direccion: string;
  total: number;
  envio: number;
  iva: number;
  tarjeta_ultimos_digitos: string;
  items: ItemCompra[];
}
