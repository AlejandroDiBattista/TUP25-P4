import { authFetch } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function agregarAlCarrito(product_id: number, cantidad = 1) {
  const resp = await authFetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id, cantidad }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(txt || 'Error al agregar al carrito');
  }
  return resp.json();
}

export async function verCarrito() {
  const resp = await authFetch(`${API_URL}/carrito`);
  // Si no está autenticado, devolver carrito vacío en el cliente en lugar de lanzar
  if (resp.status === 401) {
    return { items: [] };
  }
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(txt || 'Error al obtener carrito');
  }
  return resp.json();
}

export async function quitarDelCarrito(product_id: number) {
  const resp = await authFetch(`${API_URL}/carrito/${product_id}`, { method: 'DELETE' });
  if (!resp.ok) throw new Error('Error al quitar producto');
  return resp.json();
}

export async function ajustarCantidad(product_id: number, cantidad: number) {
  const resp = await authFetch(`${API_URL}/carrito/${product_id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(txt || 'Error al ajustar cantidad');
  }
  return resp.json();
}

export async function finalizarCompra(direccion: string, tarjeta: string) {
  const resp = await authFetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direccion, tarjeta }),
  });
  if (!resp.ok) throw new Error('Error al finalizar compra');
  return resp.json();
}

export async function cancelarCompra() {
  const resp = await authFetch(`${API_URL}/carrito/cancelar`, { method: 'POST' });
  if (!resp.ok) throw new Error('Error al cancelar');
  return resp.json();
}
