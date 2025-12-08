// src/app/checkout/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useCarritoStore } from "@/store/useCarritoStore";
import { useUserStore } from "@/store/useUserStore";
import { finalizarCompraBackend } from "@/services/api";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const usuario = useUserStore((s) => s.usuario);
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const items = useCarritoStore((s) => s.items);
  const total = useCarritoStore((s) => s.total);
  const vaciar = useCarritoStore((s) => s.vaciarCarrito);
  const cargarCarrito = useCarritoStore((s) => s.cargarCarrito);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!usuario) router.push("/auth/login");
    else cargarCarrito(usuario.id);
  }, [usuario]);

  if (!usuario) return null;

  const handleConfirm = async () => {
    if (!direccion || !tarjeta) return alert("Completá dirección y tarjeta");
    setLoading(true);
    try {
      await finalizarCompraBackend(usuario.id, { direccion, tarjeta });
      // vaciar carrito en frontend (y backend ya lo vacía)
      await vaciar(usuario.id);
      router.push("/checkout/success");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Error al finalizar la compra");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
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
                  border: "1px solid rgba(0,0,0,0.06)",
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={`http://localhost:8000/${item.producto?.imagen}`}
                    width={60}
                    height={60}
                    style={{ borderRadius: 8, objectFit: "cover" }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>
                      {item.producto?.titulo}
                    </p>
                    <p style={{ margin: 0, color: "#666" }}>
                      ${item.producto?.precio} x {item.cantidad}
                    </p>
                  </div>
                </div>

                <p style={{ fontWeight: "700" }}>
                  ${((item.producto?.precio ?? 0) * item.cantidad).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>

          <div style={{ textAlign: "right", marginTop: 8 }}>
            <p style={{ fontSize: 20, fontWeight: 700 }}>
              Total: ${total.toFixed(2)}
            </p>
          </div>

          <div style={{ marginTop: 18 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              Dirección
            </label>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle, número, ciudad"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.08)",
                marginBottom: 12,
              }}
            />

            <label style={{ display: "block", marginBottom: 6 }}>
              Tarjeta (simulada)
            </label>
            <input
              value={tarjeta}
              onChange={(e) => setTarjeta(e.target.value)}
              placeholder="Número tarjeta"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.08)",
                marginBottom: 12,
              }}
            />

            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 12,
                padding: 12,
                fontSize: 16,
                background: "#007aff",
                color: "white",
                borderRadius: 10,
                border: "none",
                boxShadow: "0 6px 18px rgba(0,122,255,0.08)",
              }}
            >
              {loading ? "Procesando..." : "Confirmar Compra"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
//
