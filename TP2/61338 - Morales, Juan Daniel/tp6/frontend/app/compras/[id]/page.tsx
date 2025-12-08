"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Compras } from "../../../app/services/productos";

export default function DetalleCompra() {
  const { id } = useParams();
  const [compra, setCompra] = useState<any>(null);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const data = await Compras.detalle(Number(id));
        setCompra(data);
      } catch (err) {
        alert("Error al obtener detalle.");
      }
    };
    fetchDetalle();
  }, [id]);

  if (!compra) return <p className="p-6">Cargando compra...</p>;

  // 🧠 Calcular subtotal e IVA desde el frontend
  const subtotal = compra.items.reduce(
    (acc: number, item: any) => acc + item.precio_unitario * item.cantidad,
    0
  );

  const iva = subtotal * 0.21; // Si querés aplicar por categoría, avisame y lo ajustamos

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Detalle de la compra</h2>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <p><strong>Compra #:</strong> {compra.id}</p>
        <p><strong>Fecha:</strong> {new Date(compra.fecha).toLocaleString()}</p>
        <p><strong>Dirección:</strong> {compra.direccion}</p>
        <p><strong>Tarjeta:</strong> {compra.tarjeta}</p>

        <hr />

        <h3 className="text-lg font-semibold">Productos</h3>
        {compra.items.map((item: any) => (
          <div key={item.producto_id} className="flex justify-between text-sm">
            <p>{item.nombre} (x{item.cantidad})</p>
            <div className="text-right">
              <p>${item.precio_unitario.toFixed(2)}</p>
              <p className="text-gray-500 text-xs">
                IVA: ${(item.precio_unitario * item.cantidad * 0.21).toFixed(2)}
              </p>
            </div>
          </div>
        ))}

        <hr />

        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
        <p><strong>IVA:</strong> ${iva.toFixed(2)}</p>
        <p><strong>Envío:</strong> ${compra.envio.toFixed(2)}</p>
        <p className="text-lg font-bold">Total pagado: ${compra.total.toFixed(2)}</p>
      </div>
    </main>
  );
}
