'use client';

import Image from 'next/image';
import { useCart } from '../providers/CartProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CartItemsList() {
  const { carrito, quitar, cargando } = useCart();

  if (!carrito || carrito.items.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-4">
      {carrito.items.map((item) => (
        <li
          key={item.producto_id}
          className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          {item.imagen && (
            <div className="relative h-16 w-16 overflow-hidden rounded-md bg-white">
              <Image
                src={`${API_URL}/${item.imagen}`}
                alt={item.nombre}
                fill
                className="object-contain"
                sizes="64px"
                unoptimized
              />
            </div>
          )}
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-semibold text-slate-700">{item.nombre}</span>
            <span className="text-xs text-slate-500">Cantidad: {item.cantidad}</span>
          </div>
          <div className="text-right text-sm font-semibold text-slate-700">
            ${item.subtotal.toFixed(2)}
          </div>
          <button
            className="rounded-lg border border-transparent px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 transition hover:border-red-200 hover:text-red-500"
            onClick={() => quitar(item.producto_id)}
            disabled={cargando}
          >
            Quitar
          </button>
        </li>
      ))}
    </ul>
  );
}
