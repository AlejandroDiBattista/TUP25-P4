import Image from "next/image";

import type { Producto } from "@/types/product";

const ASSETS_BASE_URL =
  process.env.NEXT_PUBLIC_ASSETS_URL ?? "http://127.0.0.1:8000";

interface ProductCardProps {
  producto: Producto;
  onAddToCart?: (producto: Producto) => void | Promise<void>;
  isAdding?: boolean;
}

function buildImageUrl(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }
  return `${ASSETS_BASE_URL}/${path.replace(/^\//, "")}`;
}

export default function ProductCard({
  producto,
  onAddToCart,
  isAdding = false,
}: ProductCardProps) {
  const agotado = producto.existencia <= 0;
  const imageUrl = buildImageUrl(producto.imagen);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow transition hover:shadow-md">
      <div className="relative flex h-64 items-center justify-center bg-slate-50">
        <Image
          src={imageUrl}
          alt={producto.titulo}
          width={320}
          height={320}
          className="h-full w-full object-contain p-6"
          priority={false}
          unoptimized
        />
        {agotado && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold uppercase text-white">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
            {producto.titulo}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
            {producto.descripcion}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
            {producto.categoria}
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-500">
            <span aria-hidden="true">★</span>
            {producto.valoracion.toFixed(1)}
          </span>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm">
        <span className="text-2xl font-bold text-blue-600">
          ${producto.precio.toFixed(2)}
        </span>
        <button
          type="button"
          onClick={() => onAddToCart?.(producto)}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={agotado || isAdding || !onAddToCart}
        >
          {agotado ? "Sin stock" : isAdding ? "Agregando..." : "Agregar al carrito"}
        </button>
      </footer>
    </article>
  );
}

