
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";
import { CartData } from "../../components/CartPanel";

const CheckoutPage: React.FC = () => {
  const { token } = useAuth();
  const router = useRouter();

  const [carrito, setCarrito] = useState<CartData | null>(null);
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    (async () => {
      try {
        const data = await apiFetch("/carrito", {}, token);
        setCarrito(data);
      } catch {
        setError("No se pudo cargar el carrito");
      }
    })();
  }, [token, router]);

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await apiFetch(
        "/carrito/finalizar",
        {
          method: "POST",
          body: JSON.stringify({ direccion, tarjeta }),
        },
        token
      );
      router.push("/orders");
    } catch (e: any) {
      setError("No se pudo finalizar la compra");
    }
  };

  if (!carrito) {
    return (
      <p className="text-sm text-slate-500">
        Cargando resumen del carrito...
      </p>
    );
  }

  return (
    <div className="flex w-full gap-6">
      <section className="flex-1 rounded-xl border bg-white p-4 shadow-sm">
        <h1 className="mb-3 text-xl font-semibold">Finalizar compra</h1>
        {carrito.items.map((item) => (
          <div
            key={item.articulo_id}
            className="flex items-center justify-between border-b py-2 last:border-none"
          >
            <div>
              <p className="text-sm font-medium">{item.nombre}</p>
              <p className="text-xs text-slate-500">
                Cantidad: {item.cantidad} · ${item.precio_unitario.toFixed(2)} c/u
              </p>
            </div>
            <span className="text-sm font-semibold">
              ${item.subtotal.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="mt-4 space-y-1 text-sm">
          <p>
            Subtotal:{" "}
            <span className="font-semibold">
              ${carrito.subtotal.toFixed(2)}
            </span>
          </p>
          <p>
            IVA: <span className="font-semibold">${carrito.iva.toFixed(2)}</span>
          </p>
          <p>
            Envío:{" "}
            <span className="font-semibold">
              ${carrito.envio.toFixed(2)}
            </span>
          </p>
          <p className="text-base">
            Total a pagar:{" "}
            <span className="font-bold text-indigo-700">
              ${carrito.total.toFixed(2)}
            </span>
          </p>
        </div>
      </section>

      <section className="w-80 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Datos de envío</h2>
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <form className="space-y-3" onSubmit={handleConfirmar}>
          <label className="block text-sm">
            Dirección
            <input
              className="mt-1 w-full rounded-md border px-2 py-2 text-sm"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Tarjeta
            <input
              className="mt-1 w-full rounded-md border px-2 py-2 text-sm"
              placeholder="**** **** **** 1234"
              value={tarjeta}
              onChange={(e) => setTarjeta(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white"
          >
            Confirmar compra
          </button>
        </form>
      </section>
    </div>
  );
};

export default CheckoutPage;
