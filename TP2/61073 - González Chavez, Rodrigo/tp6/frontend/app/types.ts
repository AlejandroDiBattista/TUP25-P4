export interface Producto {
  id: number;
  precio: number;
  existencia: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  valoracion: number;
  imagen: string;
}

export interface AuthState {
    token: string | null
    usuario: string | null
    iniciarSesion: (token: string, usuario: string) => void
    cerrarSesion: () => void
}

export interface ItemCarrito {
    producto: Producto
    cantidad: number
}

export interface Compra {
  id: number
  fecha: string
  direccion: string
  tarjeta: string
  total: number
  envio: number
}

export interface ItemCompra {
  id: number
  nombre: string
  cantidad: number
  precio_unitario: number
  categoria?: string
}

export interface DetalleCompra {
  Mensaje: string
  compra_id: number
  total: number
  subtotal: number
  iva_total: number
  envio: number
  tarjeta: string
}

export interface ProductoCarrito {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  imagen?: string;
}

export interface CarritoResponse {
  productos: ProductoCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export interface MensajeResponse {
  mensaje: string;
}

export interface CarritoState {
  productos: ProductoCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  cargando: boolean;
  cargarCarrito: () => Promise<void>;
  agregarProducto: (producto_id: number) => Promise<void>;
  aumentarCantidad: (producto_id: number) => Promise<void>;
  disminuirCantidad: (producto_id: number) => Promise<void>;
  eliminarProducto: (producto_id: number) => Promise<void>;
  cancelarCarrito: () => Promise<void>;
  finalizarCompra: (direccion: string, tarjeta: string) => Promise<void>;
}
