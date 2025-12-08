import { Producto } from '../types';

// Base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Respuesta estándar del backend
interface ProductosResponse { value: Producto[]; Count: number; }

// Parámetros de filtrado
interface ObtenerProductosOpciones { q?: string; categoria?: string; }

// Construye querystring
function buildQuery(params: ObtenerProductosOpciones): string {
  const usp = new URLSearchParams();
  if (params.q) usp.set('q', params.q);
  if (params.categoria) usp.set('categoria', params.categoria);
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

// Obtiene productos filtrados
export async function obtenerProductos(opts: ObtenerProductosOpciones = {}): Promise<Producto[]> {
  const query = buildQuery(opts);
  const response = await fetch(`${API_URL}/productos${query}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Error al obtener productos');
  const data = await response.json();
  // Soporta array directo o objeto envoltorio
  if (Array.isArray(data)) return data as Producto[];
  if ('value' in data) return (data as ProductosResponse).value;
  return [];
}
