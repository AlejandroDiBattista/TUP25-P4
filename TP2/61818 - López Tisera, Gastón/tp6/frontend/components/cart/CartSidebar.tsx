'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";
import type { Producto } from "@/types/product";
import { apiFetch } from "@/lib/api/client";

const ASSETS_BASE_URL =
  process.env.NEXT_PUBLIC_ASSETS_URL ?? "http://127.0.0.1:8000";

function buildImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${ASSETS_BASE_URL}/${path.replace(/^\//, "")}`;
}

export function CartSidebar() {
  const { user } = useAuth();
  const { cart, totals, loading, addItem, removeItem, cancel } = useCart();
  const [productos, setProductos] = useState<Record<number, Producto>>({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!cart?.items.length) return;
    
    const loadProducts = async () => {
      const productIds = cart.items.map((item) => item.producto_id);
      const uniqueIds = Array.from(new Set(productIds));
      
      try {
        const prods = await Promise.all(
          uniqueIds.map((id) => apiFetch<Producto>(`/productos/${id}`, { cache: "no-store" }))
        );
        const productsMap: Record<number, Producto> = {};
        prods.forEach((prod) => {
          productsMap[prod.id] = prod;
        });
        setProductos(productsMap);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };

    void loadProducts();
  }, [cart?.items]);

  if (!user) {
    return (
      <aside className="w-full border-l border-slate-200 bg-slate-50 p-6">
        <p className="text-sm text-slate-600">
          Inicia sesión para ver y editar tu carrito.
        </p>
      </aside>
    );
  }

  if (loading || !cart) {
    return (
      <aside className="w-full border-l border-slate-200 bg-slate-50 p-6">
        <p className="text-sm text-slate-600">Cargando carrito...</p>
      </aside>
    );
  }

  const handleIncrement = async (productoId: number) => {
    try {
      const producto = productos[productoId];
      const cartItem = cart?.items.find((item) => item.producto_id === productoId);
      if (producto && cartItem && cartItem.cantidad >= producto.existencia) {
        // No hacer nada si ya alcanzó el stock máximo
        return;
      }
      await addItem({ producto_id: productoId, cantidad: 1 });
    } catch (error) {
      console.error("Error al incrementar:", error);
    }
  };

  const handleDecrement = async (productoId: number) => {
    try {
      const cartItem = cart?.items.find((item) => item.producto_id === productoId);
      if (cartItem && cartItem.cantidad > 1) {
        // Si hay más de 1, decrementar
        await addItem({ producto_id: productoId, cantidad: -1 });
      } else {
        // Si solo hay 1, eliminar del carrito
        await removeItem(productoId);
      }
    } catch (error) {
      console.error("Error al decrementar:", error);
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    setShowCancelConfirm(false);
    try {
      await cancel();
    } catch (error) {
      console.error("Error al cancelar:", error);
    }
  };

  const handleCancelCancel = () => {
    setShowCancelConfirm(false);
  };

  const isEmpty = !cart.items.length;

  return (
    <aside className="w-full border-l border-slate-200 bg-slate-50 p-6">
      {isEmpty ? (
        <div className="text-center text-sm text-slate-600">
          Tu carrito está vacío
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Items */}
          <div className="flex flex-col gap-3">
            {cart.items.map((item) => {
              const producto = productos[item.producto_id];
              if (!producto) return null;

              return (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <Image
                    src={buildImageUrl(producto.imagen)}
                    alt={producto.titulo}
                    width={64}
                    height={64}
                    className="h-16 w-16 flex-shrink-0 rounded object-contain"
                    unoptimized
                  />
                  <div className="flex flex-1 flex-col">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {producto.titulo}
                    </h4>
                    <p className="text-xs text-slate-600">
                      ${producto.precio.toFixed(2)} c/u
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-900">Cantidad:</span>
                      <button
                        type="button"
                        onClick={() => handleDecrement(item.producto_id)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-sm font-bold text-slate-900 hover:bg-slate-100"
                      >
                        −
                      </button>
                      <span className="min-w-[20px] text-center text-sm font-bold text-slate-900">{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(item.producto_id)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-sm font-bold text-slate-900 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totales */}
          {totals && (
            <div className="space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-900">Subtotal</span>
                <span className="font-medium text-slate-900">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-900">IVA</span>
                <span className="font-medium text-slate-900">${totals.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-900">Envío</span>
                <span className="font-medium text-slate-900">${totals.envio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
                <span className="text-slate-900">Total</span>
                <span className="text-slate-900">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Confirmación de cancelar */}
          {showCancelConfirm && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="mb-3 text-sm text-slate-800">
                ¿Estás seguro de cancelar la compra y vaciar el carrito?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelConfirm}
                  className="flex-1 rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  onClick={handleCancelCancel}
                  className="flex-1 rounded bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancelClick}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ✕ Cancelar
            </button>
            <Link
              href="/carrito"
              className="flex flex-1 items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Continuar compra
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

