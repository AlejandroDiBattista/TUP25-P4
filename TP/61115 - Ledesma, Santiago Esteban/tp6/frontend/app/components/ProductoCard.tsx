'use client';
import { useState } from 'react';
import AuthModal from './AuthModal';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  valoracion?: number;
  precio: number;
  existencia: number;
  imagen?: string;
}

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAgregarAlCarrito = async () => {
    // usar la misma clave que el resto de la app
    const token = typeof window !== 'undefined' ? localStorage.getItem('tp6_token') : null;
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/carrito`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ producto_id: producto.id, cantidad: 1 }),
      });

      if (!res.ok) throw new Error('Error al agregar producto al carrito');
      
      // Disparar evento personalizado para que el Carrito se actualice
      window.dispatchEvent(new CustomEvent('agregarAlCarrito', { detail: { nombre: producto.nombre } }));
    } catch (error) {
      console.error(error);
      alert('❌ No se pudo agregar al carrito');
    }
  };

  // Url segura de imagen
  const imagenSrc = producto.imagen ? `${API_URL}/${producto.imagen}` : '/placeholder.png';
  
  // Determinar si el producto está agotado
  const agotado = producto.existencia === 0;

  return (
    <>
      <div className={`bg-gradient-to-b from-gray-200 to-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col ${agotado ? 'opacity-60' : ''}`}>
        <div className="relative h-64 w-full flex items-center justify-center bg-gray-100">
          <img src={imagenSrc} alt={producto.nombre || 'Producto'} className="max-h-56 object-contain p-4" />
          {/* Overlay "Agotado" */}
          {agotado && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                Agotado
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-800">{producto.nombre}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{producto.descripcion}</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 bg-gray-300 px-2 py-1 rounded">{producto.categoria}</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${agotado ? 'bg-red-100 text-red-700' : 'bg-gray-300 text-gray-700'}`}>
              {agotado ? 'Sin stock' : `Stock: ${producto.existencia}`}
            </span>
          </div>
          <span className="text-2xl font-bold text-black mt-2">${producto.precio}</span>

          <button
            onClick={handleAgregarAlCarrito}
            disabled={agotado}
            className={`w-full py-2 rounded-lg mt-3 font-semibold transition-colors ${
              agotado
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
          >
            {agotado ? '✕ No disponible' : '🛒 Agregar al carrito'}
          </button>
        </div>
      </div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
