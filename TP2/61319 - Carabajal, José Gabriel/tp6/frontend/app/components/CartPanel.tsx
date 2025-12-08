"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { getCart, addItem, removeItem, cancelarCarrito } from "../services/carrito";
import type { CartView } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CartPanel() {
  const router = useRouter();
  const { session, hydrated } = useAuth();
  const usuarioId = session?.user.id ?? null;

  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // --- helper: refresh estable ---
  const refresh = useCallback(async () => {
    if (!usuarioId) return;
    setErr(null);
    try {
      const data = await getCart(usuarioId);
      setCart(data);
    } catch (e: any) {
      setErr(e?.message ?? "Error al cargar carrito");
    }
  }, [usuarioId]);

  // cargar carrito cuando haya usuario e hidratación de cliente
  useEffect(() => {
    if (hydrated && usuarioId) refresh();
    if (!usuarioId) setCart(null);
  }, [hydrated, usuarioId, refresh]);

  // escuchar evento global para refrescar al agregar desde el catálogo
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("cart:updated", handler as EventListener);
    return () => window.removeEventListener("cart:updated", handler as EventListener);
  }, [refresh]);

  // ---------- ACTUALIZACIÓN ----------
  function optimisticInc(prodId: number) {
    setCart((prev) => {
      if (!prev) return prev;
      const items = prev.items.map((it) =>
        it.producto_id === prodId
          ? { ...it, cantidad: it.cantidad + 1, stock_disponible: Math.max(0, it.stock_disponible - 1) }
          : it
      );
      return { ...prev, items };
    });
  }

  function optimisticDec(prodId: number) {
    setCart((prev) => {
      if (!prev) return prev;
      const cur = prev.items.find((i) => i.producto_id === prodId);
      if (!cur) return prev;
      if (cur.cantidad - 1 <= 0) {
        const items = prev.items.filter((i) => i.producto_id !== prodId);
        return { ...prev, items };
      } else {
        const items = prev.items.map((it) =>
          it.producto_id === prodId
            ? { ...it, cantidad: it.cantidad - 1, stock_disponible: it.stock_disponible + 1 }
            : it
        );
        return { ...prev, items };
      }
    });
  }

  function optimisticRemove(prodId: number) {
    setCart((prev) => {
      if (!prev) return prev;
      const removed = prev.items.find((i) => i.producto_id === prodId);
      const items = prev.items.filter((i) => i.producto_id !== prodId);
      // devolvemos stock a la vista local
      if (removed) {
        
      }
      return { ...prev, items };
    });
  }

  function optimisticCancel() {
    setCart((prev) => (prev ? { ...prev, items: [] } : prev));
  }

  // ------------------------------------------------------

  async function inc(prodId: number) {
    if (!usuarioId) return;
    setLoading(true);
    const snapshot = cart; 
    try {
      optimisticInc(prodId);
      const data = await addItem(usuarioId, prodId, 1);
      setCart(data); 
      window.dispatchEvent(new CustomEvent("cart:updated"));
    } catch (e: any) {
      setCart(snapshot ?? null); 
      setErr(e?.message ?? "No se pudo aumentar la cantidad");
    } finally {
      setLoading(false);
    }
  }

  async function dec(prodId: number) {
    if (!usuarioId) return;
    setLoading(true);
    const snapshot = cart;
    try {
      optimisticDec(prodId);
      await removeItem(usuarioId, prodId);
      await refresh();
      window.dispatchEvent(new CustomEvent("cart:updated"));
    } catch (e: any) {
      setCart(snapshot ?? null);
      setErr(e?.message ?? "No se pudo disminuir la cantidad");
    } finally {
      setLoading(false);
    }
  }

  async function quitar(prodId: number) {
    if (!usuarioId) return;
    setLoading(true);
    const snapshot = cart;
    try {
      optimisticRemove(prodId);
      const data = await removeItem(usuarioId, prodId);
      setCart(data); // sincroniza
      window.dispatchEvent(new CustomEvent("cart:updated"));
    } catch (e: any) {
      setCart(snapshot ?? null);
      setErr(e?.message ?? "No se pudo quitar el producto");
    } finally {
      setLoading(false);
    }
  }

  async function cancelar() {
    if (!usuarioId) return;
    if (!confirm("¿Cancelar el carrito actual?")) return;
    setLoading(true);
    const snapshot = cart;
    try {
      optimisticCancel();
      const data = await cancelarCarrito(usuarioId);
      setCart(data); // sincroniza
      window.dispatchEvent(new CustomEvent("cart:updated"));
    } catch (e: any) {
      setCart(snapshot ?? null);
      setErr(e?.message ?? "No se pudo cancelar el carrito");
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = !cart || cart.items.length === 0;

  if (!hydrated) {
    return <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">Cargando…</div>;
  }

  if (!usuarioId) {
    return <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">Iniciá sesión para ver tu carrito.</div>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold mb-3">Carrito</h2>

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      {isEmpty ? (
        <div className="text-sm text-gray-500">Tu carrito está vacío.</div>
      ) : (
        <>
          <div className="space-y-3">
            {cart!.items.map((it) => {
              const reachedMax = it.cantidad >= it.max_cantidad;
              const agotado = it.stock_disponible <= 0;
              return (
                <div key={it.producto_id} className="flex gap-3 items-start">
                  <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${API_URL}/${it.imagen}`} alt={it.nombre} className="w-16 h-16 object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{it.nombre}</p>
                      <p className="text-sm font-semibold">
                        ${(it.precio_unitario * it.cantidad).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">${it.precio_unitario.toFixed(2)} c/u</p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => dec(it.producto_id)}
                        className="px-2 py-1 rounded-md border text-sm"
                        disabled={loading || it.cantidad <= 1}
                        aria-label="Disminuir"
                      >
                        –
                      </button>

                      <span className="text-sm">Cantidad: {it.cantidad}</span>

                      <button
                        onClick={() => inc(it.producto_id)}
                        className="px-2 py-1 rounded-md border text-sm"
                        disabled={loading || reachedMax || agotado}
                        aria-label="Aumentar"
                        title={
                          agotado
                            ? "Sin stock"
                            : reachedMax
                            ? "Alcanzaste el máximo disponible"
                            : "Aumentar cantidad"
                        }
                      >
                        +
                      </button>

                      <button
                        onClick={() => quitar(it.producto_id)}
                        className="ml-auto px-2 py-1 rounded-md border text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Quitar
                      </button>

                      {agotado && <span className="text-xs text-red-600 ml-2">Agotado</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t pt-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>${cart!.totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA</span><span>${cart!.totals.iva.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Envío</span><span>${cart!.totals.envio.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-base mt-1"><span>Total</span><span>${cart!.totals.total.toFixed(2)}</span></div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={cancelar} className="px-3 py-2 rounded-md border text-sm" disabled={loading}>
              Cancelar
            </button>
            <button
              onClick={() => router.push("/finalizar-compra")}
              className="ml-auto px-3 py-2 rounded-md bg-gray-900 text-white text-sm"
              disabled={loading || isEmpty}
            >
              Continuar compra
            </button>
          </div>
        </>
      )}
    </div>
  );
}
