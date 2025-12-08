'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { obtenerCarrito } from '@/app/services/carrito';
import { finalizarCompra } from '@/app/services/compras';
import { useToast } from '@/app/hooks/useToast';
import { Carrito } from '@/app/types';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { agregarToast } = useToast();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarCarrito = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const datos = await obtenerCarrito();
        setCarrito(datos);
      } catch (err) {
        const msg = 'No se pudo cargar el carrito';
        setError(msg);
        agregarToast(msg, 'error', 3000);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarCarrito();
  }, [router, agregarToast]);

  const handleProcesar = async () => {
    try {
      setProcesando(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await finalizarCompra('Dirección de entrega', '****-****-****-1234');
      agregarToast('Compra realizada exitosamente', 'success', 2000);
      router.push('/compras?success=true');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al procesar la compra';
      setError(mensaje);
      agregarToast(mensaje, 'error', 3000);
      console.error('Error:', err);
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Cargando información de checkout...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-2xl text-gray-600 mb-6">Tu carrito está vacío</p>
            <Link href="/productos">
              <Button>Continuar Comprando</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/carrito" className="text-primary hover:underline inline-block">
            ← Volver al Carrito
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Checkout</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de envío */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Dirección de Envío
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Se enviará a la dirección registrada en tu cuenta
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900">
                  En esta demostración, la dirección y método de envío se toman de la configuración de la cuenta.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Envío
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2">
                    <option>Envío a Domicilio - ${carrito.envio.toFixed(2)}</option>
                    <option>Retiro en Sucursal - $0.00</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2">
                    <option>Tarjeta de Crédito</option>
                    <option>Tarjeta de Débito</option>
                    <option>Transferencia Bancaria</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resumen de Compra
                </h3>
                <div className="space-y-2 mb-4">
                  {carrito.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.nombre} x {item.cantidad}
                      </span>
                      <span className="font-medium">
                        ${item.precio_total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span>${carrito.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">IVA:</span>
                    <span>${carrito.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Envío:</span>
                    <span>${carrito.envio.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen total */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8 space-y-6">
              <div>
                <p className="text-gray-600 text-sm mb-2">Total a Pagar</p>
                <p className="text-4xl font-bold text-primary">
                  ${carrito.total.toFixed(2)}
                </p>
              </div>

              <Button
                onClick={handleProcesar}
                disabled={procesando}
                className="w-full h-12 text-lg"
              >
                {procesando ? 'Procesando...' : 'Confirmar Compra'}
              </Button>

              <Link href="/carrito" className="block">
                <Button variant="outline" className="w-full">
                  Volver al Carrito
                </Button>
              </Link>

              <p className="text-xs text-gray-500 text-center">
                Al hacer clic en confirmar, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
