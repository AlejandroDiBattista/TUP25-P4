"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { getHistorial } from "@/services/api";

export default function HistorialPage() {
  const usuario = useUserStore((s) => s.usuario);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;

    getHistorial(usuario.id).then((ordenesBackend) => {
      setOrdenes(ordenesBackend); // ← ahora sí es un array
      setLoading(false);
    });
  }, [usuario]);

  if (!usuario) {
    return <p>Debes iniciar sesión para ver tu historial.</p>;
  }

  if (loading) return <p>Cargando historial...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Historial de Compras</h1>

      {ordenes.length === 0 ? (
        <p>No tienes compras registradas.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {ordenes.map((orden) => (
            <li
              key={orden.orden_id}
              style={{
                padding: 15,
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 15,
              }}
            >
              <h3>Orden #{orden.orden_id}</h3>
              <p>Fecha: {orden.fecha}</p>
              <p>Total: ${orden.total}</p>
              <p>Envío: ${orden.envio}</p>
              <p>Dirección: {orden.direccion}</p>
              <p style={{ fontWeight: "bold" }}>
                Total final: ${orden.total + orden.envio}
              </p>

              <h4 style={{ marginTop: 10 }}>Productos:</h4>
              <ul>
                {orden.items.map((it, i) => (
                  <li key={i}>
                    {it.nombre} — {it.cantidad} x ${it.precio_unitario}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
//
