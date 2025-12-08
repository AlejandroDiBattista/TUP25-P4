"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Compra } from "@/app/types";
import { SiteHeader } from "@/components/site-header";
import { AUTH_USER_UPDATED_EVENT } from "@/lib/auth";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type LoadState = "idle" | "loading" | "error";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatDate = (value: string) => {
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
};

const calcularIvaItem = (categoria: string, subtotal: number) => {
  const tasa = categoria.toLowerCase().includes("electr") ? 0.1 : 0.21;
  return Number((subtotal * tasa).toFixed(2));
};

export default function ComprasPage() {
  const [token, setToken] = useState<string | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [estado, setEstado] = useState<LoadState>("idle");
  const [seleccionada, setSeleccionada] = useState<Compra | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncToken = () => setToken(window.localStorage.getItem("token"));
    const handleStorage = (_event: StorageEvent) => syncToken();
    const handleAuthEvent = (_event: Event) => syncToken();

    syncToken();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_USER_UPDATED_EVENT, handleAuthEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, handleAuthEvent);
    };
  }, []);

  const fetchCompras = useCallback(async () => {
    if (!token) {
      setCompras([]);
      setSeleccionada(null);
      setEstado("idle");
      return;
    }

    setEstado("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/compras`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el historial");
      }

      const data = await response.json();
      const lista = Array.isArray(data?.compras) ? (data.compras as Compra[]) : [];
      const ordenadas = [...lista].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

      setCompras(ordenadas);
      setSeleccionada(ordenadas[0] ?? null);
      setEstado("idle");
    } catch (error) {
      console.error(error);
      setEstado("error");
    }
  }, [token]);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  const detalleItems = useMemo(() => seleccionada?.items ?? [], [seleccionada]);

  const tarjetaCompleta = seleccionada ? `****-****-****-${seleccionada.tarjeta_final}` : "";

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader active="orders" />
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Mis compras</h1>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
            {estado === "loading" && (
              <p className="text-sm text-slate-500">Cargando tus compras...</p>
            )}
            {estado === "error" && (
              <p className="text-sm text-red-600">
                No pudimos cargar tus compras. Intenta nuevamente.
              </p>
            )}
            {estado === "idle" && compras.length === 0 && (
              <p className="text-sm text-slate-500">Aún no registraste compras.</p>
            )}

            {estado === "idle" && compras.length > 0 && (
              <ul className="space-y-4">
                {compras.map((compra) => {
                  const isActive = seleccionada?.id === compra.id;
                  return (
                    <li key={compra.id}>
                      <button
                        type="button"
                        onClick={() => setSeleccionada(compra)}
                        className={cn(
                          "w-full rounded-2xl border px-4 py-3 text-left transition",
                          isActive
                            ? "border-slate-900 bg-slate-900/5"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <p className="text-base font-semibold text-slate-900">
                          Compra #{compra.id}
                        </p>
                        <p className="text-sm text-slate-500">{formatDate(compra.fecha)}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          Total: {formatCurrency(compra.total)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xl font-semibold text-slate-900">Detalle de la compra</p>

            {!seleccionada ? (
              <p className="mt-6 text-sm text-slate-500">
                Selecciona una compra para ver los detalles.
              </p>
            ) : (
              <div className="mt-6 space-y-6 text-sm text-slate-600">
                <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      Compra #: {seleccionada.id}
                    </p>
                    <p>
                      Dirección: <span className="font-medium">{seleccionada.direccion}</span>
                    </p>
                  </div>
                  <div className="space-y-1 text-left md:text-right">
                    <p>
                      Fecha:{" "}
                      <span className="font-medium">{formatDate(seleccionada.fecha)}</span>
                    </p>
                    <p>
                      Tarjeta: <span className="font-medium">{tarjetaCompleta}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-base font-semibold text-slate-900">Productos</p>
                  <div className="mt-4 divide-y divide-slate-100">
                    {detalleItems.map((item) => (
                      <div
                        key={`${item.producto_id}-${item.titulo}`}
                        className="flex items-start justify-between py-3"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-900">{item.titulo}</p>
                          <p className="text-xs text-slate-500">Cantidad: {item.cantidad}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(item.subtotal)}
                          </p>
                          <p className="text-xs text-slate-500">
                            IVA: {formatCurrency(calcularIvaItem(item.categoria, item.subtotal))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-sm text-slate-700">
                  <p>
                    Subtotal: <span className="font-semibold">{formatCurrency(seleccionada.subtotal)}</span>
                  </p>
                  <p>
                    IVA: <span className="font-semibold">{formatCurrency(seleccionada.iva)}</span>
                  </p>
                  <p>
                    Envío: <span className="font-semibold">{formatCurrency(seleccionada.envio)}</span>
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    Total pagado: {formatCurrency(seleccionada.total)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
