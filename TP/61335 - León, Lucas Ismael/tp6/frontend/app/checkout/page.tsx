"use client";
import { useEffect, useState } from 'react';
import { cancelarCarrito, finalizarCompra, verCarrito } from '../services/orden';

type Item = { producto_id: number; titulo: string; cantidad: number; precio_unitario: number; subtotal: number; iva?: number };

type ResumenCarrito = {
  items: Item[];
  subtotal: number; iva: number; envio: number; total: number;
};

export default function CheckoutPage() {
  const [data, setData] = useState<ResumenCarrito | null>(null);
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [loading, setLoading] = useState(true);
 

  async function cargar() {
    setLoading(true);
    try {
      const json = await verCarrito();
      setData(json);
    } catch {
      alert('Tenés que iniciar sesión para ver el checkout');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function onCancelar() {
    if (!confirm('¿Seguro que querés cancelar el carrito?')) return;
    await cancelarCarrito();
    await cargar();
    alert('Carrito cancelado');
  }

  async function onFinalizar() {
    if (!direccion || !tarjeta) { alert('Completá dirección y tarjeta'); return; }
    const res = await finalizarCompra(direccion, tarjeta);
    alert(`Compra finalizada. ID: ${res.compra_id}`);
    setDireccion(''); setTarjeta('');
    await cargar();
  }

 

  if (loading) return <p>Cargando...</p>;
  if (!data) return <p>No hay datos del carrito.</p>;
  const carritoVacio = !data.items || data.items.length === 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold">Finalizar compra</h1>
        <div className="border rounded bg-white p-5 shadow-sm">
          <h2 className="font-semibold mb-3 text-base">Resumen del carrito</h2>
          <div className="space-y-3 text-[13px]">
            {data.items.map(it => (
              <div key={it.producto_id} className="flex items-start justify-between">
                <div className="pr-4 min-w-0">
                  <div className="font-medium truncate" title={it.titulo}>{it.titulo}</div>
                  <div className="text-[12px] text-gray-600">Cantidad: {it.cantidad}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${it.subtotal.toFixed(2)}</div>
                  <div className="text-[11px] text-gray-500">IVA: ${Number(it.iva||0).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t text-sm space-y-1">
            <div className="flex justify-between"><span>Total productos:</span><span>${data.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA:</span><span>${data.iva.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Envío:</span><span>${data.envio.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total a pagar:</span><span>${data.total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="border rounded bg-white p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-base">Datos de envío</h2>
          <div className="space-y-3 text-sm">
            <label className="block">
              <span className="block mb-1 text-gray-700">Dirección</span>
              <input className="w-full border px-3 py-2 rounded" value={direccion} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDireccion(e.target.value)} />
            </label>
            <label className="block">
              <span className="block mb-1 text-gray-700">Tarjeta</span>
              <input className="w-full border px-3 py-2 rounded" value={tarjeta} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarjeta(e.target.value)} placeholder="**** **** **** 1234" />
            </label>
          </div>
          <button
            onClick={onFinalizar}
            disabled={carritoVacio}
            className={`w-full mt-2 rounded px-4 py-2 text-white text-sm font-medium ${carritoVacio ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'}`}
          >
            Confirmar compra
          </button>
          <button onClick={onCancelar} className="w-full mt-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-4 py-2 text-sm">Cancelar carrito</button>
        </div>
      </div>
    </div>
  );
}
