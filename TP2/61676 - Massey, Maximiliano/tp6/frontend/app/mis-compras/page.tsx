'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useAuthStore from '../store/auth';
import useCartStore from '../store/cart';
import { API_URL } from '../config';

interface Compra {
  id: number;
  total: number;
  fecha: string;
  direccion: string;
  tarjeta?: string;
}

interface ProductoCompra {
  id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  iva: number;
  imagen: string;
}

interface DetalleCompra {
  id: number;
  fecha: string;
  direccion: string;
  tarjeta: string;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
  productos: ProductoCompra[];
}

export default function MisCompras() {
  const router = useRouter();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<number | null>(null);
  const [detalleCompra, setDetalleCompra] = useState<DetalleCompra | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState('');
  const { token, user, logout } = useAuthStore();
  const { clearCart } = useCartStore();

  const handleLogout = () => {
    clearCart();
    logout();
    router.push('/');
  };

  useEffect(() => {
    if (!token || !user) {
      router.push('/login');
      return;
    }

    const fetchCompras = async () => {
      try {
        const response = await fetch(`${API_URL}/compras`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar las compras');
        }

        const data = await response.json();
        setCompras(data);
        
        if (data.length > 0) {
          setCompraSeleccionada(data[0].id);
        }
      } catch (err) {
        console.error('Error al cargar compras:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar las compras');
      } finally {
        setLoading(false);
      }
    };

    fetchCompras();
  }, [token, user, router]);

  useEffect(() => {
    if (!compraSeleccionada || !token) return;

    const fetchDetalle = async () => {
      setLoadingDetalle(true);
      try {
        const response = await fetch(`${API_URL}/compras/${compraSeleccionada}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Error respuesta:', response.status, errorData);
          throw new Error(errorData.detail || 'Error al cargar el detalle');
        }

        const data = await response.json();
        setDetalleCompra(data);
      } catch (err) {
        console.error('❌ Error al cargar detalle:', err);
        // No establecer null, mantener el estado anterior o mostrar mensaje
        setDetalleCompra(null);
      } finally {
        setLoadingDetalle(false);
      }
    };

    fetchDetalle();
  }, [compraSeleccionada, token]);

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const formatted = date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return formatted.replace(',', ' a las');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-900 font-semibold">Cargando tus compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                TP6 Shop
              </h1>
            </Link>
            
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-gray-900 font-semibold hover:text-blue-600">
                Productos
              </Link>
              <Link href="/mis-compras" className="text-blue-600 font-semibold">
                Mis compras
              </Link>
              <span className="text-gray-900 font-semibold">
                {user?.nombre}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-900 font-semibold hover:text-blue-600"
              >
                Salir
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis compras</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {compras.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-bold mb-2">No tienes compras aún</h2>
            <p className="text-gray-900 font-semibold mb-6">
              Comienza a explorar nuestros productos y realiza tu primera compra
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-3">
              {compras.map((compra) => (
                <button
                  key={compra.id}
                  onClick={() => setCompraSeleccionada(compra.id)}
                  className={(compraSeleccionada === compra.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md') + ' w-full text-left bg-white rounded-lg shadow p-4 transition-all'}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-semibold text-gray-900">
                      Compra #{compra.id}
                    </div>
                  </div>
                  <div className="text-xs text-gray-900 font-semibold">
                    {formatearFecha(compra.fecha)}
                  </div>
                  <div className="text-sm font-bold text-blue-600 mt-2">
                    Total: ${compra.total.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>

            <div className="md:col-span-2">
              {loadingDetalle ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-4xl mb-2">⏳</div>
                  <p className="text-gray-900 font-semibold">Cargando detalle...</p>
                </div>
              ) : detalleCompra ? (
                <div className="bg-white rounded-lg shadow">
                  <div className="border-b p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Detalle de la compra
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-900 font-semibold">
                      <div>
                        <span className="font-semibold">Compra #:</span> {detalleCompra.id}
                      </div>
                      <div>
                        <span className="font-semibold">Fecha:</span> {formatearFecha(detalleCompra.fecha)}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Dirección:</span> {detalleCompra.direccion}
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold">Tarjeta:</span> **** **** **** {detalleCompra.tarjeta}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Productos</h3>
                    <div className="space-y-3">
                      {detalleCompra.productos.map((producto, index) => (
                        <div
                          key={`${producto.id}-${index}`}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-16 h-16 bg-white rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                            <Image
                              src={producto.imagen.startsWith('http') ? producto.imagen : `${API_URL}/${producto.imagen}`}
                              alt={producto.nombre}
                              width={64}
                              height={64}
                              className="object-cover"
                              unoptimized
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900">
                              {producto.nombre}
                            </div>
                            <div className="text-sm text-gray-900 font-semibold">
                              Cantidad: {producto.cantidad}
                            </div>
                            <div className="text-xs text-gray-900 font-semibold">
                              IVA: ${producto.iva.toFixed(2)}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-gray-900">
                              ${producto.precio_total.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-900 font-semibold">
                              ${producto.precio_unitario.toFixed(2)} c/u
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-900 font-semibold">Subtotal:</span>
                        <span className="font-semibold">${detalleCompra.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-900 font-semibold">IVA:</span>
                        <span className="font-semibold">${detalleCompra.iva.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-900 font-semibold">Envío:</span>
                        <span className="font-semibold">${detalleCompra.envio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total pagado:</span>
                        <span className="text-blue-600">${detalleCompra.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-gray-900 font-semibold">Selecciona una compra para ver el detalle</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
