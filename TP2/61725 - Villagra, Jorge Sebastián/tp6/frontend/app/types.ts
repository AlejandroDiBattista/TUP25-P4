export type Producto = {
  id: number;
  nombre?: string | null;        // puede venir como 'nombre'
  titulo?: string | null;        // o como 'titulo'
  descripcion?: string | null;
  categoria?: string | null;
  precio: number;
  existencia?: number | null;
  imagen?: string | null;
  imagen_url?: string | null;
  agotado?: boolean;
};
