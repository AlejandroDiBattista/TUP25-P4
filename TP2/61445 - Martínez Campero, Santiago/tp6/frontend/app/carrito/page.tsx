'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/app/hooks/useToast';
import { obtenerCarrito, actualizarCantidad, removerDelCarrito, cancelarCarrito } from '@/app/services/carrito';
import { Carrito } from '@/app/types';
import Link from 'next/link';
import Image from 'next/image';

export default function CarritoPage() {
  const router = useRouter();
  const { agregarToast } = useToast();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState<number | null>(null);

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

  const handleCambiarCantidad = async (itemId: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;

    try {
      setActualizando(itemId);
      setError(null);
      const actualizado = await actualizarCantidad(itemId, nuevaCantidad);
      setCarrito(actualizado);
      agregarToast('Cantidad actualizada', 'success', 2000);
    } catch (err) {
      const msg = 'Error al actualizar cantidad';
      setError(msg);
      agregarToast(msg, 'error', 3000);
      console.error('Error:', err);
    } finally {
      setActualizando(null);
    }
  };

  const handleEliminar = async (itemId: number) => {
    try {
      setActualizando(itemId);
      setError(null);
      await removerDelCarrito(itemId);
      // Recargar el carrito después de eliminar
      const carritoActualizado = await obtenerCarrito();
      setCarrito(carritoActualizado);
      agregarToast('Producto eliminado del carrito', 'success', 2000);
    } catch (err) {
      const msg = 'Error al eliminar del carrito';
      setError(msg);
      agregarToast(msg, 'error', 3000);
      console.error('Error:', err);
    } finally {
      setActualizando(null);
    }
  };

  const handleVaciar = async () => {
    if (!confirm('¿Estás seguro de que quieres vaciar el carrito?')) return;

    try {
      setError(null);
      await cancelarCarrito();
      // Recargar el carrito después de vaciarlo
      const carritoActualizado = await obtenerCarrito();
      setCarrito(carritoActualizado);
      agregarToast('Carrito vaciado correctamente', 'success', 2000);
    } catch (err) {
      const msg = 'Error al vaciar el carrito';
      setError(msg);
      agregarToast(msg, 'error', 3000);
      console.error('Error:', err);
    }
  };

  const handleCheckout = () => {
    agregarToast('Procédiendo al checkout...', 'info', 2000);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Cargando carrito...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/productos" className="text-primary hover:underline inline-block">
            ← Volver a Productos
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Carrito de Compras</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!carrito || carrito.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-2xl text-gray-600 mb-6">Tu carrito está vacío</p>
            <Link href="/productos">
              <Button>Continuar Comprando</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items del carrito */}
            <div className="lg:col-span-2 space-y-4">
              {carrito.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow p-6 flex gap-6"
                >
                  {/* Imagen */}
                  <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${item.imagen}`}
                      alt={item.nombre}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>

                  {/* Detalles */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.nombre}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      ${item.precio_unitario.toFixed(2)} c/u
                    </p>

                    {/* Selector de cantidad */}
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => handleCambiarCantidad(item.id, item.cantidad - 1)}
                        disabled={actualizando === item.id}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) =>
                          handleCambiarCantidad(item.id, parseInt(e.target.value) || 1)
                        }
                        disabled={actualizando === item.id}
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                      />
                      <button
                        onClick={() => handleCambiarCantidad(item.id, item.cantidad + 1)}
                        disabled={actualizando === item.id}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-600 ml-auto">
                        Subtotal: ${item.precio_total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => handleEliminar(item.id)}
                    disabled={actualizando === item.id}
                    className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8 space-y-6">
                <div className="space-y-3 border-b pb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>${carrito.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>IVA ({carrito.iva > 0 ? '21%' : '0%'}):</span>
                    <span>${carrito.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Envío:</span>
                    <span>${carrito.envio.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">${carrito.total.toFixed(2)}</span>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleCheckout} className="w-full h-12 text-lg">
                    Ir a Checkout
                  </Button>
                  <Button
                    onClick={handleVaciar}
                    variant="outline"
                    className="w-full"
                  >
                    Vaciar Carrito
                  </Button>
                </div>

                <Link href="/productos" className="block">
                  <Button variant="ghost" className="w-full">
                    Continuar Comprando
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
