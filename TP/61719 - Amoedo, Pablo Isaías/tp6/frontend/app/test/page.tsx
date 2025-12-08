// app/test/page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function TestPage() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    api.get("/productos")
      .then((res) => {
        console.log(res.data);
        setProductos(res.data);
      })
      .catch((err) => {
        console.error("Error al conectar con el backend:", err);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Test conexión con FastAPI</h1>
      {productos.length === 0 ? (
        <p>No se encontraron productos o error de conexión.</p>
      ) : (
        <ul>
          {productos.map((p: any) => (
            <li key={p.id}>{p.nombre} - ${p.precio}</li>
          ))}
        </ul>
      )}
    </div>
  );
}