'use client';

import { useMemo, useState } from 'react';
import { formatCurrency, formatDateTime } from '../lib/format';
import type { Compra } from '../types';

interface MisComprasViewProps {
  compras: Compra[];
  initialCompraId?: number;
}

export default function MisComprasView({ compras, initialCompraId }: MisComprasViewProps) {
  const [compraSeleccionadaId, setCompraSeleccionadaId] = useState(() => {
    if (initialCompraId) {
      const existe = compras.some((compra) => compra.id === initialCompraId);
      if (existe) {
        return initialCompraId;
      }
    }

    return compras[0]?.id ?? null;
  });

  const compraSeleccionada = useMemo(() => {
    if (compraSeleccionadaId === null) {
      return compras[0];
    }

    return compras.find((compra) => compra.id === compraSeleccionadaId) ?? compras[0];
  }, [compras, compraSeleccionadaId]);

  if (!compraSeleccionada) {
    return null;
  }

  const subtotal = Math.max(compraSeleccionada.total - compraSeleccionada.iva - compraSeleccionada.envio, 0);
  const tasaIva = subtotal > 0 ? compraSeleccionada.iva / subtotal : 0;

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Mis compras</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {compras.map((compra) => {
            const activa = compra.id === compraSeleccionada.id;

            return (
              <button
                key={compra.id}
                type="button"
                onClick={() => setCompraSeleccionadaId(compra.id)}
                className={`w-full rounded-xl border p-4 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                  activa
                    ? 'border-slate-900 bg-white'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow'
                }`}
                aria-pressed={activa}
              >
                <p className="text-sm font-semibold text-slate-900">Compra #{compra.id}</p>
                <p className="text-xs text-slate-500">{formatDateTime(compra.fecha)}</p>
                <p className="mt-2 text-sm font-medium text-slate-700">Total: {formatCurrency(compra.total)}</p>
              </button>
            );
          })}
        </aside>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Detalle de la compra</h2>
              <p className="text-sm text-slate-500">Compra #{compraSeleccionada.id}</p>
            </div>
            <div className="text-xs text-slate-500 text-right sm:text-left">
              <p>{formatDateTime(compraSeleccionada.fecha)}</p>
              <p>Tarjeta: {compraSeleccionada.tarjeta}</p>
            </div>
          </div>

          <div className="grid gap-1 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-900">Dirección:</span> {compraSeleccionada.direccion}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Productos</h3>
            <div className="space-y-4">
              {compraSeleccionada.items.map((item) => {
                const itemTotal = item.precio_unitario * item.cantidad;
                const itemIva = tasaIva > 0 ? itemTotal * tasaIva : 0;

                return (
                  <article key={item.id} className="space-y-1 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.nombre}</p>
                        <p className="text-xs text-slate-500">Cantidad: {item.cantidad}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(itemTotal)}</span>
                    </div>
                    {tasaIva > 0 ? <p className="text-xs text-slate-400">IVA: {formatCurrency(itemIva)}</p> : null}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA</span>
              <span>{formatCurrency(compraSeleccionada.iva)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>{formatCurrency(compraSeleccionada.envio)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-slate-900">
              <span>Total pagado</span>
              <span>{formatCurrency(compraSeleccionada.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
