'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { obtenerCarrito, quitarDelCarrito, cancelarCompra } from '../services/productos';
import { Carrito } from '../types';
import Image from 'next/image';
import Link from 'next/link';

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    cargarCarrito();
  }, [isAuthenticated]);

  const cargarCarrito = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await obtenerCarrito(token);
      setCarrito(data);
    } catch (error: any) {
      console.error('Error al cargar carrito:', error);
      setMensaje(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (productoId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await quitarDelCarrito(productoId, token);
      setMensaje('Producto eliminado del carrito');
      setTimeout(() => setMensaje(''), 3000);
      await cargarCarrito();
    } catch (error: any) {
      setMensaje(error.message || 'Error al eliminar producto');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const handleCancelar = async () => {
    if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await cancelarCompra(token);
      setMensaje('Carrito vaciado exitosamente');
      setTimeout(() => setMensaje(''), 3000);
      await cargarCarrito();
    } catch (error: any) {
      setMensaje(error.message || 'Error al cancelar');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {mensaje && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {mensaje}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Carrito</h1>

        {!carrito || carrito.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Tu carrito está vacío</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Ir a comprar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {carrito.items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={`${API_URL}/${item.imagen}`}
                      alt={item.titulo}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.categoria}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-blue-600 font-semibold">${item.precio}</span>
                      <span className="text-gray-600">x {item.cantidad}</span>
                      <span className="text-gray-900 font-semibold">
                        = ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEliminar(item.producto_id)}
                    className="text-red-600 hover:text-red-800 font-medium self-start"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de Compra</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>${carrito.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>IVA:</span>
                    <span>${carrito.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío:</span>
                    <span>{carrito.envio === 0 ? 'GRATIS' : `$${carrito.envio}`}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span>${carrito.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-3 rounded-md font-medium transition-colors"
                  >
                    Finalizar Compra
                  </Link>
                  
                  <button
                    onClick={handleCancelar}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
                  >
                    Vaciar Carrito
                  </button>
                  
                  <Link
                    href="/"
                    className="block w-full text-center text-blue-600 hover:text-blue-800 py-2"
                  >
                    Seguir comprando
                  </Link>
                </div>

                {carrito.subtotal < 1000 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800">
                      💡 Agrega ${(1000 - carrito.subtotal).toFixed(2)} más para obtener envío gratis
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
