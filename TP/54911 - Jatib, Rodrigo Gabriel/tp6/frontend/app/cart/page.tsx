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

const ivaRateFor = (categoria?: string | null) => {
  const value = (categoria || '').toLowerCase();
  return value.startsWith('electr') ? 0.1 : 0.21;
};

const buildProductoFromServer = (item: any) => ({
  id: item.producto_id,
  nombre: item.nombre ?? `Producto ${item.producto_id}`,
  descripcion: item.descripcion ?? '',
  precio: Number(item.precio_unitario ?? 0),
  categoria: item.categoria ?? '',
  imagen: item.imagen ?? null,
});

export default function CartPage() {
  const [items, setItems] = useState<CartItemUI[]>([]);
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const router = useRouter();

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
              console.warn('Sync local->backend falló', producto_id, resp.status, txt);
            }
          }
        } catch (error) {
          console.warn('Sync local->backend error', producto_id, error);
        }
      }));
    };

    const fetchServerCart = async (token: string): Promise<CartItemUI[]> => {
      try {
        const res = await fetch(`${API_URL}/carrito/`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          console.warn('No se pudo cargar carrito desde backend', res.status);
          return [];
        }
        const data = await res.json();
        return (data.items ?? []).map((it: any) => ({
          producto_id: it.producto_id,
          cantidad: Number(it.cantidad ?? 0),
          producto: buildProductoFromServer(it),
        }));
      } catch (error) {
        console.warn('Error consultando carrito backend', error);
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

  const refreshBackendCart = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/carrito/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      const nextItems: CartItemUI[] = (data.items ?? []).map((it: any) => ({
        producto_id: it.producto_id,
        cantidad: Number(it.cantidad ?? 0),
        producto: buildProductoFromServer(it),
      }));
      setItems(nextItems);
      localStorage.setItem(CART_KEY, JSON.stringify(nextItems.map(({ producto_id, cantidad }) => ({ producto_id, cantidad }))));
      localStorage.setItem(CART_SYNC_KEY, '1');
    } catch (error) {
      console.warn('No se pudo refrescar carrito backend', error);
    }
  };

  const persistLocal = async (entries: CartEntry[]) => {
    if (entries.length) {
      localStorage.setItem(CART_KEY, JSON.stringify(entries));
      localStorage.setItem(CART_SYNC_KEY, '0');
    } else {
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(CART_SYNC_KEY);
    }
    const enriched = await Promise.all(entries.map(async entry => {
      const cached = items.find(it => it.producto_id === entry.producto_id && it.producto);
      if (cached && cached.producto) {
        return { ...entry, producto: cached.producto } as CartItemUI;
      }
      try {
        const res = await fetch(`${API_URL}/productos/${entry.producto_id}`);
        if (!res.ok) return { ...entry, producto: null } as CartItemUI;
        const producto = await res.json();
        return { ...entry, producto } as CartItemUI;
      } catch (error) {
        return { ...entry, producto: null } as CartItemUI;
      }
    }));
    setItems(enriched);
  };

  const remove = async (producto_id: number) => {
    const token = localStorage.getItem('tp6_token');
    if (token) {
      await fetch(`${API_URL}/carrito/${producto_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(error => console.warn('Error eliminando item backend', error));
      await refreshBackendCart(token);
      return;
    }
    const next = items
      .filter(it => it.producto_id !== producto_id)
      .map(it => ({ producto_id: it.producto_id, cantidad: Number(it.cantidad) }));
    await persistLocal(next);
  };

  const changeQuantity = async (producto_id: number, delta: number) => {
    const token = localStorage.getItem('tp6_token');
    if (token) {
      const current = items.find(it => it.producto_id === producto_id);
      const nextQty = Math.max(0, Number(current?.cantidad ?? 0) + delta);
      await fetch(`${API_URL}/carrito/${producto_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => undefined);
      if (nextQty > 0) {
        await fetch(`${API_URL}/carrito/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ producto_id, cantidad: nextQty })
        }).catch(error => console.warn('Error actualizando cantidad', error));
      }
      await refreshBackendCart(token);
      return;
    }

    const nextEntries: CartEntry[] = items
      .map(it => it.producto_id === producto_id
        ? { producto_id, cantidad: Math.max(0, Number(it.cantidad) + delta) }
        : { producto_id: it.producto_id, cantidad: Number(it.cantidad) })
      .filter(entry => entry.cantidad > 0);
    await persistLocal(nextEntries);
  };

  const clearCart = async () => {
    const token = localStorage.getItem('tp6_token');
    if (token) {
      await fetch(`${API_URL}/carrito/cancelar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(error => console.warn('Error cancelando carrito', error));
      await refreshBackendCart(token);
      return;
    }
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(CART_SYNC_KEY);
    setItems([]);
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => {
    const precio = Number(item.producto?.precio ?? 0);
    return sum + precio * Number(item.cantidad ?? 0);
  }, 0), [items]);

  const iva = useMemo(() => items.reduce((sum, item) => {
    const precio = Number(item.producto?.precio ?? 0);
    const rate = ivaRateFor(item.producto?.categoria);
    return sum + precio * Number(item.cantidad ?? 0) * rate;
  }, 0), [items]);

  const totalConIva = subtotal + iva;
  const envio = totalConIva >= 1000 ? 0 : (subtotal > 0 ? 50 : 0);
  const total = totalConIva + envio;

  const finalizar = async () => {
    const token = localStorage.getItem('tp6_token');
    if (!token) {
      alert('Debes iniciar sesión para finalizar');
      return;
    }
    const payload = {
      direccion: direccion.trim() !== '' ? direccion : 'No indicada',
      tarjeta: tarjeta.trim() !== '' ? tarjeta : '0000000000000000'
    };

    const res = await fetch(`${API_URL}/carrito/finalizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      alert(`Error al finalizar: ${txt}`);
      console.error('finalizar error', res.status, txt);
      return;
    }
    const data = await res.json();
    alert(`Compra realizada: $${Number(data.total ?? 0).toFixed(2)}`);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(CART_SYNC_KEY);
    setItems([]);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-lg">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Carrito</h2>
          {items.length === 0 ? (
            <div className="p-4 bg-white rounded shadow">El carrito está vacío</div>
          ) : (
            items.map(item => {
              const producto = item.producto as any;
              const title = producto?.titulo ?? producto?.nombre ?? `Producto ${item.producto_id}`;
              const descripcion = producto?.descripcion ?? '';
              const precio = Number(producto?.precio ?? 0);
              const linea = precio * Number(item.cantidad ?? 0);
              return (
                <div key={item.producto_id} className="p-4 bg-white rounded shadow flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Product image */}
                    <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {(() => {
                        const imgField = producto?.imagen ?? producto?.image ?? null;
                        if (!imgField) return (<div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No imagen</div>);
                        const isAbsolute = String(imgField).startsWith('http');
                        const src = isAbsolute ? String(imgField) : `${API_URL}/${String(imgField).replace(/^\//, '')}`;
                        // eslint-disable-next-line @next/next/no-img-element
                        return <img src={src} alt={title} className="w-full h-full object-cover" />;
                      })()}
                    </div>
                    <div>
                      <div className="font-semibold text-black">{title}</div>
                      {descripcion ? <div className="text-sm text-gray-600">{descripcion}</div> : null}
                      <div className="text-sm text-gray-700 mt-1">Precio: ${precio.toFixed(2)} — Subtotal: ${linea.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 border rounded" onClick={() => changeQuantity(item.producto_id, -1)}>-</button>
                      <div className="px-3">{item.cantidad}</div>
                      <button className="px-2 py-1 border rounded" onClick={() => changeQuantity(item.producto_id, 1)}>+</button>
                    </div>
                    <button className="text-red-600 text-sm" onClick={() => remove(item.producto_id)}>Quitar</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="rounded-lg p-4">
            <h3 className="font-semibold mb-4">Resumen</h3>
            <div className="mb-3">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>IVA</span><span>${iva.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Envío</span><span>${envio.toFixed(2)}</span></div>
              <div className="flex justify-between mt-3 font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>

            <div className="mt-4 flex gap-3">
              <button className="flex-1 px-3 py-2 border rounded bg-gray-100" onClick={clearCart}>Cancelar</button>
              <button disabled={items.length === 0} className={`flex-1 px-3 py-2 text-white rounded ${items.length === 0 ? 'bg-gray-300' : 'bg-blue-800'}`} onClick={() => router.push('/checkout')}>Continuar compra</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
