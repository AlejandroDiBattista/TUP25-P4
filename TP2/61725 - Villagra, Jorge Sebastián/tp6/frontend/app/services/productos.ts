const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export type Producto = {
  id: number;
  nombre?: string | null;
  titulo?: string | null;
  descripcion?: string | null;
  precio: number;
  imagen?: string | null;
};

export async function obtenerProductos(): Promise<Producto[]> {
  const res = await fetch(`${API_URL}/productos`, { cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudieron cargar los productos');
  return res.json();
}
