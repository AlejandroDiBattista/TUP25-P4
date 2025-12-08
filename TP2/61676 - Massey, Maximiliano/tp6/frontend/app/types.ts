export interface Producto {
  id: number;
  titulo?: string;    // Opcional para compatibilidad
  nombre?: string;    // Opcional para compatibilidad
  precio: number;
  descripcion: string;
  categoria: string;
  valoracion?: number; // Opcional
  existencia: number;
  imagen: string;
}
