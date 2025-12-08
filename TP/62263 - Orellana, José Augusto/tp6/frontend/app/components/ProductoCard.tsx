import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Producto } from '../types';

interface ProductoCardProps {
  producto: Producto;
  onAgregar?: (producto: Producto) => void;
  deshabilitarAccion?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ProductoCard({ producto, onAgregar, deshabilitarAccion }: ProductoCardProps) {
  const precio = producto.precio.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

  const agotado = producto.existencia === 0;
  const puedeAgregar = Boolean(onAgregar) && !agotado && !deshabilitarAccion;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center sm:gap-6">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-28 sm:w-28">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={producto.titulo}
          fill
          className="object-contain p-3"
          sizes="(max-width: 640px) 96px, (max-width: 1024px) 112px, 112px"
          unoptimized
        />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold leading-tight text-slate-900">
            {producto.titulo}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2">{producto.descripcion}</p>
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Categoría: {producto.categoria}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-48 sm:items-end">
        <div className="text-left sm:text-right">
          <p className="text-sm text-slate-500">
            {agotado ? 'Agotado' : `Disponible: ${producto.existencia}`}
          </p>
          <p className="text-xl font-semibold text-slate-900">{precio}</p>
        </div>
        <Button
          type="button"
          className="h-10 w-full sm:w-auto bg-slate-900 hover:bg-slate-900/90 disabled:bg-slate-200 disabled:text-slate-400"
          onClick={() => onAgregar?.(producto)}
          disabled={!puedeAgregar}
        >
          {agotado ? (
            'Sin stock'
          ) : (
            <>
              <ShoppingCart className="size-4" />
              Agregar al carrito
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
