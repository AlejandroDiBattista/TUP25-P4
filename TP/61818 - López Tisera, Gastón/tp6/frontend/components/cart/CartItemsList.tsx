import Image from "next/image";

import type { CartItem } from "@/types/cart";
import type { Producto } from "@/types/product";

const ASSETS_BASE_URL =
  process.env.NEXT_PUBLIC_ASSETS_URL ?? "http://127.0.0.1:8000";

interface CartItemsListProps {
  items: CartItem[];
  productosMap: Map<number, Producto>;
  onRemove: (productoId: number) => void | Promise<void>;
  onIncrease: (productoId: number) => void | Promise<void>;
  loadingId: number | null;
}

function buildImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${ASSETS_BASE_URL}/${path.replace(/^\//, "")}`;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);

export function CartItemsList({
  items,
  productosMap,
  onRemove,
  onIncrease,
  loadingId,
}: CartItemsListProps): JSX.Element {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <span className="text-4xl" aria-hidden="true">
          🛍️
        </span>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          Tu carrito está vacío
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Agregá productos desde el catálogo para verlos acá y avanzar con tu compra.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const producto = productosMap.get(item.producto_id);
        const precioUnitario = producto?.precio ?? 0;
        const total = item.cantidad * precioUnitario;
        const agotado = (producto?.existencia ?? 0) <= 0;

        return (
          <li
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-1 items-start gap-4">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                {producto ? (
                  <Image
                    src={buildImageUrl(producto.imagen)}
                    alt={producto.titulo}
                    width={120}
                    height={120}
                    className="h-full w-full object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm text-slate-500">Producto #{item.producto_id}</span>
                )}
                {agotado && (
                  <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold uppercase text-white">
                    Sin stock
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {producto?.titulo ?? `Producto #${item.producto_id}`}
                  </h3>
                  {producto ? (
                    <p className="text-sm text-slate-500">{producto.categoria}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">
                    Cantidad: {item.cantidad}
                  </span>
                  <span>Precio unitario: {formatCurrency(precioUnitario)}</span>
                  <span className="font-semibold text-slate-900">
                    Total: {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onIncrease(item.producto_id)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={agotado || loadingId === item.id}
              >
                Agregar uno más
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.producto_id)}
                className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loadingId === item.id}
              >
                Quitar del carrito
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

