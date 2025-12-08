/**
 * Servicio de compras para comunicarse con el backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ItemCompra {
  id: number;
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio_unitario: number;
  subtotal: number;
  imagen: string;
}

export interface CompraResumen {
  id: number;
  fecha: string;
  total: number;
  envio: number;
  direccion: string;
  cantidad_productos: number;
}

export interface CompraDetalle {
  id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  total: number;
  subtotal: number;
  iva: number;
  envio: number;
  items: ItemCompra[];
}

export interface HistorialResponse {
  compras: CompraResumen[];
  total_compras: number;
  mensaje?: string;
}

/**
 * Obtener historial de compras del usuario
 */
export async function obtenerHistorialCompras(token: string): Promise<HistorialResponse> {
  const response = await fetch(`${API_URL}/compras`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener historial de compras');
  }

  return response.json();
}

/**
 * Obtener detalle de una compra específica
 */
export async function obtenerDetalleCompra(
  token: string,
  compraId: number
): Promise<CompraDetalle> {
  const response = await fetch(`${API_URL}/compras/${compraId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener detalle de compra');
  }

  return response.json();
}
