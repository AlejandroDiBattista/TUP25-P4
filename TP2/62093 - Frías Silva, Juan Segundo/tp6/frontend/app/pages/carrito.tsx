import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../services/auth";

interface CarritoItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

export default function Carrito() {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCarrito = async () => {
      try {
        const data = await fetchWithAuth("/api/carrito");
        setCarrito(data);
      } catch (error) {
        setError((error as Error).message);
      }
    };

    fetchCarrito();
  }, []);

  const handleFinalizarCompra = async () => {
    try {
      await fetchWithAuth("/api/carrito/finalizar", {
        method: "POST",
        body: JSON.stringify({ direccion: "Calle Falsa 123", tarjeta: "4111111111111111" }),
        headers: { "Content-Type": "application/json" },
      });

      alert("Compra finalizada exitosamente");
      setCarrito([]);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {carrito.map((item) => (
          <li key={item.id} className="mb-4">
            <p>{item.nombre}</p>
            <p>Cantidad: {item.cantidad}</p>
            <p>Precio: ${item.precio}</p>
          </li>
        ))}
      </ul>
      {carrito.length > 0 && (
        <button
          onClick={handleFinalizarCompra}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Finalizar Compra
        </button>
      )}
    </div>
  );
}
