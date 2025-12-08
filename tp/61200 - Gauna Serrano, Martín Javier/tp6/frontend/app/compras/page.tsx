"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders, estaAutenticado } from "../services/auth";

interface CompraResumen {
  id: number;
  fecha: string;
  total: number;
  envio: number;
  cantidad_items: number;
} 

export default function ComprasPage() {
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const cargarCompras = async () => {
    try {
      const response = await fetch(`${API_URL}/compras`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) throw new Error("No se pudo obtener el historial");

      const data = await response.json();
      setCompras(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar compras");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (estaAutenticado()) cargarCompras();
  }, []);

  if (loading) return <p className="p-10 text-center">Cargando compras...</p>;
  if (error) return <p className="p-10 text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Historial de Compras</h1>

<button
  onClick={() => window.location.href = '/'}
  className="mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
>
  ← Volver al inicio
</button>

      {compras.length === 0 ? (
        <p className="text-gray-600">Aún no realizaste compras.</p>
      ) : (
        compras.map((c) => (
          <a
            key={c.id}
            href={`/compras/${c.id}`}
            className="block border p-4 mb-4 rounded-lg shadow hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-bold">Compra #{c.id}</h2>
            <p className="text-gray-700">
              Fecha: {c.fecha.slice(0, 10)} — {c.cantidad_items} ítems
            </p>
            <p>Envío: ${c.envio}</p>
            <p className="font-bold text-lg">Total: ${c.total}</p>
          </a>
        ))
      )}
    </div>
  );
}
