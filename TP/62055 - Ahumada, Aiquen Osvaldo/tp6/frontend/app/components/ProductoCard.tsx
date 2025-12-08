"use client";

import { Producto } from '../types';
import Image from 'next/image';
import { useState } from 'react';
import { useCarrito } from '../hooks/useCarrito';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { agregarAlCarrito } = useCarrito();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAgregar() {
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await agregarAlCarrito(producto);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          loading="eager"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {producto.titulo}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {producto.descripcion}
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {producto.categoria}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-700">{producto.valoracion}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-blue-600">
            ${producto.precio}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {producto.existencia}
          </span>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-2">Agregado al carrito</div>}
        {producto.existencia <= 0 && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-center font-semibold">No hay stock disponible</div>
        )}
        <button
          className="w-full bg-blue-900 text-white py-2 rounded font-bold mt-2 disabled:bg-gray-400"
          onClick={handleAgregar}
          disabled={loading || producto.existencia <= 0}
        >
          {producto.existencia <= 0 ? 'Sin stock' : loading ? 'Agregando...' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}
