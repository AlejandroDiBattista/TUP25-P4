export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion?: number;
  existencia: number;
  imagen?: string;
}
