const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type CartViewItem = {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen: string;
  stock_disponible: number;
  max_cantidad: number;
};

export type CartTotals = {
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
};

export type CartView = {
  estado: "abierto" | "finalizado" | "cancelado" | string;
  items: CartViewItem[];
  totals: CartTotals;
};

type FinalizarCompraIn = {
  direccion: string;
  tarjeta: string;
};

async function handleError(res: Response) {
  let msg = "Error del servidor";
  try {
    const txt = await res.text();
    if (txt) {
      try {
        const js = JSON.parse(txt);
        msg = js?.detail || js?.message || txt;
      } catch {
        msg = txt;
      }
    }
  } catch {
    /* ignore */
  }
  throw new Error(msg);
}

export async function getCart(usuarioId: number): Promise<CartView> {
  const res = await fetch(`${API_URL}/carrito?usuario_id=${usuarioId}`, {
    cache: "no-store",
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function addItem(
  usuarioId: number,
  productoId: number,
  cantidad = 1
): Promise<CartView> {
  const res = await fetch(`${API_URL}/carrito?usuario_id=${usuarioId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ producto_id: productoId, cantidad }),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function removeItem(
  usuarioId: number,
  productoId: number
): Promise<CartView> {
  const res = await fetch(
    `${API_URL}/carrito/${productoId}?usuario_id=${usuarioId}`,
    { method: "DELETE" }
  );
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function cancelarCarrito(usuarioId: number): Promise<CartView> {
  const res = await fetch(`${API_URL}/carrito/cancelar?usuario_id=${usuarioId}`, {
    method: "POST",
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function finalizarCompra(
  usuarioId: number,
  data: FinalizarCompraIn
) {
  const res = await fetch(`${API_URL}/carrito/finalizar?usuario_id=${usuarioId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) await handleError(res);
  return res.json(); // CompraOut
}
