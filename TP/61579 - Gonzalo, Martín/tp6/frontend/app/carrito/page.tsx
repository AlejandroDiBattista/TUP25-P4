'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useCarrito } from '../contexts/CarritoContext';
import { obtenerCarrito, quitarDelCarrito } from '../services/carrito';
import { obtenerProductoPorId } from '../services/productos';
import { CarritoItem as CarritoItemType, Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CarritoPage() {
  const router = useRouter();
  const { estaLogueado, cargando: cargandoAuth } = useAuth();
  const { items, productos, quitarItem, actualizarCarrito, agregarProducto } = useCarrito();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quitandoItem, setQuitandoItem] = useState<number | null>(null);

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
        setError('');
        const itemsCarrito = await obtenerCarrito();
        actualizarCarrito(itemsCarrito);

        // Cargar detalles de productos
        for (const item of itemsCarrito) {
          if (!productos[item.producto_id]) {
            try {
              const producto = await obtenerProductoPorId(item.producto_id);
              agregarProducto(producto);
            } catch (err) {
              console.error(`Error cargando producto ${item.producto_id}:`, err);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el carrito');
      } finally {
        setLoading(false);
      }
    };

    if (estaLogueado) {
      cargarCarrito();
    }
  }, [estaLogueado, actualizarCarrito, agregarProducto]);

  const handleQuitarItem = async (productoId: number) => {
    setQuitandoItem(productoId);
    try {
      await quitarDelCarrito(productoId);
      quitarItem(productoId);
    } catch (err: any) {
      setError(err.message || 'Error al quitar producto');
    } finally {
      setQuitandoItem(null);
    }
  };

  const calcularSubtotal = () => {
    return items.reduce((total, item) => {
      const producto = productos[item.producto_id];
      return total + (producto ? producto.precio * item.cantidad : 0);
    }, 0);
  };

  const calcularIVA = () => {
    let subtotal = 0;
    let iva = 0;

    items.forEach((item) => {
      const producto = productos[item.producto_id];
      if (producto) {
        const monto = producto.precio * item.cantidad;
        if (producto.categoria === 'Electrónica') {
          iva += monto * 0.1; // 10% para electrónica
        } else {
          iva += monto * 0.21; // 21% para otros
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

  if (cargandoAuth) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!estaLogueado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">🛒 Mi Carrito</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-800">Cargando carrito...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-3xl mb-4">🛒</p>
            <h2 className="text-2xl font-semibold mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-800 mb-6">Aún no has agregado productos</p>
            <Link
              href="/productos"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Continuar Comprando
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tabla de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left p-4">Producto</th>
                      <th className="text-center p-4">Precio</th>
                      <th className="text-center p-4">Cantidad</th>
                      <th className="text-center p-4">Subtotal</th>
                      <th className="text-center p-4">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const producto = productos[item.producto_id];
                      if (!producto) return null;

                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <Link
                              href={`/producto/${producto.id}`}
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              {producto.titulo}
                            </Link>
                            <p className="text-sm text-gray-600">{producto.categoria}</p>
                          </td>
                          <td className="p-4 text-center">
                            ${producto.precio.toFixed(2)}
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block bg-gray-100 px-3 py-1 rounded">
                              {item.cantidad}
                            </span>
                          </td>
                          <td className="p-4 text-center font-semibold">
                            ${(producto.precio * item.cantidad).toFixed(2)}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleQuitarItem(producto.id)}
                              disabled={quitandoItem === producto.id}
                              className="text-red-600 hover:text-red-800 font-semibold disabled:opacity-50"
                            >
                              ✕ Quitar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Botones */}
              <div className="flex gap-4 mt-6">
                <Link
                  href="/productos"
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition text-center font-semibold"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>

            {/* Resumen */}
            <div>
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Resumen</h2>

                <div className="space-y-4 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Subtotal:</span>
                    <span className="font-semibold">
                      ${calcularSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">IVA (21% / 10%):</span>
                    <span className="font-semibold text-orange-600">
                      +${calcularIVA().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Envío:</span>
                    {calcularEnvio() === 0 ? (
                      <span className="font-semibold text-green-600">
                        ✓ Gratis
                      </span>
                    ) : (
                      <span className="font-semibold">
                        +${calcularEnvio().toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      ${calcularTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full block bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition text-center font-semibold mb-3"
                >
                  Proceder al Pago
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
