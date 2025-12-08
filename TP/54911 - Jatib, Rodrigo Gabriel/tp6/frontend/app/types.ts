export interface Producto {
  id: number;
  titulo: string;
  // some backends use `nombre` instead of `titulo` — accept either
  nombre?: string;
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion: number;
  existencia: number;
  imagen: string;
}
