'use client'

import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

export default function CarritoPage() {
  const { 
    items, 
    removerProducto, 
    actualizarCantidad, 
    vaciarCarrito, 
    subtotal, 
    iva, 
    envio, 
    total 
  } = useCarrito();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Inicia sesión para ver tu carrito</p>
          <Link 
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Tu Carrito</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 8M7 13l-1.5-8m0 0h14M7 13h10" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-gray-600 mb-6">
              Inicia sesión para ver y editar tu carrito.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tu Carrito</h1>
          <button
            onClick={vaciarCarrito}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.producto.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg">
                    <Image
                      src={`${API_URL}/${item.producto.imagen}`}
                      alt={item.producto.titulo}
                      fill
                      className="object-contain p-2 rounded-lg"
                      unoptimized
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate leading-tight">
                      {item.producto.titulo}
                    </h3>
                    <p className="text-sm font-medium text-gray-700 mt-1">{item.producto.categoria}</p>
                    <p className="text-xl font-black text-blue-600 mt-2">
                      ${item.producto.precio}
                    </p>
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                        className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center font-bold text-red-700 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold min-w-[2rem] text-center text-gray-900">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                        disabled={item.cantidad >= item.producto.existencia}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                          item.cantidad >= item.producto.existencia
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      Stock: {item.producto.existencia}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-black text-gray-900 mb-2">
                      ${(item.producto.precio * item.cantidad).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removerProducto(item.producto.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del carrito */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">Subtotal</span>
                  <span className="font-bold text-gray-900 text-lg">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">IVA</span>
                  <span className="font-bold text-gray-900 text-lg">${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">Envío</span>
                  <span className="font-bold text-lg">
                    {envio === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      <span className="text-gray-900">${envio.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                <hr className="my-4 border-gray-300" />
                <div className="flex justify-between items-center text-xl font-black">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center block font-bold text-lg shadow-md hover:shadow-lg"
                >
                  Continuar compra
                </Link>
                <Link
                  href="/"
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center block font-semibold"
                >
                  Seguir comprando
                </Link>
              </div>

              {envio === 0 && (
                <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <p className="text-sm font-bold text-green-800 text-center">
                    🎉 ¡Felicidades! Tu pedido califica para envío gratuito
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}