'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useCarrito } from '@/app/context';
import { finalizarCompra } from '../services/carrito';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';

function CheckoutContent() {
  const { isAuthenticated } = useAuth();
  const { carrito } = useCarrito();
  const router = useRouter();
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!carrito || carrito.carrito.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
            <Button onClick={() => router.push('/productos')} className="bg-blue-600">
              Volver a productos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!direccion || !tarjeta) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await finalizarCompra({ direccion, tarjeta });
      router.push('/compras');
    } catch (err) {
      console.error('Error:', err);
      setError('Error al finalizar la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Finalizar compra</h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Resumen del carrito */}
          <div>
            <h2 className="text-xl font-bold mb-4">Resumen del carrito</h2>
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              {carrito.carrito.map(item => (
                <div key={item.producto_id} className="border-b pb-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{item.nombre}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                    </div>
                    <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}

              <div className="bg-gray-100 p-4 rounded-lg space-y-2 mt-6">
                <div className="flex justify-between">
                  <span>Total productos:</span>
                  <span>${carrito.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA:</span>
                  <span>${carrito.iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>${carrito.envio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total a pagar:</span>
                  <span>${carrito.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de envío */}
          <div>
            <h2 className="text-xl font-bold mb-4">Datos de envío</h2>
            <form onSubmit={handleConfirmarCompra} className="bg-white p-6 rounded-lg shadow space-y-6">
              <div>
                <label htmlFor="direccion" className="block text-sm font-semibold mb-2">Dirección</label>
                <Input
                  id="direccion"
                  type="text"
                  placeholder="Calle, número, apartamento"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="tarjeta" className="block text-sm font-semibold mb-2">Tarjeta de crédito</label>
                <Input
                  id="tarjeta"
                  type="text"
                  placeholder="****-****-****-****"
                  value={tarjeta}
                  onChange={(e) => setTarjeta(e.target.value)}
                  className="w-full"
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Procesando...' : 'Confirmar compra'}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full bg-gray-300 text-gray-800 hover:bg-gray-400"
                >
                  Volver
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
