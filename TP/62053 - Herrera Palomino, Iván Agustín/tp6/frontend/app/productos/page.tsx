"use client";

import React, { useEffect, useState, useMemo } from "react";
import ProductoCard from "../components/ProductoCard";
import CartSidebar from "../components/CartSidebar";

const BACK = process.env.NEXT_PUBLIC_BACKEND || "http://127.0.0.1:8000";

function useDebounced(value: string, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const debouncedQuery = useDebounced(query, 250);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${BACK}/productos`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (mounted) setProductos(Array.isArray(data) ? data : data?.productos ?? []);
      } catch (err: any) {
        console.error("Error cargando productos:", err);
        if (mounted) setError(String(err?.message ?? err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => {
    const s = new Set<string>();
    productos.forEach((p: any) => {
      const c = p.categoria ?? p.category ?? p.categorias ?? "Sin categoría";
      if (c) s.add(String(c));
    });
    return Array.from(s);
  }, [productos]);

  const filtered = useMemo(() => {
    let list = productos;
    if (debouncedQuery) {
      const q = debouncedQuery.trim().toLowerCase();
      list = list.filter((p: any) => {
        const title = (p.nombre ?? p.titulo ?? "").toString().toLowerCase();
        const desc = (p.descripcion ?? p.resume ?? "").toString().toLowerCase();
        return title.includes(q) || desc.includes(q);
      });
    }
    if (category && category !== "all") {
      list = list.filter((p: any) => {
        const c = (p.categoria ?? p.category ?? p.categorias ?? "").toString();
        return c === category;
      });
    }
    return list;
  }, [productos, debouncedQuery, category]);

  if (loading) return (
    <main className="container">
      <div>Cargando productos... 🔄</div>
    </main>
  );
  
  if (error) return (
    <main className="container">
      <div style={{ color: 'red' }}>❌ Error: {error}</div>
    </main>
  );

  return (
    <main className="container">
      <h1 style={{ margin: "0 0 24px 0", fontSize: 24 }}>Catálogo de Productos</h1>

      <div className="container-center">
        <div className="main-column">
          <div className="search-row">
            <input
              aria-label="Buscar productos"
              placeholder="Buscar productos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />

            <select
              aria-label="Filtrar por categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="product-list">
            {filtered.length === 0 ? (
              <div style={{ color: "#6b7280", textAlign: "center", padding: "40px 0" }}>
                {debouncedQuery || category !== "all" ? "No se encontraron productos con esos criterios." : "No hay productos disponibles."}
              </div>
            ) : (
              filtered.map((p: any) => (
                <ProductoCard 
                  key={p.id ?? p._id ?? JSON.stringify(p)} 
                  producto={p} 
                />
              ))
            )}
          </div>
        </div>

        <aside className="side-panel">
          <div className="side-card">
            <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>Información</h3>
            <p style={{ margin: "8px 0", fontSize: 14 }}>
              Total de productos: <strong>{productos.length}</strong><br/>
              Mostrando: <strong>{filtered.length}</strong>
            </p>
            {category !== "all" && (
              <p style={{ margin: "8px 0", fontSize: 12, color: "#666" }}>
                Categoría: {category}
              </p>
            )}
          </div>
          
          <CartSidebar />
        </aside>
      </div>
    </main>
  );
}