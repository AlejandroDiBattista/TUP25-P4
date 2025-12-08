"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const CART_KEY = 'tp6_cart';
const CART_SYNC_KEY = 'tp6_cart_synced';

interface CartEntry {
  producto_id: number;
  cantidad: number;
}

interface CartItemUI extends CartEntry {
  producto: {
    id: number;
    nombre: string;
    descripcion?: string | null;
    precio: number;
    categoria?: string | null;
    imagen?: string | null;
  } | null;
}

const ivaRateFor = (categoria?: string | null) => (categoria?.toLowerCase().startsWith('electr') ? 0.1 : 0.21);
const buildProductoFromServer = (item: any) => ({
  id: item.producto_id,
  nombre: item.nombre ?? `Producto ${item.producto_id}`,
  descripcion: item.descripcion ?? '',
  precio: Number(item.precio_unitario ?? 0),
  categoria: item.categoria ?? '',
  imagen: item.imagen ?? null,
});

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemUI[]>([]);
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async (entry: CartEntry): Promise<CartItemUI> => {
      try {
        const res = await fetch(`${API_URL}/productos/${entry.producto_id}`);
        if (!res.ok) return { ...entry, producto: null };
        const producto = await res.json();
        return { ...entry, producto };
      } catch (error) {
        console.warn('No se pudo obtener producto', entry.producto_id, error);
        return { ...entry, producto: null };
      }
    };

    const enrichLocal = async (entries: CartEntry[]) => Promise.all(entries.map(fetchProduct));

    const syncLocalToBackend = async (token: string, entries: CartEntry[]) => {
      if (!entries.length) return;
      await Promise.all(entries.map(async ({ producto_id, cantidad }) => {
        try {
          await fetch(`${API_URL}/carrito/${producto_id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => undefined);
          if (cantidad > 0) {
            const resp = await fetch(`${API_URL}/carrito/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ producto_id, cantidad })
            });
            if (!resp.ok) {
              const txt = await resp.text().catch(() => '');
              console.warn('Sync checkout local->backend falló', producto_id, resp.status, txt);
            }
          }
        } catch (error) {
          console.warn('Sync checkout local->backend error', producto_id, error);
        }
      }));
    };

    const fetchServerCart = async (token: string): Promise<CartItemUI[]> => {
      try {
        const res = await fetch(`${API_URL}/carrito/`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          console.warn('No se pudo obtener carrito para checkout', res.status);
          return [];
        }
        const data = await res.json();
        return (data.items ?? []).map((it: any) => ({
          producto_id: it.producto_id,
          cantidad: Number(it.cantidad ?? 0),
          producto: buildProductoFromServer(it),
        }));
      } catch (error) {
        console.warn('Error cargando carrito backend', error);
        return [];
      }
    };

    const load = async () => {
      const raw = localStorage.getItem(CART_KEY);
      const synced = localStorage.getItem(CART_SYNC_KEY);
      const localEntries: CartEntry[] = raw ? JSON.parse(raw) : [];
      const token = localStorage.getItem('tp6_token');

      if (token) {
        if (localEntries.length && synced !== '1') {
          await syncLocalToBackend(token, localEntries);
          localStorage.setItem(CART_SYNC_KEY, '1');
        }
        const serverItems = await fetchServerCart(token);
        if (mounted) {
          setItems(serverItems);
          localStorage.setItem(CART_KEY, JSON.stringify(serverItems.map(({ producto_id, cantidad }) => ({ producto_id, cantidad }))));
          localStorage.setItem(CART_SYNC_KEY, '1');
        }
        return;
      }

      const enriched = await enrichLocal(localEntries);
      if (mounted) {
        setItems(enriched);
        if (localEntries.length) {
          localStorage.setItem(CART_SYNC_KEY, '0');
        } else {
          localStorage.removeItem(CART_SYNC_KEY);
        }
      }
    };

    load();

    return () => { mounted = false; };
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, it) => {
    const precio = Number(it.producto?.precio ?? 0);
    return sum + precio * Number(it.cantidad ?? 0);
  }, 0), [items]);

  const iva = useMemo(() => items.reduce((sum, it) => {
    const precio = Number(it.producto?.precio ?? 0);
    const rate = ivaRateFor(it.producto?.categoria);
    return sum + precio * Number(it.cantidad ?? 0) * rate;
  }, 0), [items]);

  const totalConIva = subtotal + iva;
  const envio = totalConIva >= 1000 ? 0 : (subtotal > 0 ? 50 : 0);
  const total = totalConIva + envio;

  const confirmar = async () => {
    const token = localStorage.getItem('tp6_token');
    if (!token) { alert('Debes iniciar sesión para continuar'); router.push('/login'); return; }
    if (items.length === 0) { alert('El carrito está vacío'); router.push('/cart'); return; }
    setLoading(true);
    const payload = { direccion: direccion || 'No indicada', tarjeta: tarjeta || '0000000000000000' };
    try {
      
      try {
        await Promise.all(items.map(async (it: any) => {
          const body = { producto_id: it.producto_id, cantidad: Number(it.cantidad ?? 0) };
          await fetch(`${API_URL}/carrito/${body.producto_id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => undefined);
          if (body.cantidad > 0) {
            const r = await fetch(`${API_URL}/carrito/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(body)
            });
            if (!r.ok) {
              const txt = await r.text().catch(() => '');
              console.warn('sync carrito item failed', it.producto_id, r.status, txt);
            }
          }
        }));
      } catch (syncErr) {
        console.error('Error sincronizando carrito con el servidor', syncErr);
        // continue to attempt finalize, as backend may still accept
      }
      const res = await fetch(`${API_URL}/carrito/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text();
        alert('Error al finalizar: ' + txt);
        console.error('finalizar', res.status, txt);
        setLoading(false);
        return;
      }
      const data = await res.json();
      alert('Compra realizada. Total: ' + data.total);
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(CART_SYNC_KEY);
      router.push('/');
    } catch (e) {
      console.error('Error en confirmar', e);
      alert('Error en la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Finalizar compra</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Resumen del carrito</h2>
          {items.length === 0 ? (
            <div className="text-sm text-gray-600">El carrito está vacío</div>
          ) : (
            <div>
              {items.map((it: CartItemUI) => {
                const producto = it.producto as any;
                const title = producto?.titulo ?? producto?.nombre ?? `Producto ${it.producto_id}`;
                const cantidad = Number(it.cantidad ?? 0);
                const precio = Number(producto?.precio ?? 0);
                const linea = precio * cantidad;
                const rate = ivaRateFor(producto?.categoria);
                const ivaLinea = linea * rate;
                return (
                  <div key={it.producto_id} className="py-3 border-b last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{title}</div>
                        <div className="text-sm text-gray-600">Cantidad: {cantidad}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${linea.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">IVA ({Math.round(rate * 100)}%): ${ivaLinea.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 text-sm text-gray-700">
                <div>Total productos: ${subtotal.toFixed(2)}</div>
                <div>IVA: ${iva.toFixed(2)}</div>
                <div>Envío: ${envio.toFixed(2)}</div>
                <div className="mt-3 font-bold text-lg">Total a pagar: ${total.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>

        <aside className="md:col-span-1 bg-white rounded-lg p-6 shadow">
          <h3 className="font-semibold mb-4">Datos de envío</h3>
          <label className="block text-sm text-gray-700">Dirección</label>
          <input value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" placeholder="Dirección" />
          <label className="block text-sm text-gray-700">Tarjeta</label>
          <input value={tarjeta} onChange={e => setTarjeta(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" placeholder="Número de tarjeta" />
          <button onClick={confirmar} disabled={loading || items.length === 0} className={`w-full py-2 rounded text-white ${items.length === 0 ? 'bg-gray-300' : 'bg-black'}`}>
            {loading ? 'Procesando...' : 'Confirmar compra'}
          </button>
        </aside>
      </div>
    </div>
  );
}
