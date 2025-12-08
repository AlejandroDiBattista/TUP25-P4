'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useCarrito } from '../contexts/CarritoContext';
import { obtenerCarrito, finalizarCompra } from '../services/carrito';
import { CarritoItem as CarritoItemType, CheckoutRequest } from '../types';

export default function CheckoutPage() {
  const router = useRouter();
  const { estaLogueado, cargando: cargandoAuth } = useAuth();
  const { items, productos, vaciarCarrito } = useCarrito();
  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [carrito, setCarrito] = useState<CarritoItemType[]>([]);
  
  const [formData, setFormData] = useState<CheckoutRequest>({
    direccion: '',
    tarjeta: '',
  });

  // Redirigir si no está logueado
  useEffect(() => {
    if (!cargandoAuth && !estaLogueado) {
      router.push('/login');
    }
  }, [estaLogueado, cargandoAuth, router]);

  // Cargar carrito
  useEffect(() => {
    const cargarCarrito = async () => {
      try {
        setLoading(true);
        const itemsCarrito = await obtenerCarrito();
        setCarrito(itemsCarrito);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el carrito');
      } finally {
        setLoading(false);
      }
    };

    if (estaLogueado && carrito.length === 0) {
      cargarCarrito();
    } else if (items.length > 0 && carrito.length === 0) {
      setCarrito(items);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [estaLogueado, items, carrito.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => {
      const producto = productos[item.producto_id];
      return total + (producto ? producto.precio * item.cantidad : 0);
    }, 0);
  };

  const calcularIVA = () => {
    let iva = 0;

    carrito.forEach((item) => {
      const producto = productos[item.producto_id];
      if (producto) {
        const monto = producto.precio * item.cantidad;
        if (producto.categoria === 'Electrónica') {
          iva += monto * 0.1;
        } else {
          iva += monto * 0.21;
        }
      }
    });

    return iva;
  };

  const calcularEnvio = () => {
    const subtotal = calcularSubtotal();
    return subtotal >= 1000 ? 0 : 50;
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA() + calcularEnvio();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.direccion.trim()) {
      setError('Por favor ingresa una dirección');
      return;
    }

    if (!formData.tarjeta.trim()) {
      setError('Por favor ingresa datos de tarjeta');
      return;
    }

    setCargando(true);

    try {
      const compra = await finalizarCompra(formData);
      vaciarCarrito();
      router.push(`/compra/${compra.id}?exito=true`);
    } catch (err: any) {
      setError(err.message || 'Error al finalizar compra');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoAuth) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!estaLogueado) {
    return null;
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (carrito.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-12 text-center">
          <p className="text-3xl mb-4">🛒</p>
          <h2 className="text-2xl font-semibold mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-800 mb-6">No hay productos para checkout</p>
          <Link
            href="/productos"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">💳 Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Sección de Dirección */}
                <div>
                  <h2 className="text-xl font-bold mb-4">📍 Dirección de Entrega</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección Completa
                    </label>
                    <textarea
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Calle, número, apartamento, ciudad, código postal"
                      rows={4}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Sección de Pago */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold mb-4">💳 Método de Pago</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      name="tarjeta"
                      value={formData.tarjeta}
                      onChange={handleChange}
                      placeholder="4111 1111 1111 1111"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      ℹ️ Datos de prueba: 4111 1111 1111 1111
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="border-t pt-6 flex gap-4">
                  <Link
                    href="/carrito"
                    className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition text-center font-semibold"
                  >
                    Volver al Carrito
                  </Link>
                  <button
                    type="submit"
                    disabled={cargando}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cargando ? 'Procesando...' : 'Confirmar Compra'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Resumen */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Resumen de Compra</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b max-h-96 overflow-y-auto">
                {carrito.map((item) => {
                  const producto = productos[item.producto_id];
                  if (!producto) return null;

                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-semibold">{producto.titulo}</p>
                        <p className="text-gray-800">x{item.cantidad}</p>
                      </div>
                      <p className="font-semibold">
                        ${(producto.precio * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Totales */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-800 font-medium">Subtotal:</span>
                  <span className="font-semibold">
                    ${calcularSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-800 font-medium">IVA:</span>
                  <span className="font-semibold text-orange-600">
                    +${calcularIVA().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-800 font-medium">Envío:</span>
                  {calcularEnvio() === 0 ? (
                    <span className="font-semibold text-green-600">✓ Gratis</span>
                  ) : (
                    <span className="font-semibold">+${calcularEnvio().toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">
                  ${calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
