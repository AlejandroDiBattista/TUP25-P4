// src/components/ProductoCard.tsx
"use client";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { useCarritoStore } from "@/store/useCarritoStore";

export default function ProductoCard({ producto }: { producto: any }) {
  const usuario = useUserStore((s) => s.usuario);
  const agregarBackend = useCarritoStore((s) => s.agregarProducto);

  const handleAgregar = async () => {
    if (!usuario) return alert("Iniciá sesión para agregar al carrito");
    try {
      await agregarBackend(usuario.id, producto, 1);
      // animación breve o notificación (simple)
      alert("Producto agregado al carrito");
    } catch (err) {
      alert("No se pudo agregar el producto");
      console.error(err);
    }
  };

  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.08)",
        padding: 18,
        borderRadius: 12,
        width: 260,
        textAlign: "center",
        background: "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={`http://localhost:8000/${producto.imagen}`}
          alt={producto.titulo}
          width={200}
          height={200}
          style={{ objectFit: "contain", borderRadius: 8 }}
        />
      </div>

      <h3 style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>
        {producto.titulo}
      </h3>
      <p style={{ margin: "6px 0", color: "#666" }}>${producto.precio}</p>

      <button
        onClick={handleAgregar}
        style={{
          marginTop: 10,
          padding: "10px 16px",
          background: "#007aff",
          color: "white",
          borderRadius: 10,
          cursor: "pointer",
          border: "none",
          boxShadow: "0 4px 10px rgba(0,122,255,0.08)",
        }}
      >
        Agregar
      </button>
    </div>
  );
}
//
