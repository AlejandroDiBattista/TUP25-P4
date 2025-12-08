// compras/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Compras } from "../../app/services/productos";

interface Compra {
  id: number;
  total: number;
  fecha: string;
}

export default function HistorialCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const data = await Compras.listar();
        setCompras(data);
      } catch (err) {
        alert("Error al cargar historial de compras.");
      }
    };
    fetchCompras();
  }, []);

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Mis compras</h2>

      <div className="space-y-4">
        {compras.map((compra) => (
          <div
            key={compra.id}
            onClick={() => router.push(`/compras/${compra.id}`)}
            className="cursor-pointer border rounded-lg p-4 shadow hover:bg-gray-50"
          >
            <p className="font-semibold">Compra #{compra.id}</p>
            <p className="text-sm text-gray-600">Fecha: {new Date(compra.fecha).toLocaleString()}</p>
            <p className="text-sm text-gray-800">Total: ${compra.total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
