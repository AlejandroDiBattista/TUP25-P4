"use client";

import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const CART_KEY = 'tp6_cart';
const CART_SYNC_KEY = 'tp6_cart_synced';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const title = producto.titulo ?? (producto as any).nombre ?? 'Producto';
  const existencia = Number(producto.existencia ?? 0);
  const agotado = existencia <= 0;

  const addToCart = async (cantidad: number) => {
    const pid = producto.id ?? (producto as any).producto_id ?? null;
    if (agotado || !pid) {
      alert('Producto sin stock disponible');
      return;
    }

    const token = localStorage.getItem('tp6_token');
    if (token) {
      try {
        const response = await fetch(`${API_URL}/carrito/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ producto_id: pid, cantidad })
        });
        if (!response.ok) {
          const txt = await response.text().catch(() => '');
          console.warn('Backend rechazó agregar al carrito', response.status, txt);
          alert('No se pudo agregar al carrito');
          return;
        }

        try {
          const snapshot = await fetch(`${API_URL}/carrito/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (snapshot.ok) {
            const data = await snapshot.json();
            const entries = (data.items ?? []).map((it: any) => ({
              producto_id: it.producto_id,
              cantidad: Number(it.cantidad ?? 0)
            }));
            localStorage.setItem(CART_KEY, JSON.stringify(entries));
            localStorage.setItem(CART_SYNC_KEY, '1');
            window.dispatchEvent(new Event('tp6:cart-updated'));
          }
        } catch (loadError) {
          console.warn('No se pudo refrescar el carrito local', loadError);
        }

        alert('Agregado al carrito');
      } catch (error) {
        console.error('Error agregando al carrito', error);
        alert('No se pudo agregar al carrito');
      }
      return;
    }

    try {
      const raw = localStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      const existing = cart.find((i: any) => i.producto_id === pid);
      if (existing) existing.cantidad = Number(existing.cantidad) + cantidad; else cart.push({ producto_id: pid, cantidad });
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      localStorage.setItem(CART_SYNC_KEY, '0');
      window.dispatchEvent(new Event('tp6:cart-updated'));
      alert('Agregado al carrito');
    } catch (e) {
      console.error('Error agregando al carrito', e);
      alert('No se pudo agregar al carrito');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
        {(() => {
          const imgField = (producto as any).imagen ?? (producto as any).image;
          if (!imgField) return (<div className="text-xs text-gray-400">No imagen</div>);
          const isAbsolute = String(imgField).startsWith('http');
          const src = isAbsolute ? String(imgField) : `${API_URL}/${String(imgField).replace(/^\//, '')}`;
          // eslint-disable-next-line @next/next/no-img-element
          return <img src={src} alt={title} className="object-contain p-4 max-h-full max-w-full" />;
        })()}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {producto.descripcion}
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {producto.categoria}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-700">{producto.valoracion}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-blue-600">${producto.precio}</span>
            <div className="text-xs text-gray-500">Stock: {producto.existencia}</div>
          </div>
          <div className="flex items-center gap-2">
            {agotado ? (
              <span className="text-sm font-semibold text-red-600">Agotado</span>
            ) : (
              <button
                onClick={() => addToCart(1)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Agregar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
