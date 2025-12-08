"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cancelarCarrito, verCarrito, actualizarCantidad } from '../services/orden';

type Resumen = {
  items: { producto_id: number; titulo: string; imagen?: string; cantidad: number; precio_unitario: number; subtotal: number; iva?: number }[];
  subtotal: number; iva: number; envio: number; total: number;
};

export default function SidebarCarrito() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [logged, setLogged] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  async function cargar() {
    try {
      const r = await verCarrito();
      setResumen(r);
      setLogged(true);
    } catch {
      setLogged(false);
      setResumen(null);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => cargar());
    function handleCartUpdated() { cargar(); }
    window.addEventListener('cart-updated', handleCartUpdated);
    return () => window.removeEventListener('cart-updated', handleCartUpdated);
  }, []);

  async function onCancelar() {
    await cancelarCarrito();
    await cargar();
  }

  async function onCambiarCantidad(producto_id: number, nueva: number) {
    try {
      await actualizarCantidad(producto_id, nueva);
      await cargar();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo actualizar';
      alert(msg);
    }
  }

  return (
    <aside className="space-y-3">
      {!logged && (
        <div className="border rounded bg-white p-3 text-sm text-gray-600">
          Iniciá sesión para ver y editar tu carrito.
        </div>
      )}
      {logged && resumen && (
        <div className="border rounded bg-white p-3">
          <h3 className="font-semibold mb-2">Resumen</h3>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {resumen.items.map((it) => (
              <div key={it.producto_id} className="flex items-center justify-between text-sm gap-2">
                <div className="relative w-12 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {it.imagen && (
                    <Image src={`${API_URL}/${it.imagen}`} alt={it.titulo} fill className="object-contain p-1" unoptimized />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" title={it.titulo}>{it.titulo}</div>
                  <div className="text-[11px] text-gray-500">IVA: ${Number(it.iva || 0).toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => onCambiarCantidad(it.producto_id, Math.max(0, it.cantidad - 1))}
                  >-</button>
                  <span className="w-6 text-center">{it.cantidad}</span>
                  <button
                    className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => onCambiarCantidad(it.producto_id, it.cantidad + 1)}
                  >+</button>
                </div>
                <div className="text-right w-16">${it.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>{resumen.items.length ? `$${resumen.subtotal.toFixed(2)}` : '-'}</span></div>
            <div className="flex justify-between"><span>IVA</span><span>{resumen.items.length ? `$${resumen.iva.toFixed(2)}` : '-'}</span></div>
            <div className="flex justify-between"><span>Envío</span><span>{resumen.items.length ? `$${resumen.envio.toFixed(2)}` : '-'}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{resumen.items.length ? `$${resumen.total.toFixed(2)}` : '-'}</span></div>
          </div>
          <div className="mt-3 flex gap-2">
            <a href="/checkout" className="bg-gray-900 hover:bg-black text-white rounded px-3 py-2 text-sm text-center flex-1">Continuar compra</a>
            <button onClick={onCancelar} className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-2 text-sm">Cancelar</button>
          </div>
        </div>
      )}
    </aside>
  );
}
