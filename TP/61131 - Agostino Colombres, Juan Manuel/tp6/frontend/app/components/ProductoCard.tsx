import Image from "next/image";

import { Producto } from "../types";

interface ProductoCardProps {
  producto: Producto;
  onAdd: (producto: Producto) => void;
  isAuthenticated: boolean;
}

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export default function ProductoCard({ producto, onAdd, isAuthenticated }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const hayStock = producto.existencia > 0;

  const handleAddClick = () => {
    if (!hayStock || !isAuthenticated) {
      return;
    }
    onAdd(producto);
  };

  return (
    <article className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={producto.titulo}
          fill
          sizes="112px"
          className="object-contain p-3"
          unoptimized
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{producto.titulo}</h3>
          <p className="mt-1 text-sm text-gray-600">{producto.descripcion}</p>
          <p className="mt-2 text-xs font-medium text-gray-500">Categoría: {producto.categoria}</p>
        </div>

        <div className="mt-3 flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-right sm:text-left">
            <p className="text-xl font-bold text-gray-900">{formatter.format(producto.precio)}</p>
            <p className={`text-sm font-medium ${hayStock ? "text-green-600" : "text-gray-500"}`}>
              {hayStock ? `Disponible: ${producto.existencia}` : "Agotado"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            disabled={!hayStock || !isAuthenticated}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              hayStock && isAuthenticated
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "cursor-not-allowed bg-gray-200 text-gray-500"
            }`}
          >
            {hayStock ? "Agregar al carrito" : "Sin stock"}
          </button>
        </div>
      </div>
    </article>
  );
}
