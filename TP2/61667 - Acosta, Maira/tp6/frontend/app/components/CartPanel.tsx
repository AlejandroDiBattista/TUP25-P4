"use client";
import { useState, useEffect } from "react";

export default function CartPanel() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLogged(!!token);
  }, []);

  if (!isLogged) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center text-center">
        <p className="text-gray-500">
          Inicia sesión para ver y editar tu carrito.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-2">Tu carrito</h2>
      <p>Próximamente: productos añadidos...</p>
    </div>
  );
}
