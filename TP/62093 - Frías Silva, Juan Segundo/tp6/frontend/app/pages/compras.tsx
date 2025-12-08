import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../services/auth";

interface Compra {
  id: number;
  fecha: string;
  total: number;
  envio: number;
  direccion: string;
  items: {
    producto_id: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export default function Compras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const data = await fetchWithAuth("/api/compras");
        setCompras(data);
      } catch (error) {
        setError((error as Error).message);
      }
    };

    fetchCompras();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Historial de Compras</h1>
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {compras.map((compra) => (
          <li key={compra.id} className="mb-4 border-b pb-4">
            <p><strong>Fecha:</strong> {new Date(compra.fecha).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ${compra.total}</p>
            <p><strong>Envío:</strong> ${compra.envio}</p>
            <p><strong>Dirección:</strong> {compra.direccion}</p>
            <ul className="mt-2">
              {compra.items.map((item) => (
                <li key={item.producto_id}>
                  {item.nombre} - {item.cantidad} x ${item.precio_unitario}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
