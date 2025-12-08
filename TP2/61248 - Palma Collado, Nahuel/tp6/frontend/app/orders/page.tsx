'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import { obtenerHistorial } from '../services/orders';
import type { CompraResumen } from '../types';

export default function OrdersPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const cargarCompras = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await obtenerHistorial(token);
        setCompras(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar compras');
      } finally {
        setLoading(false);
      }
    };

    cargarCompras();
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Compras</h1>
          <p className="text-gray-600">Historial de órdenes realizadas</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {compras.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No tienes compras aún
            </h3>
            <p className="text-gray-500 mb-6">
              Cuando realices una compra, aparecerá aquí.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a comprar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {compras.map((compra) => (
              <div
                key={compra.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Orden #{compra.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(compra.fecha).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${compra.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Subtotal: ${compra.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Detalles de la compra:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${compra.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA:</span>
                      <span className="font-medium">${compra.iva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Envío:</span>
                      <span className="font-medium">${compra.envio.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Dirección de envío:</span>
                    <span className="font-medium">{compra.direccion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
