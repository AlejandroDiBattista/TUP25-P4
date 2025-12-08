export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  contraseña?: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  existencia: number;
  imagen?: string;
  activo?: boolean;
}

export interface CarritoItem {
  id?: number;
  carrito_id: number;
  producto_id: number;
  cantidad: number;
  producto?: Producto;
}

export interface Carrito {
  id: number;
  usuario_id: number;
  estado: "activo" | "finalizado" | "cancelado";
  productos?: {
    producto_id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
    imagen?: string;
    existencia?: number;
    categoria?: string;
  }[];
  total?: number;
  // Totales detallados devueltos por backend (opcional)
  subtotal?: number;
  iva?: number;
  envio?: number;
}

export interface CompraItem {
  id?: number;
  compra_id: number;
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Compra {
  id: number;
  usuario_id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  total: number;
  envio: string;
  items?: CompraItem[];
}
