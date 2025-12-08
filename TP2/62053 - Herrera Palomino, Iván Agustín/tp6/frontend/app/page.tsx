// app/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import ProductoCard from "./components/ProductoCard";
import CartSidebar from "./components/CartSidebar";
import Header from "./components/Header";

const BACK = process.env.NEXT_PUBLIC_BACKEND || "http://127.0.0.1:8000";

export default function HomePage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    let mounted = true;
    
    const loadProductos = async () => {
      try {
        const res = await fetch(`${BACK}/productos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        const productList = Array.isArray(data) ? data : data?.productos ?? data?.results ?? [];
        
        if (mounted) {
          setProductos(productList);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Cargar productos inicialmente
    loadProductos();
    
    // Escuchar eventos de actualización de stock
    const handleStockUpdate = (event?: any) => {
      loadProductos();
    };
    
    // Múltiples listeners para asegurar la captura
    window.addEventListener("stockUpdated", handleStockUpdate);
    window.addEventListener("cartUpdated", handleStockUpdate);
    
    // También escuchar eventos custom
    window.addEventListener("stockUpdated", handleStockUpdate);

    return () => { 
      mounted = false;
      window.removeEventListener("stockUpdated", handleStockUpdate);
      window.removeEventListener("cartUpdated", handleStockUpdate);
    };
  }, []);

  const categories = useMemo(() => {
    const s = new Set<string>();
    productos.forEach((p: any) => {
      const c = p.categoria ?? p.category ?? "Sin categoría";
      if (c) s.add(String(c));
    });
    return Array.from(s);
  }, [productos]);

  const filtered = useMemo(() => {
    let list = productos;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p: any) => {
        const t = (p.nombre ?? p.titulo ?? "").toString().toLowerCase();
        const d = (p.descripcion ?? "").toString().toLowerCase();
        return t.includes(q) || d.includes(q);
      });
    }
    if (category !== "all") {
      list = list.filter((p: any) => (p.categoria ?? p.category ?? "") === category);
    }
    return list;
  }, [productos, query, category]);

  if (loading) return (
    <main className="container">
      <div>Cargando productos... 🔄</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
        Conectando a: {BACK}/productos
      </div>
    </main>
  );
  
  if (error) return (
    <main className="container">
      <div style={{ color: 'red' }}>❌ Error: {error}</div>
      <div style={{ fontSize: 12, marginTop: 8 }}>
        Verifica que el backend esté corriendo en: {BACK}
      </div>
      <div style={{ fontSize: 12, marginTop: 4 }}>
        Prueba abrir en el navegador: <a href={`${BACK}/productos`} target="_blank">{BACK}/productos</a>
      </div>
    </main>
  );

  return (
    <main className="container">
      {/* Header con autenticación */}
      <Header />

      <div className="container-center">
        <div className="main-column">
          <div className="search-row">
            <input
              placeholder="Buscar productos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="product-list">
            {filtered.length === 0 ? (
              <div style={{ color: "#6b7280", textAlign: "center", padding: "40px 0" }}>
                {query || category !== "all" ? "No se encontraron productos con esos criterios." : "No hay productos disponibles."}
              </div>
            ) : (
              filtered.map((p: any, index) => (
                <ProductoCard 
                  key={p.id ?? p._id ?? index} 
                  producto={p} 
                />
              ))
            )}
          </div>
        </div>

        <aside className="side-panel">
          <CartSidebar />
        </aside>
      </div>
    </main>
  );
}