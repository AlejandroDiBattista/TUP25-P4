'use client';
import { useEffect, useState } from 'react';
import { getCart, addToCart, subFromCart, removeFromCart, cancelCart, checkout } from '@/app/services/carrito';
import { useRouter } from 'next/navigation';

type Item = {
  producto_id: number;
  nombre?: string;
  titulo?: string;
  cantidad: number;
  precio?: number;
  imagen?: string | null;
  imagen_url?: string | null;
  categoria?: string | null;
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
function toImageUrl(raw?: string | null): string {
  const r = (raw ?? '').toString();
  if (!r) return '';
  if (/^https?:\/\//.test(r) || r.startsWith('//')) return r;
  const path = r.startsWith('/imagenes') ? r : (r.startsWith('imagenes/') ? `/${r}` : `/imagenes/${r.replace(/^\//, '')}`);
  return `${API}${path}`;
}

export default function CarritoPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function calcTotals(list: Item[]) {
    const base = list.reduce((a, it) => a + (Number(it.precio || 0) * it.cantidad), 0);
    const iva = list.reduce((a, it) => {
      const rate = (it.categoria || '').toLowerCase().includes('electr') ? 0.10 : 0.21;
      return a + (Number(it.precio || 0) * it.cantidad * rate);
    }, 0);
    const envio = (base + iva) > 1000 ? 0 : (list.length ? 50 : 0);
    return { total_base: base, iva, envio, total: base + iva + envio };
  }

  const totals = calcTotals(items);

  async function load() {
    const data = await getCart();
    setItems(Array.isArray(data.items) ? data.items : []);
  }

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener('cart:updated', h);
    return () => window.removeEventListener('cart:updated', h);
  }, []);

  async function inc(id: number) {
    if (busy) return;
    setBusy(true);
    try { await addToCart(id, 1); await load(); } finally { setBusy(false); }
  }
  async function dec(id: number) {
    if (busy) return;
    setBusy(true);
    try { await subFromCart(id, 1); await load(); } finally { setBusy(false); }
  }
  async function remove(id: number) {
    if (busy) return;
    setBusy(true);
    try { await removeFromCart(id); await load(); } finally { setBusy(false); }
  }
  async function cancelar() {
    if (busy) return;
    setBusy(true);
    try {
      const ok = await cancelCart(); // Captura el resultado
      if (ok) {
        window.dispatchEvent(new CustomEvent('cart:cancelled')); // Nuevo: Disparar evento si canceló exitosamente
      }
      await load();
    } finally {
      setBusy(false);
    }
  }
  async function pagar() {
    if (busy || items.length === 0) return;
    router.push('/checkout');
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return <div className="p-4 text-sm">Inicia sesión para ver tu carrito.</div>;

  return (
    <aside className="p-4 border rounded-lg space-y-3">
      <h2 className="font-semibold">Carrito</h2>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">Tu carrito está vacío.</div>
      ) : (
        <ul className="space-y-2">
          {items.map(it => {
            const src = toImageUrl(it.imagen_url ?? it.imagen);
            const name = String((it as any).nombre ?? (it as any).titulo ?? `Producto ${it.producto_id}`);
            return (
              <li key={it.producto_id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted/60 rounded overflow-hidden flex-shrink-0">
                  {src ? (
                    <img src={src} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-[10px] text-muted-foreground">Sin imagen</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold leading-snug truncate">
                    {name}
                  </div>
                  <div className="text-xs text-muted-foreground">Cant: {it.cantidad}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => dec(it.producto_id)} disabled={busy}>−</button>
                  <button className="px-2 py-1 border rounded" onClick={() => inc(it.producto_id)} disabled={busy}>+</button>
                  <button className="px-2 py-1 border rounded text-red-600" onClick={() => remove(it.producto_id)} disabled={busy}>Quitar</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="text-sm space-y-1">
        <div>Subtotal: ${totals.total_base.toFixed(2)}</div>
        <div>IVA: ${totals.iva.toFixed(2)}</div>
        <div>Envío: ${totals.envio.toFixed(2)}</div>
        <div className="font-semibold">Total: ${totals.total.toFixed(2)}</div>
      </div>

      <div className="flex gap-2">
        <button onClick={cancelar} disabled={busy} className="px-3 py-2 border rounded">Cancelar</button>
        <button onClick={pagar} disabled={busy || items.length === 0} className="px-3 py-2 border rounded bg-black text-white">Pagar</button>
      </div>
    </aside>
  );
}