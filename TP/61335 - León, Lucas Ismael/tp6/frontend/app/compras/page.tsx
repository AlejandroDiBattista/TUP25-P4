"use client";
import { useEffect, useState } from 'react';
import { listarCompras, detalleCompra } from '../services/orden';

type Compra = { id: number; fecha: string; total: number };
type Item = { producto_id: number; titulo: string; cantidad: number; precio_unitario: number; subtotal: number };
// Incluimos direccion y tarjeta para mostrar en el detalle (el backend las devuelve)
type CompraDetalle = { id: number; fecha: string; subtotal: number; iva: number; envio: number; total: number; direccion: string; tarjeta: string };

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<{ compra: CompraDetalle; items: Item[] } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await listarCompras();
        setCompras(res);
        if (res.length > 0) setSeleccion(res[0].id);
      } catch {
        alert('Iniciá sesión para ver tus compras');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (seleccion == null) return;
    (async () => {
      try {
        const det = await detalleCompra(seleccion);
        setDetalle(det);
      } catch {}
    })();
  }, [seleccion]);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Mis compras</h1>
        <div className="space-y-3">
          <ul className="space-y-2">
            {compras.map(c => (
              <li
                key={c.id}
                onClick={() => setSeleccion(c.id)}
                className={`border rounded p-3 text-sm cursor-pointer transition ${seleccion === c.id ? 'bg-gray-100 border-gray-400' : 'bg-white hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Compra #{c.id}</span>
                  <span className="text-xs text-gray-600">{new Date(c.fecha).toLocaleString()}</span>
                </div>
                <div className="mt-1 text-xs text-gray-700">Total: ${Number(c.total ?? 0).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Detalle de la compra</h2>
        {!detalle ? (
          <p className="text-sm text-gray-600">Seleccioná una compra para ver el detalle.</p>
        ) : (
          <div className="border rounded bg-white p-4 space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
              <div><span className="font-medium">Compra #:</span> {detalle.compra.id}</div>
              <div><span className="font-medium">Fecha:</span> {new Date(detalle.compra.fecha).toLocaleString()}</div>
              <div><span className="font-medium">Dirección:</span> {detalle.compra.direccion}</div>
              <div><span className="font-medium">Tarjeta:</span> {detalle.compra.tarjeta}</div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Productos</h3>
              <table className="w-full text-xs border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Producto</th>
                    <th className="text-right p-2">Cant.</th>
                    <th className="text-right p-2">Precio</th>
                    <th className="text-right p-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(detalle.items || []).map(it => (
                    <tr key={it.producto_id} className="border-t">
                      <td className="p-2">{it.titulo}</td>
                      <td className="p-2 text-right">{it.cantidad}</td>
                      <td className="p-2 text-right">${Number(it.precio_unitario ?? 0).toFixed(2)}</td>
                      <td className="p-2 text-right">${Number(it.subtotal ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pt-3 border-t space-y-1">
              <div className="flex justify-between"><span>Subtotal:</span><span>${Number(detalle.compra.subtotal ?? 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>IVA:</span><span>${Number(detalle.compra.iva ?? 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Envío:</span><span>${Number(detalle.compra.envio ?? 0).toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total pagado:</span><span>${Number(detalle.compra.total ?? 0).toFixed(2)}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
