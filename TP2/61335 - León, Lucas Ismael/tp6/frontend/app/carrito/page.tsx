"use client";
import { useEffect, useState } from 'react';
import { cancelarCarrito, finalizarCompra, verCarrito } from '../services/orden';

type ResumenCarrito = {
  items: { producto_id: number; titulo: string; cantidad: number; precio_unitario: number; subtotal: number }[];
  subtotal: number; iva: number; envio: number; total: number;
};

export default function CarritoPage() {
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
      alert('Tenés que iniciar sesión para ver el carrito');
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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Carrito</h1>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2">Producto</th>
            <th className="text-right p-2">Cant.</th>
            <th className="text-right p-2">Precio</th>
            <th className="text-right p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it) => (
            <tr key={it.producto_id} className="border-t">
              <td className="p-2">{it.titulo}</td>
              <td className="p-2 text-right">{it.cantidad}</td>
              <td className="p-2 text-right">${it.precio_unitario.toFixed(2)}</td>
              <td className="p-2 text-right">${it.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="self-end text-sm">
        <div>Subtotal: ${data.subtotal.toFixed(2)}</div>
        <div>IVA: ${data.iva.toFixed(2)}</div>
        <div>Envío: ${data.envio.toFixed(2)}</div>
        <div className="font-semibold">Total: ${data.total.toFixed(2)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="border px-3 py-2 rounded" placeholder="Dirección de envío" value={direccion} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDireccion(e.target.value)} />
        <input className="border px-3 py-2 rounded" placeholder="Tarjeta (16 dígitos)" value={tarjeta} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarjeta(e.target.value)} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onFinalizar}
          disabled={carritoVacio}
          className={`rounded px-4 py-2 text-white ${carritoVacio ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'}`}
        >
          Finalizar compra
        </button>
        <button onClick={onCancelar} className="bg-gray-200 hover:bg-gray-300 rounded px-4 py-2">Cancelar</button>
      </div>
    </div>
  );
}
