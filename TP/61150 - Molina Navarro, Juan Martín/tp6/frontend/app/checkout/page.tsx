"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

import type { CarritoDetalle, CarritoItem } from "@/app/types";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_USER_UPDATED_EVENT } from "@/lib/auth";
import { cn } from "@/lib/utils";

type LoadState = "idle" | "loading" | "error";
type Mensaje = { tipo: "success" | "error"; texto: string } | null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const calcularIvaItem = (item: CarritoItem) => {
  const tasa = item.categoria.toLowerCase().includes("electr") ? 0.1 : 0.21;
  return Number((item.subtotal * tasa).toFixed(2));
};

export default function CheckoutPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [carrito, setCarrito] = useState<CarritoDetalle | null>(null);
  const [estadoCarrito, setEstadoCarrito] = useState<LoadState>("idle");
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [mensaje, setMensaje] = useState<Mensaje>(null);
  const [confirmando, setConfirmando] = useState(false);

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

  const fetchCarrito = useCallback(async () => {
    if (!token) {
      setCarrito(null);
      setEstadoCarrito("idle");
      return;
    }

    setEstadoCarrito("loading");
    try {
      const response = await fetch(`${API_BASE_URL}/carrito`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el carrito.");
      }

      const data = (await response.json()) as CarritoDetalle;
      setCarrito({
        ...data,
        items: Array.isArray(data.items) ? data.items : [],
      });
      setEstadoCarrito("idle");
    } catch (error) {
      console.error(error);
      setEstadoCarrito("error");
    }
  }, [token]);

  useEffect(() => {
    fetchCarrito();
  }, [fetchCarrito]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setMensaje({ tipo: "error", texto: "Debes iniciar sesión para confirmar la compra." });
      return;
    }
    if (!carrito || carrito.items.length === 0) {
      setMensaje({ tipo: "error", texto: "Tu carrito está vacío." });
      return;
    }

    const direccionValida = direccion.trim();
    const tarjetaValida = tarjeta.trim();

    if (direccionValida.length < 6) {
      setMensaje({ tipo: "error", texto: "Ingresa una dirección válida." });
      return;
    }

    if (tarjetaValida.length < 12) {
      setMensaje({ tipo: "error", texto: "Ingresa un número de tarjeta válido." });
      return;
    }

    setConfirmando(true);
    setMensaje(null);
    try {
      const response = await fetch(`${API_BASE_URL}/carrito/finalizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          direccion: direccionValida,
          tarjeta: tarjetaValida,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail ?? "No se pudo completar la compra.");
      }

      setMensaje({
        tipo: "success",
        texto: data?.mensaje ?? "Compra realizada con éxito.",
      });
      setDireccion("");
      setTarjeta("");
      await fetchCarrito();
      router.push("/compras");
    } catch (error) {
      const texto =
        error instanceof Error ? error.message : "Ocurrió un error inesperado.";
      setMensaje({ tipo: "error", texto });
    } finally {
      setConfirmando(false);
    }
  };

  const renderContenidoCarrito = () => {
    if (estadoCarrito === "loading") {
      return <p className="text-sm text-slate-500">Cargando tu carrito...</p>;
    }

    if (estadoCarrito === "error") {
      return (
        <p className="text-sm text-red-600">
          No pudimos cargar tu carrito. Intenta nuevamente.
        </p>
      );
    }

    if (!carrito || carrito.items.length === 0) {
      return <p className="text-sm text-slate-500">No tienes productos en el carrito.</p>;
    }

    return (
      <>
        <ul className="space-y-5">
          {carrito.items.map((item) => (
            <li key={item.producto_id} className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-base font-medium text-slate-900">{item.titulo}</p>
                <p className="text-sm text-slate-500">Cantidad: {item.cantidad}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-base font-semibold text-slate-900">
                  {formatCurrency(item.subtotal)}
                </p>
                <p className="text-sm text-slate-500">
                  IVA: {formatCurrency(calcularIvaItem(item))}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
          <div className="text-sm text-slate-600 flex justify-between">
            <span>Total productos:</span>
            <span>{formatCurrency(carrito.subtotal)}</span>
          </div>
          <div className="text-sm text-slate-600 flex justify-between">
            <span>IVA:</span>
            <span>{formatCurrency(carrito.iva)}</span>
          </div>
          <div className="text-sm text-slate-600 flex justify-between">
            <span>Envío:</span>
            <span>{formatCurrency(carrito.envio)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total a pagar:</span>
            <span>{formatCurrency(carrito.total)}</span>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader active="products" />
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Finalizar compra</h1>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xl font-semibold text-slate-900">Resumen del carrito</p>
            <div className="mt-6 space-y-5">{renderContenidoCarrito()}</div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xl font-semibold text-slate-900">Datos de envío</p>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900" htmlFor="direccion">
                Dirección
              </label>
              <Input
                id="direccion"
                value={direccion}
                onChange={(event) => setDireccion(event.target.value)}
                placeholder="Ej: Av. Siempre Viva 742"
                className="h-12 rounded-xl border-slate-200 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900" htmlFor="tarjeta">
                Tarjeta
              </label>
              <Input
                id="tarjeta"
                value={tarjeta}
                onChange={(event) => setTarjeta(event.target.value)}
                placeholder="Número de tarjeta"
                className="h-12 rounded-xl border-slate-200 text-base"
                required
              />
            </div>

            <Button
              type="submit"
              className="mt-2 rounded-xl bg-slate-900 py-6 text-base text-white hover:bg-slate-800"
              disabled={
                confirmando ||
                !carrito ||
                carrito.items.length === 0 ||
                estadoCarrito !== "idle"
              }
            >
              {confirmando ? "Confirmando..." : "Confirmar compra"}
            </Button>

            {mensaje && (
              <p
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm",
                  mensaje.tipo === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                )}
              >
                {mensaje.texto}
              </p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
