'use client';

import { Producto } from '../types';
import Image from 'next/image';
import { Button } from './ui/button';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { agregarAlCarrito } from '../services/carrito';
import { useRouter } from 'next/navigation';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { token, isAutenticado } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAgregarCarrito = async () => {
    if (!isAutenticado) {
      router.push('/auth');
      return;
    }

    if (!token) return;

    try {
      setIsAdding(true);
      setError(null);
      await agregarAlCarrito(token, producto.id, 1);
      // Redirigir al carrito
      router.push('/carrito');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

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
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-blue-600">
            ${producto.precio}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {producto.existencia}
          </span>
        </div>
        {error && (
          <p className="text-xs text-red-600 mb-2">{error}</p>
        )}
        <Button
          className={`w-full ${producto.existencia === 0 ? 'bg-gray-300 text-gray-600 hover:bg-gray-300 cursor-not-allowed' : ''}`}
          onClick={handleAgregarCarrito}
          disabled={isAdding || producto.existencia === 0}
        >
          {isAdding ? 'Agregando...' : producto.existencia === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
      </div>
    </div>
  );
}
