"use client";
import { useCart } from "../context/CartContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cancelarCarrito } from "@/lib/api";

export default function CartDrawer() {
  const { open, close, data, loading, lastAdded, setQty, refresh } = useCart();
  const router = useRouter();
  // bloquear scroll cuando abierto
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-xl flex flex-col transition-transform duration-300 z-50 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Tu Carrito</h2>
          <button onClick={close} className="text-sm text-gray-500 hover:text-gray-800">Cerrar</button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p>Cargando...</p>}
          {!loading && (!data || data.items.length === 0) && <p className="text-sm text-gray-500">Sin productos aún.</p>}
          {data?.items.map(it => {
            const max = typeof it.existencia === 'number' ? Math.max(0, it.existencia) : undefined;
            const atMax = typeof max === 'number' && it.cantidad >= max;
            return (
            <div key={it.producto_id} className={`border rounded p-3 text-sm relative ${lastAdded===it.producto_id ? 'ring-2 ring-indigo-400 animate-pulse' : ''}`}>
              <div className="font-medium mb-2">{it.titulo}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Cantidad: {it.cantidad}</span>
                  <Button
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setQty(it.producto_id, Math.max(0, it.cantidad - 1))}
                    disabled={loading}
                  >-</Button>
                  <Button
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setQty(it.producto_id, (typeof max === 'number') ? Math.min(it.cantidad + 1, max) : it.cantidad + 1)}
                    disabled={loading || atMax}
                  >+</Button>
                </div>
                <span className="text-xs text-gray-700 font-medium">${(it.precio_unitario * it.cantidad).toFixed(2)}</span>
              </div>
              {typeof max === 'number' && (
                <div className="mt-1 text-[11px] text-gray-500">Stock: {max}{atMax ? ' (máximo alcanzado)' : ''}</div>
              )}
            </div>
          );})}
        </div>
        {data && (
          <footer className="border-t p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>${data.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA</span><span>${data.total_iva.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Envío</span><span>${data.envio.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-indigo-600"><span>Total</span><span>${data.total.toFixed(2)}</span></div>
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 bg-indigo-600 text-white rounded py-2 text-sm disabled:opacity-50"
                disabled={data.items.length===0}
                onClick={() => { close(); router.push('/checkout'); }}
              >
                Comprar
              </button>
              <Button
                variant="danger"
                className="px-3"
                onClick={async () => {
                  const ok = window.confirm("¿Vaciar el carrito? Esta acción no se puede deshacer.");
                  if (!ok) return;
                  await cancelarCarrito();
                  await refresh();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                  <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 7h14M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
                </svg>
                Vaciar
              </Button>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}