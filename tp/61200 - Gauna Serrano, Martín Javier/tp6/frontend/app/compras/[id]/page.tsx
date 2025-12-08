"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders } from "../../services/auth";
import { useParams } from "next/navigation";

interface ItemCompra {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

interface CompraDetalle {
  id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  items: ItemCompra[];
  subtotal: number;
  envio: number;
  total: number;
}

export default function DetalleCompraPage() {
  const { id } = useParams();
  const [compra, setCompra] = useState<CompraDetalle | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const cargarCompra = async () => {
    try {
      const response = await fetch(`${API_URL}/compras/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) throw new Error("No se pudo obtener la compra");

      const data = await response.json();
      setCompra(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar compra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCompra();
  }, []);

  if (loading) return <p className="p-10 text-center">Cargando compra...</p>;
  if (error) return <p className="p-10 text-center text-red-600">{error}</p>;
  if (!compra) return <p className="p-10 text-center">Compra no encontrada</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        Compra #{compra.id}
        <button
  onClick={() => history.back()}
  className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
>
  ← Volver
</button>

      </h1>

      <p className="text-gray-700 mb-2">Fecha: {compra.fecha.slice(0, 10)}</p>
      <p className="text-gray-700 mb-2">Dirección: {compra.direccion}</p>
      <p className="text-gray-700 mb-2">
        Tarjeta: **** **** **** {compra.tarjeta.slice(-4)}
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">Productos</h2>

      {compra.items.map((item, i) => (
        <div
          key={i}
          className="border p-4 rounded-lg mb-3 shadow text-sm"
        >
          <p className="font-semibold">{item.nombre}</p>
          <p>Cantidad: {item.cantidad}</p>
          <p>Precio unitario: ${item.precio_unitario}</p>
          <p className="font-bold">Subtotal: ${item.subtotal}</p>
        </div>
      ))}

      <div className="mt-6 text-lg">
        <p>Subtotal: ${compra.subtotal}</p>
        <p>Envío: ${compra.envio}</p>
        <p className="font-bold text-2xl mt-2">Total: ${compra.total}</p>
      </div>
    </div>
  );
}
