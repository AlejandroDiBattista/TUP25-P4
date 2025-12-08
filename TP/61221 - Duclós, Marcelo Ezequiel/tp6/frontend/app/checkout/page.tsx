'use client'

import { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, subtotal, iva, envio, total, vaciarCarrito } = useCarrito();
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const [datosEnvio, setDatosEnvio] = useState({
    direccion: '',
    tarjeta: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!token) {
      router.push('/login');
      return;
    }

    if (!datosEnvio.direccion.trim()) {
      setError('Por favor ingresa una dirección de entrega');
      setLoading(false);
      return;
    }

    if (!datosEnvio.tarjeta.trim()) {
      setError('Por favor ingresa la información de tu tarjeta');
      setLoading(false);
      return;
    }

    try {
      // Finalizar compra con los datos de envío
      const response = await fetch(`${API_URL}/carrito/finalizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          direccion: datosEnvio.direccion,
          tarjeta: datosEnvio.tarjeta
        }),
      });

      if (response.ok) {
        vaciarCarrito();
        // Forzar recarga de productos enviando señal
        window.localStorage.setItem('forceProductRefresh', Date.now().toString());
        router.push('/compras?success=true');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al procesar la compra');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatosEnvio(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No hay productos en el carrito</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Ir a comprar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen del carrito */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del carrito</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.producto.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded">
                      <Image
                        src={`${API_URL}/${item.producto.imagen}`}
                        alt={item.producto.titulo}
                        fill
                        className="object-contain p-1 rounded"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate text-base leading-tight">
                        {item.producto.titulo}
                      </h3>
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        Cantidad: {item.cantidad}
                      </p>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        IVA: {item.producto.categoria.toLowerCase().includes('electrón') ? '21%' : '10.5%'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-gray-900">
                        ${(item.producto.precio * item.cantidad).toFixed(2)}
                      </p>
                      <p className="text-sm font-medium text-gray-600 mt-1">
                        ${item.producto.precio} c/u
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="bg-white rounded-lg p-6 mt-6 shadow-sm">
              <h3 className="font-black text-xl mb-6 text-gray-900">Resumen de costos</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Total productos:</span>
                  <span className="font-bold text-lg text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">IVA:</span>
                  <span className="font-bold text-lg text-gray-900">${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Envío:</span>
                  <span className="font-bold text-lg">
                    {envio === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      <span className="text-gray-900">${envio.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                <hr className="my-4 border-gray-300" />
                <div className="flex justify-between items-center font-black text-2xl">
                  <span className="text-gray-900">Total a pagar:</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Datos de envío */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Datos de envío</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="direccion" className="block text-sm font-bold text-gray-900 mb-3">
                      Dirección
                    </label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      required
                      value={datosEnvio.direccion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                      placeholder="Calle, número, ciudad, código postal"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 text-lg">Información de pago</h3>
                <div>
                  <label htmlFor="tarjeta" className="block text-sm font-bold text-gray-900 mb-3">
                    Tarjeta
                  </label>
                  <input
                    type="text"
                    id="tarjeta"
                    name="tarjeta"
                    required
                    value={datosEnvio.tarjeta}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                    placeholder="**** **** **** 1234"
                    maxLength={19}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <button
                  type="submit"
                  disabled={loading || !datosEnvio.direccion || !datosEnvio.tarjeta}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando compra...' : 'Confirmar compra'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/carrito')}
                  className="w-full mt-4 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  ✕ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}