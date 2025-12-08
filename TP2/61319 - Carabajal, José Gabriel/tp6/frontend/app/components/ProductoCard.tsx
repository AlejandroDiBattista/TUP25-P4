'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Producto } from '../types';
import { useAuth } from './AuthProvider';
import { addItem } from '../services/carrito';

interface ProductoCardProps {
  producto: Producto;
  onAdd?: (productoId: number) => void; 
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function ProductoCard({ producto, onAdd }: ProductoCardProps) {
  const agotado = producto.existencia <= 0;
  const { session } = useAuth();
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (agotado) return;
    if (!session) {
      alert('Inicia sesión para agregar productos al carrito');
      return;
    }
    try {
      setAdding(true);
      await addItem(session.user.id, producto.id, 1);
      onAdd?.(producto.id); 
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 bg-gray-100">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={producto.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          unoptimized
        />
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {producto.titulo}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2">
          {producto.descripcion}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {producto.categoria}
          </span>

          <div className="flex items-center gap-1 text-sm text-gray-700">
            <span className="text-yellow-500">★</span>
            <span>{producto.valoracion}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {fmt.format(producto.precio)}
          </span>

          {agotado ? (
            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">Agotado</span>
          ) : (
            <span className="text-xs text-gray-500">Disponible: {producto.existencia}</span>
          )}
        </div>

        <div className="pt-1">
          <button
            className={`w-full rounded-md px-4 py-2 text-sm font-medium transition 
              ${
                agotado || adding
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            disabled={agotado || adding}
            onClick={handleAdd}
          >
            {agotado ? 'Sin stock' : adding ? 'Agregando…' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}
