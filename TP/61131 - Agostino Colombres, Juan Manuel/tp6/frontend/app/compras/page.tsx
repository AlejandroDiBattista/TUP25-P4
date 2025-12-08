"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { listarCompras } from "../services/compras";
import type { CompraDetalleResponse } from "../types";

const ELECTRONICS_CATEGORY = "electrónica";
const DEFAULT_IVA_RATE = 0.21;
const ELECTRONICS_IVA_RATE = 0.1;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const maskCard = (value: string) => {
  if (!value) {
    return "****";
  }
  const digits = value.replace(/\s+/g, "");
  const lastDigits = digits.slice(-4).padStart(4, "*");
  return `**** **** **** ${lastDigits}`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function ComprasPage() {
  const [compras, setCompras] = useState<CompraDetalleResponse[]>([]);
  const [selectedCompraId, setSelectedCompraId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = window.localStorage.getItem("token");
        if (!token) {
          setError("Necesitas iniciar sesión para ver tu historial de compras.");
          setLoading(false);
          return;
        }

        const data = await listarCompras(token);
        if (!isMounted) {
          return;
        }

        setCompras(data);
        if (data.length > 0) {
          setSelectedCompraId(data[0].id);
        }
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        const message = fetchError instanceof Error ? fetchError.message : "No pudimos obtener tus compras.";
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCompra = useMemo(
    () => compras.find((compra) => compra.id === selectedCompraId) ?? null,
    [compras, selectedCompraId],
  );

  const detalleItems = useMemo(() => {
    if (!selectedCompra) {
      return [];
    }

    return selectedCompra.items.map((item) => {
      const rate = item.categoria?.toLowerCase() === ELECTRONICS_CATEGORY ? ELECTRONICS_IVA_RATE : DEFAULT_IVA_RATE;
      const base = item.precio_unitario * item.cantidad;
      const iva = base * rate;
      const total = base + iva;

      return {
        id: `${selectedCompra.id}-${item.producto_id}`,
        nombre: item.nombre,
        cantidad: item.cantidad,
        base,
        total,
        iva,
        precioUnitario: item.precio_unitario,
      };
    });
  }, [selectedCompra]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Mis compras</h1>
        <Link
          href="/"
          className="rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Volver a la tienda
        </Link>
      </div>

      {loading && (
        <p className="mt-6 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          Cargando historial...
        </p>
      )}

      {error && !loading && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && compras.length === 0 && (
        <p className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
          Aún no registramos compras en tu cuenta.
        </p>
      )}

      {!loading && !error && compras.length > 0 && (
        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <aside className="space-y-3">
            {compras.map((compra) => {
              const isActive = compra.id === selectedCompraId;
              return (
                <button
                  key={compra.id}
                  type="button"
                  onClick={() => setSelectedCompraId(compra.id)}
                  className={`w-full rounded-2xl border px-5 py-4 text-left transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow"
                  }`}
                >
                  <p className="text-sm font-semibold">Compra #{compra.id}</p>
                  <p className={`text-xs ${isActive ? "text-slate-100" : "text-gray-500"}`}>
                    {formatDate(compra.fecha)}
                  </p>
                  <p className={`mt-2 text-sm font-semibold ${isActive ? "text-white" : "text-gray-900"}`}>
                    Total: {formatCurrency(compra.total)}
                  </p>
                </button>
              );
            })}
          </aside>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {selectedCompra ? (
              <div className="space-y-6">
                <header className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Detalle de la compra</h2>
                    <p className="text-sm text-gray-500">Compra #{selectedCompra.id}</p>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Fecha:</span> {formatDate(selectedCompra.fecha)}
                    </p>
                    <p>
                      <span className="font-medium">Dirección:</span> {selectedCompra.direccion}
                    </p>
                    <p>
                      <span className="font-medium">Tarjeta:</span> {maskCard(selectedCompra.tarjeta)}
                    </p>
                  </div>
                </header>

                <ul className="divide-y divide-gray-100">
                  {detalleItems.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.nombre}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                      </div>
                      <div className="text-right text-sm text-gray-700">
                        <p>Precio unitario: {formatCurrency(item.precioUnitario)}</p>
                        <p>IVA: {formatCurrency(item.iva)}</p>
                        <p className="font-semibold text-gray-900">
                          Total: {formatCurrency(item.total)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-800">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedCompra.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA</span>
                    <span>{formatCurrency(selectedCompra.iva)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{selectedCompra.envio === 0 ? "Gratis" : formatCurrency(selectedCompra.envio)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-gray-900">
                    <span>Total pagado</span>
                    <span>{formatCurrency(selectedCompra.total)}</span>
                  </div>
                </footer>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Seleccioná una compra para ver el detalle.</p>
            )}
          </article>
        </section>
      )}
    </main>
  );
}
