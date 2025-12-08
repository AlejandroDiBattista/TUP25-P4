"use client";

import React, { useEffect, useState } from "react";
import ProductoCard from "../components/ProductoCard";

const BACK = process.env.NEXT_PUBLIC_BACKEND || "http://127.0.0.1:8000";

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("tp_token");
        if (!token) {
          window.location.href = "/ingresar";
          return;
        }

        // Cargar productos y carrito en paralelo
        const [productosRes, carritoRes] = await Promise.all([
          fetch(`${BACK}/productos`, {
            headers: { "Content-Type": "application/json" }
          }),
          fetch(`${BACK}/carrito`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          })
        ]);

        if (!productosRes.ok) {
          throw new Error(`Error productos: ${productosRes.status}`);
        }
        if (!carritoRes.ok) {
          throw new Error(`Error carrito: ${carritoRes.status}`);
        }

        const productosData = await productosRes.json();
        const carritoData = await carritoRes.json();
        
        const productList = Array.isArray(productosData) ? productosData : productosData?.productos ?? [];
        const carritoItems = carritoData?.items ?? [];

        // Datos de prueba para el carrito si está vacío (para testing)
        const carritoTest = carritoItems.length === 0 ? [
          {
            id: 1,
            nombre: "Mochila Fjallraven Foldsack",
            precio: 109.95,
            cantidad: 1,
            imagen: "0001.png"
          },
          {
            id: 2,
            nombre: "Camiseta ajustada premium",
            precio: 22.30,
            cantidad: 1,
            imagen: "0002.png"
          }
        ] : carritoItems;

        setProductos(productList);
        setCarrito(carritoTest);
      } catch (err: any) {
        console.error("Error cargando datos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar productos
  const categories = React.useMemo(() => {
    const s = new Set<string>();
    productos.forEach((p: any) => {
      const c = p.categoria ?? p.category ?? "Sin categoría";
      if (c) s.add(String(c));
    });
    return Array.from(s);
  }, [productos]);

  const filtered = React.useMemo(() => {
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

  // Calcular totales del carrito
  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const iva = subtotal * 0.21;
  // Envío gratuito para compras superiores a 1000, sino costo fijo de 50
  const envio = subtotal > 1000 ? 0 : 50.00;
  const total = subtotal + iva + envio;

  if (loading) return (
    <main className="container">
      <div>Cargando... 🛒</div>
    </main>
  );

  if (error) return (
    <main className="container">
      <div style={{ color: 'red' }}>❌ Error: {error}</div>
    </main>
  );

  return (
    <main className="container">
      <h1 style={{ margin: "0 0 24px 0", fontSize: 24 }}>Productos</h1>

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
          {/* Información de filtros */}
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

          {/* Carrito */}
          {carrito.length > 0 && (
            <div className="side-card">
              <h3 style={{ margin: "0 0 16px 0", fontSize: 16 }}>Mi Carrito</h3>
              
              {carrito.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="cart-item-image">
                    <img 
                      src={`${BACK}/imagenes/${item.imagen || "placeholder.svg"}`}
                      alt={item.nombre}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.nombre}</div>
                    <div className="cart-item-price">${item.precio}</div>
                    <div className="cart-item-quantity">Cantidad: {item.cantidad}</div>
                  </div>
                </div>
              ))}

              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>IVA:</span>
                  <span>${iva.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Envío:</span>
                  <span>
                    {envio === 0 ? (
                      <span style={{ color: '#10b981', fontWeight: '600' }}>GRATIS ✓</span>
                    ) : (
                      `$${envio.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="cart-summary-total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button 
                  className="btn-cart-cancel"
                  onClick={() => {/* cancelar */}}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-cart-continue"
                  onClick={() => {/* continuar compra */}}
                >
                  Continuar compra
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}