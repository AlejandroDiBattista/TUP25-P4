'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useAuthStore from '../../store/auth';
import useCartStore from '../../store/cart';
import { API_URL } from '../../config';

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

export default function DetalleCompra({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: compraId } = use(params);
  const [compra, setCompra] = useState<DetalleCompra | null>(null);
  const [loading, setLoading] = useState(true);
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

    const fetchCompra = async () => {
      try {
        const response = await fetch(`${API_URL}/compras/${compraId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Compra no encontrada o no tienes permiso para verla');
          }
          throw new Error('Error al cargar el detalle de la compra');
        }

        const data = await response.json();
        setCompra(data);
      } catch (err) {
        console.error('❌ Error al cargar compra:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar la compra');
      } finally {
        setLoading(false);
      }
    };

    fetchCompra();
  }, [compraId, token, user, router]);

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando detalle...</p>
        </div>
      </div>
    );
  }

  if (error || !compra) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/">
              <h1 className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                TP6 Shop
              </h1>
            </Link>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ❌ {error || 'Compra no encontrada'}
          </div>
          <Link
            href="/mis-compras"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            ← Volver a mis compras
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                TP6 Shop
              </h1>
            </Link>
            
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Productos
              </Link>
              <Link href="/mis-compras" className="text-gray-700 hover:text-blue-600">
                Mis compras
              </Link>
              <span className="text-gray-700">
                {user?.nombre}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-blue-600"
              >
                Salir
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/mis-compras"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Volver a mis compras
          </Link>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Detalle de la compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información de la compra */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos de envío */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Información de envío</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Compra #:</p>
                  <p className="font-semibold">{compra.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha:</p>
                  <p className="font-semibold">{formatearFecha(compra.fecha)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dirección:</p>
                  <p className="font-semibold">{compra.direccion}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tarjeta:</p>
                  <p className="font-semibold">**** **** **** {compra.tarjeta}</p>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Productos</h2>
              <div className="space-y-4">
                {compra.productos.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex items-center gap-4 pb-4 border-b last:border-b-0"
                  >
                    <div className="relative w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                      <Image
                        src={producto.imagen ? `${API_URL}/${producto.imagen}` : '/placeholder.png'}
                        alt={producto.nombre}
                        fill
                        className="object-cover rounded"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{producto.nombre}</h3>
                      <p className="text-sm text-gray-600">Cantidad: {producto.cantidad}</p>
                      <p className="text-sm text-gray-600">
                        IVA: ${producto.iva.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ${producto.precio_total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${producto.precio_unitario.toFixed(2)} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${compra.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA:</span>
                  <span className="font-semibold">${compra.iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold">
                    {compra.envio === 0 ? 'Gratis' : `$${compra.envio.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total pagado:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${compra.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
