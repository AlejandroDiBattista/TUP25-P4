"use client";

import React, { useEffect, useState } from "react";

const BACK = process.env.NEXT_PUBLIC_BACKEND || "http://127.0.0.1:8000";

export default function ComprasPage() {
  const [compras, setCompras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompras = async () => {
      try {
        const token = localStorage.getItem("tp_token");
        if (!token) {
          window.location.href = "/ingresar";
          return;
        }

        const res = await fetch(`${BACK}/compras`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setCompras(data?.compras ?? data ?? []);
      } catch (err: any) {
        console.error("Error cargando compras:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCompras();
  }, []);

  if (loading) return (
    <main className="container">
      <div>Cargando historial... 📋</div>
    </main>
  );

  if (error) return (
    <main className="container">
      <div style={{ color: 'red' }}>❌ Error: {error}</div>
    </main>
  );

  return (
    <main className="container">
      <h1 style={{ margin: "0 0 24px 0", fontSize: 24 }}>Mis Compras</h1>
      
      {compras.length === 0 ? (
        <div className="side-card" style={{ textAlign: "center", padding: "40px" }}>
          <h3>No tienes compras realizadas</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            ¡Realiza tu primera compra!
          </p>
          <a href="/productos" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
            Ver productos
          </a>
        </div>
      ) : (
        <div className="container-center">
          <div className="main-column">
            <div className="product-list">
              {compras.map((compra, index) => (
                <div key={compra.id ?? index} className="product-card">
                  <div style={{ flex: 1 }}>
                    <h3>Compra #{compra.id ?? index + 1}</h3>
                    <p>Fecha: {compra.fecha ?? "No disponible"}</p>
                    <p>Total: ${compra.total ?? 0}</p>
                    <p>Estado: {compra.estado ?? "Completada"}</p>
                  </div>
                  <div>
                    <button className="btn-add-cart">Ver detalles</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <aside className="side-panel">
            <div className="side-card">
              <h3>Estadísticas</h3>
              <p>Total compras: {compras.length}</p>
              <p>Total gastado: ${compras.reduce((sum, c) => sum + (c.total ?? 0), 0)}</p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}