'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { obtenerCompras, obtenerDetalleCompra } from '../services/productos';
import { Compra } from '../types';

function ComprasContent() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarExito, setMostrarExito] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Mostrar mensaje de éxito si viene de checkout
    if (searchParams.get('success') === 'true') {
      setMostrarExito(true);
      setTimeout(() => setMostrarExito(false), 5000);
    }

    cargarCompras();
  }, [isAuthenticated, searchParams]);

  const cargarCompras = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await obtenerCompras(token);
      setCompras(data);
    } catch (error: any) {
      console.error('Error al cargar compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (compraId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const detalle = await obtenerDetalleCompra(compraId, token);
      setCompraSeleccionada(detalle);
    } catch (error: any) {
      console.error('Error al cargar detalle:', error);
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {mostrarExito && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          ✓ ¡Compra realizada exitosamente!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Compras</h1>
          {compras.length > 0 && (
            <span className="text-gray-600">{compras.length} compra{compras.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {compras.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No tienes compras realizadas</p>
            <button
              onClick={() => router.push('/')}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Ir a comprar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {compras.map((compra) => (
              <div key={compra.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pedido #{compra.id}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatearFecha(compra.fecha)}
                    </p>
                  </div>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Completado
                  </span>
                </div>

                <div className="border-t border-b py-3 my-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Dirección:</span>
                    <span className="text-gray-900 font-medium text-right max-w-xs truncate">
                      {compra.direccion}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío:</span>
                    <span className="text-gray-900">
                      {compra.envio === 0 ? 'GRATIS' : `$${compra.envio}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      ${compra.total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => verDetalle(compra.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {compraSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detalle del Pedido #{compraSeleccionada.id}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatearFecha(compraSeleccionada.fecha)}
                  </p>
                </div>
                <button
                  onClick={() => setCompraSeleccionada(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Información de Envío</h3>
                  <p className="text-gray-700">{compraSeleccionada.direccion}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Método de Pago</h3>
                  <p className="text-gray-700">Tarjeta terminada en {compraSeleccionada.tarjeta.slice(-4)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
                  <div className="space-y-3">
                    {compraSeleccionada.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-3">
                        <div className="flex-grow">
                          <p className="font-medium text-gray-900">{item.nombre}</p>
                          <p className="text-sm text-gray-600">
                            ${item.precio_unitario} x {item.cantidad}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900">
                          ${(item.precio_unitario * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Envío:</span>
                    <span className="text-gray-900">
                      {compraSeleccionada.envio === 0 ? 'GRATIS' : `$${compraSeleccionada.envio}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-blue-600">${compraSeleccionada.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCompraSeleccionada(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComprasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ComprasContent />
    </Suspense>
  );
}
