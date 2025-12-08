"use client";

import { useCarritoStore } from "@/store/useCarritoStore";
import { useUserStore } from "@/store/useUserStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const usuario = useUserStore((s) => s.usuario);
  const { items, total, confirmarCompra, cargarCarrito } = useCarritoStore();
  const router = useRouter();

  useEffect(() => {
    if (!usuario) {
      router.push("/auth/login");
      return;
    }
    cargarCarrito(usuario.id);
  }, [usuario]);

  if (!usuario) return null;

  const handleConfirmar = async () => {
    try {
      const mensaje = await confirmarCompra(usuario.id);
      alert(mensaje);
    } catch (error) {
      console.error(error);
      alert("Error al confirmar la compra");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Resumen de Compra
      </h1>

      {items.length === 0 ? (
        <p>No tienes productos en el carrito.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  border: "1px solid #ccc",
                  padding: 15,
                  borderRadius: 8,
                  marginBottom: 15,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: 15 }}>
                  <img
                    src={`http://localhost:8000/${item.producto.imagen}`}
                    width={60}
                    height={60}
                    style={{ borderRadius: 8 }}
                  />

                  <div>
                    <p style={{ margin: 0, fontWeight: "bold" }}>
                      {item.producto.titulo}
                    </p>
                    <p style={{ margin: 0 }}>
                      ${item.producto.precio} x {item.cantidad}
                    </p>
                  </div>
                </div>

                <p style={{ fontWeight: "bold" }}>
                  ${item.producto.precio * item.cantidad}
                </p>
              </li>
            ))}
          </ul>

          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 22, fontWeight: "bold" }}>Total: ${total}</p>
          </div>

          <button
            onClick={handleConfirmar}
            style={{
              width: "100%",
              marginTop: 20,
              padding: 12,
              fontSize: 16,
              background: "green",
              color: "white",
              borderRadius: 8,
              border: "none",
            }}
          >
            Confirmar Compra
          </button>
        </>
      )}
    </div>
  );
}
//
