"use client";

import { useState, useEffect } from 'react';
import { Producto } from '../types';
import Image from 'next/image';
import { getToken } from '../services/auth';
import { useCart } from './CartProvider';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [existencia, setExistencia] = useState<number>(producto.existencia || 0);
  const { addToCart } = useCart();

  const disabled = existencia <= 0 || loading;

  async function handleAdd() {
    setError(null);
    setOk(false);
    if (!getToken()) {
      setError('Debes iniciar sesión para agregar al carrito');
      return;
    }
    try {
      setLoading(true);
  // use provider to add so products and cart reload centrally
  await addToCart(producto.id, 1);
      setOk(true);
    } catch (err: any) {
      setError(err.message || 'Error al agregar');
    } finally {
      setLoading(false);
      setTimeout(() => setOk(false), 2000);
    }
  }

  // keep existencia in sync with producto prop updates (reloadProducts)
  useEffect(() => {
    setExistencia(producto.existencia || 0);
  }, [producto.existencia]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 bg-gray-100">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={producto.titulo || `Producto ${producto.id}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">
          {producto.titulo}
        </h3>
        <p className="text-sm text-black mb-3 line-clamp-2">
          {producto.descripcion}
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-black bg-blackgray-100 px-2 py-1 rounded">
            {producto.categoria}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-black">{producto.valoracion}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-blue-600">
            ${producto.precio}
          </span>
          <span className={`text-xs ${existencia <= 0 ? 'text-red-500' : 'text-black'}`}>
            {existencia <= 0 ? 'Agotado' : `Disponible: ${existencia}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            disabled={disabled}
            className={`px-4 py-2 rounded text-white ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            {producto.existencia <= 0 ? 'Sin stock' : loading ? 'Agregando...' : 'Agregar al carrito'}
          </button>
          {ok && <span className="text-sm text-green-600">Agregado</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  );
}
