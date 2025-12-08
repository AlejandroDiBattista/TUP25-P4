"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';

export default function Ticket() {
  const { cartItems, finalize } = useCart();
  const router = useRouter();
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [finalMsg, setFinalMsg] = useState<string | null>(null);
  const [compraId, setCompraId] = useState<string | null>(null);

  async function handleFinalizar(e: React.FormEvent) {
    e.preventDefault();
    setFinalMsg(null);
    try {
      const resp: any = await finalize(direccion, tarjeta);
      setFinalMsg('Compra finalizada correctamente');
      setDireccion(''); setTarjeta('');
      const id = resp?.compra_id;
      setCompraId(id || null);
      setTimeout(() => {
        if (id) {
          router.push(`/mis-compras?compra=${id}`);
        } else {
          router.push('/mis-compras');
        }
      }, 5000);
    } catch (e: any) {
      setFinalMsg(e?.message || 'Error al finalizar');
    }
  }

  const subtotal = (cartItems || []).reduce((s: number, it: any) => s + (it.producto.precio * it.cantidad), 0);
  const iva = (cartItems || []).reduce((s: number, it: any) => s + (it.producto.precio * it.cantidad * 0.21), 0);
  const envio = subtotal > 1000 ? 0 : 50;
  const total = subtotal + iva + envio;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white border rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Resumen del carrito</h2>
        {(!cartItems || cartItems.length === 0) ? (
          <div>No hay productos en el carrito.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {cartItems.map((it: any) => (
              <div key={it.producto.id} className="flex items-center gap-4 border-b pb-4">
                <img src={it.producto.imagen ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${it.producto.imagen}` : '/placeholder.png'} alt={it.producto.titulo || `Producto ${it.producto.id}`} className="w-24 h-24 object-contain" />
                <div className="flex-1">
                  <div className="font-semibold text-black">{it.producto.titulo}</div>
                  <div className="text-sm text-black">Cantidad: {it.cantidad}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${(it.producto.precio * it.cantidad).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">IVA: ${(it.producto.precio * it.cantidad * 0.21).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="bg-white border rounded p-6">
        <h3 className="font-semibold mb-3">Datos de envío</h3>
        <form onSubmit={handleFinalizar} className="flex flex-col gap-3">
          <label className="flex flex-col">
            <span className="text-sm">Dirección</span>
            <input value={direccion} onChange={(e) => setDireccion(e.target.value)} className="border rounded px-3 py-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm">Tarjeta</span>
            <input value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} className="border rounded px-3 py-2" />
          </label>

          <div className="border-t pt-2 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA:</span><span>${iva.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Envío:</span><span>${envio.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold mt-2"><span>Total a pagar:</span><span>${total.toFixed(2)}</span></div>
          </div>

          {finalMsg && <div className="text-sm text-green-600">{finalMsg}</div>}
          <button className="bg-slate-900 text-white px-4 py-2 rounded" disabled={(!cartItems || cartItems.length === 0)}>
            Finalizar compra
          </button>
        </form>
      </aside>
    </div>
  );
}


