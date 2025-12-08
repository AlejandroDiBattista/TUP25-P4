"use client";
import { Producto } from '../types';
import Image from 'next/image';
import { agregarAlCarrito } from '../services/carrito';
import { useState } from 'react';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [loading, setLoading] = useState(false);
  const agotado = producto.existencia <= 0;

  async function handleAgregar() {
    if (agotado) return;
    try {
      setLoading(true);
  await agregarAlCarrito(producto.id, 1);
  // Disparar evento global para que el Sidebar se refresque sin F5
  window.dispatchEvent(new Event('cart-updated'));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al agregar';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`bg-white rounded border p-4 flex gap-4 items-start ${agotado ? 'opacity-70' : ''}`}>
      <div className="relative w-28 h-24 flex-shrink-0 bg-gray-100 rounded-md">
        {agotado && (
          <span className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">Agotado</span>
        )}
        <Image src={`${API_URL}/${producto.imagen}`} alt={producto.titulo} fill className="object-contain p-2" unoptimized />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm leading-tight">{producto.titulo}</div>
        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{producto.descripcion}</p>
        <div className="text-[11px] text-gray-500 mt-1">Categoría: {producto.categoria}</div>
      </div>
      <div className="w-40 text-right">
        <div className="font-semibold">${Number(producto.precio).toFixed(2)}</div>
        <div className="text-[11px] text-gray-500 mt-1">Disponible: {producto.existencia}</div>
        <button
          disabled={agotado || loading}
          onClick={handleAgregar}
          className={`mt-2 w-full text-xs font-medium rounded px-3 py-2 ${agotado ? 'bg-gray-300 text-gray-600' : 'bg-gray-900 hover:bg-black text-white'}`}
        >
          {agotado ? 'Sin stock' : loading ? 'Agregando...' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}
