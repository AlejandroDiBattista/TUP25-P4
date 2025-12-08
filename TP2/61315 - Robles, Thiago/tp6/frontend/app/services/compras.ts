import { Compra, CompraItem } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Finalizar compra: usa token para identificar usuario
export const finalizarCompra = async (
  _usuarioId: number | string, // mantenido por compatibilidad, ignorado
  direccion: string,
  tarjeta: string
): Promise<{
  compra_id: number;
  total: number; // total final = subtotal + iva + envio
  subtotal: number;
  iva: number;
  envio: number;
}> => {
  const body = { direccion, tarjeta };
  const resp = await fetch(`${API_URL}/carrito/finalizar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`Error al finalizar compra (${resp.status})`);
  const data = await resp.json();
  return {
    compra_id: data.compra_id,
    total: data.total,
    subtotal: data.subtotal,
    iva: data.iva,
    envio: data.envio,
  };
};

export const cancelarCarrito = async (): Promise<void> => {
  const resp = await fetch(`${API_URL}/carrito/cancelar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!resp.ok) throw new Error(`Error al cancelar carrito (${resp.status})`);
};

// Listado de compras del usuario (token)
export const obtenerCompras = async (): Promise<Compra[]> => {
  const resp = await fetch(`${API_URL}/compras`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!resp.ok) throw new Error(`Error al obtener compras (${resp.status})`);
  const raw: Array<{
    id: number;
    usuario_id: number;
    fecha: string;
    direccion: string;
    tarjeta: string;
    total: number;
    envio: number;
  }> = await resp.json();
  return raw.map((c) => ({
    id: c.id,
    usuario_id: c.usuario_id,
    fecha: c.fecha,
    direccion: c.direccion,
    tarjeta: c.tarjeta,
    total: c.total,
    envio: String(c.envio),
  })) as Compra[];
};

// Detalle de una compra específica (token)
export const obtenerCompraDetalle = async (
  compraId: number | string
): Promise<Compra> => {
  const resp = await fetch(`${API_URL}/compras/${compraId}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!resp.ok) throw new Error(`Error al obtener compra (${resp.status})`);
  const c: {
    id: number;
    usuario_id: number;
    fecha: string;
    direccion: string;
    tarjeta: string;
    total: number;
    envio: number;
    estado?: string;
    items?: Array<{
      id: number;
      compra_id: number;
      producto_id: number;
      nombre: string;
      cantidad: number;
      precio_unitario: number;
    }>;
  } = await resp.json();
  const items: CompraItem[] = (c.items ?? []).map((it) => ({
    id: it.id,
    compra_id: it.compra_id,
    producto_id: it.producto_id,
    nombre: it.nombre,
    cantidad: it.cantidad,
    precio_unitario: it.precio_unitario,
  }));
  return {
    id: c.id,
    usuario_id: c.usuario_id,
    fecha: c.fecha,
    direccion: c.direccion,
    tarjeta: c.tarjeta,
    total: c.total,
    envio: String(c.envio),
    items,
  } as Compra;
};
