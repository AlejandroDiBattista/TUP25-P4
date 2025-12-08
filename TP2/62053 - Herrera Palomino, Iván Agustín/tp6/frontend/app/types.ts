// app/types.ts
export interface Producto {
  id: number;
  nombre?: string;
  descripcion?: string;
  precio: number;
  categoria?: string;
  valoracion?: number;
  existencia?: number;
  imagen?: string;
}