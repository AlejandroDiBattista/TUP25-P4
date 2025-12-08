
"use client";

import React from "react";

export type CartItem = {
  articulo_id: number;
  nombre: string;
  imagen: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

export type CartData = {
  id: number;
  items: CartItem[];
  total_productos: number;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
};

type Props = {
  cart: CartData | null;
  onRemove: (productId: number) => void;
  onClear: () => void;
  onGoCheckout: () => void;
  disabledActions: boolean;
};

export const CartPanel: React.FC<Props> = ({
  cart,
  onRemove,
  onClear,
  onGoCheckout,
  disabledActions,
}) => {
  if (!cart || cart.items.length === 0) {
    return (
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Tu carrito</h2>
        <p className="text-sm text-slate-500">
          Todavía no agregaste productos.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Carrito ({cart.total_productos})</h2>

      <div className="flex-1 space-y-3 max-h-72 overflow-y-auto pr-1">
        {cart.items.map((item) => (
          <div
            key={item.articulo_id}
            className="flex items-start justify-between gap-2 border-b pb-2 last:border-none"
          >
            <div className="flex gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imagen}
                alt={item.nombre}
                className="h-12 w-12 rounded-md object-contain bg-slate-100"
              />
              <div>
                <p className="text-sm font-medium">{item.nombre}</p>
                <p className="text-xs text-slate-500">
                  Cantidad: {item.cantidad}
                </p>
                <p className="text-xs text-slate-500">
                  ${item.precio_unitario.toFixed(2)} c/u
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-semibold">
                ${item.subtotal.toFixed(2)}
              </span>
              <button
                className="text-xs text-red-600 hover:underline disabled:text-slate-400"
                disabled={disabledActions}
                onClick={() => onRemove(item.articulo_id)}
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-2 text-sm space-y-1">
        <p>
          Subtotal:{" "}
          <span className="font-semibold">${cart.subtotal.toFixed(2)}</span>
        </p>
        <p>
          IVA: <span className="font-semibold">${cart.iva.toFixed(2)}</span>
        </p>
        <p>
          Envío: <span className="font-semibold">${cart.envio.toFixed(2)}</span>
        </p>
        <p className="text-base">
          Total:{" "}
          <span className="font-bold text-indigo-700">
            ${cart.total.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 disabled:text-slate-400"
          disabled={disabledActions}
          onClick={onClear}
        >
          Cancelar compra
        </button>
        <button
          className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-300"
          disabled={disabledActions}
          onClick={onGoCheckout}
        >
          Finalizar compra
        </button>
      </div>
    </section>
  );
};
