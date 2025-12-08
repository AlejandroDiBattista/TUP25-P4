export interface Producto {
    id: number;
    titulo: string;
    descripcion: string;
    precio: number;
    categoria: string;
    existencia: number;
    imagen: string;
}

export interface ItemCarritoRead {
    producto: Producto;
    cantidad: number;
}

export interface CarritoRead {
    items: ItemCarritoRead[];
    subtotal: number;
    costo_envio: number;
    iva: number;
    total: number;
}

export interface ItemCompraRead {
    nombre: string;
    cantidad: number;
    precio_unitario: number;
}

export interface CompraRead {
    id: number;
    fecha: string; // O Date
    total: number;
    items: ItemCompraRead[];
}

export interface UsuarioCreate {
    nombre: string;
    email: string;
    password: str
}

export interface UsuarioRead {
    id: number;
    nombre: string;
    email: string;
}

export interface FinalizarCompraRequest {
    direccion: string;
    tarjeta: string;
}