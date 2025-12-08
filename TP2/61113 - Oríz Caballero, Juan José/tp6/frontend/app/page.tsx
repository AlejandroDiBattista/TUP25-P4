"use client";

import { useMemo, useState } from 'react';
import ProductoCard from './components/ProductoCard';
import { useCart } from './components/CartProvider';

export default function Home() {
  const { productos, cartItems, addToCart, removeFromCart, setQuantity } = useCart();
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');

  const productosFiltrados = useMemo(() => {
    return productos.filter((p: any) => {
      const matchesQ = q.trim() === '' || (p.titulo + ' ' + p.descripcion).toLowerCase().includes(q.toLowerCase());
      const matchesCat = !categoria || p.categoria === categoria;
      return matchesQ && matchesCat;
    });
  }, [productos, q, categoria]);

  return (
    <div className="min-h-screen bg-black-50">
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="flex gap-4 mb-6">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 border rounded px-3 py-2"
            />
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="border rounded px-3 py-2" aria-label="Filtrar por categoría">
              <option value="">Todas las categorías</option>
              {(Array.from(new Set(productos.map((p:any)=>p.categoria))).filter(Boolean) as string[]).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {productosFiltrados.map((producto: any) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>

        <aside className="lg:col-span-1">
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Tu carrito</h3>
            {(!cartItems || cartItems.length === 0) ? (
              <div className="text-sm text-black">No hay productos en el carrito.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {cartItems.map((it: any) => (
                  <div key={it.producto.id} className="flex items-start justify-between gap-3 border-b pb-3">
                    <div className="flex items-center gap-3">
                      <img src={it.producto.imagen ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${it.producto.imagen}` : '/placeholder.png'} alt={it.producto.titulo || `Producto ${it.producto.id}`} className="w-14 h-14 object-contain" />
                      <div>
                        <div className="font-semibold text-sm">{it.producto.titulo}</div>
                        <div className="text-xs text-black">Cantidad: {it.cantidad}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 bg-black-200 rounded text-sm"
                          onClick={async () => {
                            try {
                              const newQty = Math.max(0, (it.cantidad || 0) - 1);
                              if (newQty === 0) {
                                await removeFromCart(it.producto.id);
                              } else {
                                await setQuantity(it.producto.id, newQty);
                              }
                            } catch (e) {
                              // ignore
                            }
                          }}
                        >
                          -
                        </button>
                        <div className="px-3 py-1 bg-black-100 rounded text-sm">{it.cantidad}</div>
                        <button
                          className="px-2 py-1 bg-black-200 rounded text-sm"
                          onClick={async () => {
                            try {
                              const max = it.producto.existencia || 0;
                              const newQty = Math.min(max, (it.cantidad || 0) + 1);
                              if (newQty > (it.cantidad || 0)) {
                                await setQuantity(it.producto.id, newQty);
                              }
                            } catch (e) {
                              // ignore
                            }
                          }}
                          disabled={(it.producto.existencia || 0) <= (it.cantidad || 0)}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold">${(it.producto.precio * it.cantidad).toFixed(2)}</div>
                        <button onClick={async () => { try { await removeFromCart(it.producto.id); } catch (e) {} }} className="text-xs text-red-600 mt-1">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-2 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">Total</div>
                    <div className="font-bold">${(cartItems.reduce((s: number, it: any) => s + (it.producto.precio * it.cantidad), 0)).toFixed(2)}</div>
                  </div>
                  <div className="mt-2">
                    <a href="/carrito" className="inline-block bg-sky-600 text-white px-3 py-1 rounded">Ir a detalles</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
