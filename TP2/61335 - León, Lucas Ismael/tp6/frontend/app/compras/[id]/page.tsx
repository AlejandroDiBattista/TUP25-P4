"use client";
import { useEffect, useState } from 'react';
import { detalleCompra } from '../../services/orden';

type Item = { producto_id: number; cantidad: number; precio_unitario: number };
type Compra = { id: number; fecha: string; subtotal: number; iva: number; envio: number; total: number };

export default function CompraDetallePage({ params }: { params: { id: string } }) {
  const [compra, setCompra] = useState<Compra | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const id = Number(params.id);
        const res = await detalleCompra(id);
        setCompra(res.compra);
        setItems(res.items);
        } catch {
          alert('No se pudo cargar la compra. Verificá que estés logueado.');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <p>Cargando...</p>;
  if (!compra) return <p>Compra no encontrada</p>;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Compra #{compra.id}</h1>
      <div className="text-sm text-gray-600">{new Date(compra.fecha).toLocaleString()}</div>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2">Producto ID</th>
            <th className="text-right p-2">Cant.</th>
            <th className="text-right p-2">Precio</th>
            <th className="text-right p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={`${it.producto_id}`} className="border-t">
              <td className="p-2">{it.producto_id}</td>
              <td className="p-2 text-right">{it.cantidad}</td>
              <td className="p-2 text-right">${it.precio_unitario.toFixed(2)}</td>
              <td className="p-2 text-right">${(it.precio_unitario * it.cantidad).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="self-end text-sm">
        <div>Subtotal: ${compra.subtotal.toFixed(2)}</div>
        <div>IVA: ${compra.iva.toFixed(2)}</div>
        <div>Envío: ${compra.envio.toFixed(2)}</div>
        <div className="font-semibold">Total: ${compra.total.toFixed(2)}</div>
      </div>
    </div>
  );
}
