'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { obtenerCarrito, finalizarCompra } from '../services/productos';
import { Carrito } from '../types';

export default function CheckoutPage() {
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

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
      if (!data.items || data.items.length === 0) {
        router.push('/carrito');
        return;
      }
      setCarrito(data);
    } catch (error: any) {
      console.error('Error al cargar carrito:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!direccion.trim()) {
      setError('La dirección es obligatoria');
      return;
    }

    if (!tarjeta.trim()) {
      setError('El número de tarjeta es obligatorio');
      return;
    }

    setProcesando(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await finalizarCompra(direccion, tarjeta, token);
      router.push('/compras?success=true');
    } catch (error: any) {
      setError(error.message || 'Error al finalizar la compra');
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!carrito) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Datos de Envío y Pago</h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de Envío *
                  </label>
                  <textarea
                    id="direccion"
                    rows={3}
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Calle, número, ciudad, código postal..."
                  />
                </div>

                <div>
                  <label htmlFor="tarjeta" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Tarjeta *
                  </label>
                  <input
                    id="tarjeta"
                    type="text"
                    required
                    value={tarjeta}
                    onChange={(e) => setTarjeta(e.target.value)}
                    maxLength={16}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1234 5678 9012 3456"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Este es un sistema de demostración. No uses información real.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/carrito')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Volver al Carrito
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesando ? 'Procesando...' : 'Confirmar Compra'}
                </button>
              </div>
            </form>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del Pedido</h2>
              
              <div className="space-y-2 mb-4">
                {carrito.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.titulo} <span className="text-gray-400">x{item.cantidad}</span>
                    </span>
                    <span className="text-gray-900">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
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
                <div className="border-t pt-2">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total:</span>
                    <span>${carrito.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  🔒 Pago seguro. Tu información está protegida.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
