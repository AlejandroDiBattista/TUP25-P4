"use client";

import { useEffect, useState } from "react";
import ProductoCard from "./components/ProductoCard";
import { Productos } from "./services/productos";
import { Producto } from "./types";

export default function Home() {
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await Productos.listar(q || undefined, categoria || undefined);
      setProductos(data);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // carga inicial
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
        <p className="text-gray-600">
          {loading ? "Cargando..." : `${productos.length} productos disponibles`}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          className="input md:max-w-sm"
          placeholder="Buscar por nombre o descripción..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          className="input md:max-w-xs"
          placeholder="Categoría (ej: electronicos)"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="btn" onClick={load}>Filtrar</button>
          <button
            className="btn"
            onClick={() => {
              setQ("");
              setCategoria("");
              load();
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {err && <div className="card text-red-600">{err}</div>}

      {loading ? (
        <div className="card">Cargando productos...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
