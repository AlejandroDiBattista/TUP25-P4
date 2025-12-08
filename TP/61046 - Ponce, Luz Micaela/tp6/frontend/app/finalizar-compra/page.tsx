"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { finalizarCompra } from '../services/cart';
import { Separator } from '../components/ui/separator';

export default function FinalizarCompraPage() {
  const { cart, fetchCart } = useCart();
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await finalizarCompra(direccion, tarjeta);
      await fetchCart();
      router.push('/compras?exito=true');

    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Finalizar compra
        </h1>

        {!cart || cart.productos.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {cart ? 'Tu carrito está vacío' : 'Cargando carrito...'}
            </h2>
            <p className="mt-2 text-gray-600">
              {cart ? 'No puedes finalizar una compra sin productos.' : 'Por favor, espera un momento...'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Resumen del carrito</h2>

              <div className="space-y-4 mb-6">
                {cart.productos.map((item) => (
                  <div key={item.producto.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{item.producto.titulo}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.producto.precio * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="bg-gray-200" />

              <div className="space-y-2 text-md text-gray-700 mt-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA:</span>
                  <span className="font-medium">${cart.iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span className="font-medium">${cart.envio.toFixed(2)}</span>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between text-xl font-bold text-pink-600">
                  <span>Total a pagar:</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Datos de envío y pago</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                    Dirección de envío
                  </label>
                  <input
                    id="direccion"
                    name="direccion"
                    type="text"
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Av. Corrientes 1234, CABA"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="tarjeta" className="block text-sm font-medium text-gray-700">
                    Tarjeta de crédito/débito
                  </label>
                  <input
                    id="tarjeta"
                    name="tarjeta"
                    type="text"
                    required
                    value={tarjeta}
                    onChange={(e) => setTarjeta(e.target.value)}
                    placeholder="4111 1111 1111 1111"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={cargando}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white
                      ${cargando
                        ? 'bg-pink-300'
                        : 'bg-pink-500 hover:bg-pink-600'
                      }
                    `}
                  >
                    {cargando ? 'Procesando pago...' : `Confirmar compra ($${cart.total.toFixed(2)})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}