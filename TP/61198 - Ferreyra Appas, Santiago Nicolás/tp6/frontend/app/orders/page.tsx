
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";

type CompraResumen = {
  id: number;
  fecha: string;
  total: number;
};

type ProductoCompra = {
  articulo_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

type CompraDetalle = {
  id: number;
  fecha: string;
  direccion_envio: string;
  tarjeta: string;
  subtotal: number;
  iva: number;
  costo_envio: number;
  total: number;
  productos: ProductoCompra[];
};

const OrdersPage: React.FC = () => {
  const { token } = useAuth();
  const router = useRouter();

  const [lista, setLista] = useState<CompraResumen[]>([]);
  const [detalle, setDetalle] = useState<CompraDetalle | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    (async () => {
      const data = await apiFetch("/compras", {}, token);
      setLista(data);
      if (data.length > 0) {
        const det = await apiFetch(`/compras/${data[0].id}`, {}, token);
        setDetalle(det);
      }
    })();
  }, [token, router]);

  const cargarDetalle = async (id: number) => {
    if (!token) return;
    const det = await apiFetch(`/compras/${id}`, {}, token);
    setDetalle(det);
  };

  return (
    <div className="flex w-full gap-6">
      <section className="w-64 rounded-xl border bg-white p-4 shadow-sm">
        <h1 className="mb-3 text-lg font-semibold">Mis compras</h1>
        <div className="space-y-2 text-sm">
          {lista.map((c) => (
            <button
              key={c.id}
              onClick={() => cargarDetalle(c.id)}
              className="w-full rounded-md border px-2 py-2 text-left hover:bg-slate-50"
            >
              <p className="font-medium">Compra #{c.id}</p>
              <p className="text-xs text-slate-500">
                {new Date(c.fecha).toLocaleString()}
              </p>
              <p className="text-xs font-semibold">${c.total.toFixed(2)}</p>
            </button>
          ))}
          {lista.length === 0 && (
            <p className="text-xs text-slate-500">
              Todavía no realizaste compras.
            </p>
          )}
        </div>
      </section>

      <section className="flex-1 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Detalle</h2>
        {!detalle ? (
          <p className="text-sm text-slate-500">
            Seleccioná una compra para ver el detalle.
          </p>
        ) : (
          <>
            <div className="mb-3 text-sm">
              <p className="font-medium">
                Compra #{detalle.id} ·{" "}
                {new Date(detalle.fecha).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                Envio a: {detalle.direccion_envio}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              {detalle.productos.map((p) => (
                <div
                  key={p.articulo_id}
                  className="flex items-center justify-between border-b py-2 last:border-none"
                >
                  <div>
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-xs text-slate-500">
                      Cantidad: {p.cantidad} · ${p.precio_unitario.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    ${p.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <p>
                Subtotal:{" "}
                <span className="font-semibold">
                  ${detalle.subtotal.toFixed(2)}
                </span>
              </p>
              <p>
                IVA:{" "}
                <span className="font-semibold">
                  ${detalle.iva.toFixed(2)}
                </span>
              </p>
              <p>
                Envío:{" "}
                <span className="font-semibold">
                  ${detalle.costo_envio.toFixed(2)}
                </span>
              </p>
              <p className="text-base">
                Total pagado:{" "}
                <span className="font-bold text-indigo-700">
                  ${detalle.total.toFixed(2)}
                </span>
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default OrdersPage;
