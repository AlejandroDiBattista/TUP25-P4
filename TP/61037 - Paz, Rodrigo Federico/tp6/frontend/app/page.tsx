"use client";

import { useState, useEffect } from "react";
import { obtenerProductos, obtenerCarrito } from "./services/productos";
import ProductoCard from "./components/ProductoCard";
import Carrito from "./components/Carrito";

export default function Home() {
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    const id = Number(localStorage.getItem("usuario_id"));
    setUsuarioId(id || null);
  }, []);

  useEffect(() => {
    let url = `/productos`;

    const params = new URLSearchParams();
    if (busqueda.trim()) params.append("q", busqueda.trim());
    if (categoria !== "todas") params.append("categoria", categoria);

    if (params.toString()) url += `?${params.toString()}`;

    fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + url)
      .then((res) => res.json())
      .then((data) => {
        console.log("PRODUCTOS DESDE API:", data); // <-- AGREGADO
        setProductos(data);
      });
  }, [busqueda, categoria]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Búsqueda y Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="todas">Todas las categorías</option>
            <option value="Ropa de hombre">Ropa de hombre</option>
            <option value="Ropa de mujer">Ropa de mujer</option>
            <option value="Joyería">Joyería</option>
            <option value="Electrónica">Electrónica</option>
          </select>
        </div>

        {/* Layout: Productos (izquierda) + Carrito (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Productos en lista vertical (2 columnas) */}
          <div className="lg:col-span-2 space-y-4">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          {/* Carrito sticky (1 columna) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Carrito />
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
