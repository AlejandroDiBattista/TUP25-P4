const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function safeCart() {
  return { items: [], total_base: 0, iva: 0, envio: 0, total: 0 };
}

export async function getCart() {
  try {
    const res = await fetch(`${API}/carrito`, { headers: { ...authHeaders() }, cache: 'no-store' });
    if (!res.ok) return safeCart();
    return await res.json();
  } catch {
    return safeCart();
  }
}

export async function addToCart(productoId: number, cantidad = 1) {
  try {
    const res = await fetch(`${API}/carrito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ producto_id: productoId, cantidad }),
    });
    const ok = res.ok;
    if (ok) window.dispatchEvent(new CustomEvent('cart:updated'));
    return ok;
  } catch {
    return false;
  }
}

export async function subFromCart(productoId: number, cantidad = 1) {
  try {
    const res = await fetch(`${API}/carrito/restar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ producto_id: productoId, cantidad }),
    });
    const ok = res.ok;
    if (ok) window.dispatchEvent(new CustomEvent('cart:updated'));
    return ok;
  } catch {
    return false;
  }
}

export async function removeFromCart(productoId: number) {
  try {
    const res = await fetch(`${API}/carrito/${productoId}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    const ok = res.ok;
    if (ok) window.dispatchEvent(new CustomEvent('cart:updated'));
    return ok;
  } catch {
    return false;
  }
}

export async function cancelCart() {
  try {
    const res = await fetch(`${API}/carrito/cancelar`, {
      method: 'POST',
      headers: { ...authHeaders() },
    });
    const ok = res.ok;
    if (ok) window.dispatchEvent(new CustomEvent('cart:updated'));
    return ok;
  } catch {
    return false;
  }
}

export async function checkout(direccion = '', tarjeta = '') {
  try {
    const res = await fetch(`${API}/carrito/finalizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ direccion, tarjeta }),
    });
    const data = await res.json().catch(() => ({}));
    const ok = res.ok;
    if (ok) window.dispatchEvent(new CustomEvent('cart:updated'));
    return { ok, data };
  } catch {
    return { ok: false, data: {} };
  }
}