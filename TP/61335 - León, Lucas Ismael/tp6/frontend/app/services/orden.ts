const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
import { getToken } from './auth';

export async function verCarrito() {
  const token = getToken();
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/carrito`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudo obtener el carrito');
  return res.json();
}

export async function cancelarCarrito() {
  const token = getToken();
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/carrito/cancelar`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('No se pudo cancelar el carrito');
  const data = await res.json();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart-updated'));
  return data;
}

export async function actualizarCantidad(producto_id: number, cantidad: number) {
  const token = getToken();
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/carrito`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ producto_id, cantidad }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'No se pudo actualizar la cantidad');
  }
  const data = await res.json();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart-updated'));
  return data;
}

export async function finalizarCompra(direccion: string, tarjeta: string) {
  const token = getToken();
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/carrito/finalizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ direccion, tarjeta }),
  });
  if (!res.ok) {
    // Leer mensaje del backend si existe
    let msg = 'No se pudo finalizar la compra';
    try {
      const data = await res.json();
      if (data?.detail) msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } catch {
      try { msg = (await res.text()) || msg; } catch {}
    }
    throw new Error(msg);
  }
  const data = await res.json();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart-updated'));
  return data;
}

export async function listarCompras() {
  const token = getToken();
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/compras`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudo obtener el historial de compras');
  return res.json();
}

export async function detalleCompra(id: number) {
  const token = getToken();
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/compras/${id}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) throw new Error('No se pudo obtener el detalle de la compra');
  return res.json();
}
