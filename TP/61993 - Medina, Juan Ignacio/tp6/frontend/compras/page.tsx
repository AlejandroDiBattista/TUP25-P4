"use client";
import { useEffect, useState } from "react";

const Header = () => (
  <header className="bg-gray-100 py-4">
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="text-xl font-semibold">Compras</h1>
    </div>
  </header>
);

export default function ComprasPage() {
  const [compras, setCompras] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/compras").then(r => r.json()).then(setCompras);
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto mt-8">
        {compras.map(c => (
          <div key={c.id} className="border p-4 mb-2 rounded">
            <p><strong>Compra ID:</strong> {c.id}</p>
            <p><strong>Fecha:</strong> {c.fecha}</p>
            <p><strong>Total:</strong> ${c.total}</p>
          </div>
        ))}
      </div>
    </>
  );
}
