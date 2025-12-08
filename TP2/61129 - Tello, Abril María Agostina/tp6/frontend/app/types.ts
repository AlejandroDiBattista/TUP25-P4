export interface Producto {
  id: number;
  titulo: string;
  nombre?: string;
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion: number;
  existencia: number;
  imagen: string;
}
