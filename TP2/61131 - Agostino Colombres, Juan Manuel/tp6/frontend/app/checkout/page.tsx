"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { crearCompra } from "../services/compras";
import type { Producto } from "../types";

const CART_STORAGE_KEY = "cartItems";
const DEFAULT_IVA_RATE = 0.21;
const ELECTRONICS_IVA_RATE = 0.1;
const ELECTRONICS_CATEGORY = "electrónica";
const SHIPPING_FLAT = 50;
const FREE_SHIPPING_THRESHOLD = 1000;

interface CartItem {
  producto: Producto;
  cantidad: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
      return [];
    }

    try {
      return JSON.parse(storedCart) as CartItem[];
    } catch (parseError) {
      if (process.env.NODE_ENV !== "production") {
        console.error("No pudimos leer el carrito", parseError);
      }
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
  });
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leemos token al montar la vista y reaccionamos a cambios del storage.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = window.localStorage.getItem("token");
    if (!token) {
      router.replace("/login?mode=login");
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) {
        return;
      }

      if (!event.newValue) {
        setCartItems([]);
        return;
      }

      try {
        setCartItems(JSON.parse(event.newValue) as CartItem[]);
      } catch (parseError) {
        if (process.env.NODE_ENV !== "production") {
          console.error("No pudimos leer el carrito", parseError);
        }
        setCartItems([]);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [router]);

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0),
    [cartItems],
  );
  const iva = useMemo(
    () =>
      cartItems.reduce((acc, item) => {
        const rate =
          item.producto.categoria.toLowerCase() === ELECTRONICS_CATEGORY
            ? ELECTRONICS_IVA_RATE
            : DEFAULT_IVA_RATE;
        return acc + item.producto.precio * item.cantidad * rate;
      }, 0),
    [cartItems],
  );
  const totalAntesEnvio = subtotal + iva;
  const envio = cartItems.length === 0
    ? 0
    : totalAntesEnvio > FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FLAT;
  const total = subtotal + iva + envio;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMensaje(null);

    if (cartItems.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    if (!direccion.trim() || !tarjeta.trim()) {
      setError("Completa todos los datos de envío.");
      return;
    }

    const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
    if (!token) {
      setError("Tu sesión caducó. Inicia sesión nuevamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        direccion: direccion.trim(),
        tarjeta: tarjeta.trim(),
        items: cartItems.map(({ producto, cantidad }) => ({
          producto_id: producto.id,
          cantidad,
        })),
      };

  const compra = await crearCompra(payload, token);

  setMensaje(`¡Compra #${compra.id} confirmada! Total ${formatCurrency(compra.total)}.`);
      setCartItems([]);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      }

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "No pudimos confirmar la compra.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Finalizar compra</h1>

      {mensaje && (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensaje}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Resumen del carrito</h2>
          <p className="text-sm text-gray-800">Revisa los productos antes de pagar.</p>

          {cartItems.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-800">
              No hay productos en tu carrito.
            </p>
          ) : (
            <ul className="mt-6 space-y-5">
              {cartItems.map(({ producto, cantidad }) => {
                const itemSubtotal = producto.precio * cantidad;
                const rate =
                  producto.categoria.toLowerCase() === ELECTRONICS_CATEGORY
                    ? ELECTRONICS_IVA_RATE
                    : DEFAULT_IVA_RATE;
                const itemIva = itemSubtotal * rate;

                return (
                  <li key={producto.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{producto.titulo}</p>
                      <p className="text-sm text-gray-800">Cantidad: {cantidad}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(itemSubtotal)}</p>
                      <p className="text-xs text-gray-800">IVA: {formatCurrency(itemIva)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-6 space-y-2 text-sm text-gray-900">
            <div className="flex justify-between">
              <span>Total productos</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA estimado</span>
              <span>{formatCurrency(iva)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>{envio === 0 ? "Gratis" : formatCurrency(envio)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Total a pagar</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <form
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-semibold text-gray-900">Datos de envío</h2>
                <p className="text-sm text-gray-800">Completa los campos para confirmar tu pedido.</p>

          <label className="mt-6 block text-sm font-medium text-gray-900" htmlFor="direccion">
                  Dirección
          </label>
          <input
            id="direccion"
            value={direccion}
            onChange={(event) => setDireccion(event.target.value)}
            placeholder="Calle falsa 123"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />

          <label className="mt-4 block text-sm font-medium text-gray-900" htmlFor="tarjeta">
                  Tarjeta
          </label>
          <input
            id="tarjeta"
            value={tarjeta}
            onChange={(event) => setTarjeta(event.target.value)}
            placeholder="0000 0000 0000 0000"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Confirmar compra"}
          </button>
        </form>
      </section>
    </main>
  );
}
