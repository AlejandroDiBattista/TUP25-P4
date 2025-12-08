'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { CompraDetallada } from '../types';

export default function ComprasPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  
  const [compras, setCompras] = useState<CompraDetallada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [compraSeleccionada, setCompraSeleccionada] = useState<CompraDetallada | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCompras();
  }, [isAuthenticated, token, router]);

  const fetchCompras = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:8000/compras', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompras(data.compras || []);
      } else {
        setError('Error al cargar las compras');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetalleCompra = async (compraId: number) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:8000/compra/${compraId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const compraDetalle = await response.json();
        setCompraSeleccionada(compraDetalle);
      } else {
        setError('Error al cargar el detalle de la compra');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">¡Compra realizada exitosamente!</h3>
                <p className="mt-1 text-sm text-green-700">Tu pedido ha sido procesado correctamente.</p>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis compras</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de compras */}
          <div>
            {compras.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No tienes compras aún
                </h3>
                <p className="text-gray-600 mb-6">
                  Cuando realices tu primera compra, aparecerá aquí.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ir a comprar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {compras.map((compra) => (
                  <div
                    key={compra.id}
                    className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all ${
                      compraSeleccionada?.id === compra.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (compraSeleccionada?.id === compra.id) {
                        // Si ya está seleccionada, deseleccionarla
                        setCompraSeleccionada(null);
                      } else {
                        // Si no está seleccionada, seleccionarla
                        fetchDetalleCompra(compra.id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 flex items-center">
                          Compra #{compra.id}
                          {compraSeleccionada?.id === compra.id && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                              Seleccionada - Click para deseleccionar
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(compra.fecha).toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ${compra.total}
                        </p>
                        {compra.total_items && (
                          <p className="text-sm text-gray-500">
                            {compra.total_items} producto{compra.total_items !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Dirección:</span> {compra.direccion}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Tarjeta:</span> {compra.tarjeta}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalle de la compra */}
          <div>
            {compraSeleccionada ? (
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4 border border-gray-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4 mb-6">
                  <h2 className="text-2xl font-bold mb-1">
                    Detalle de Compra
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Información completa de tu pedido
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Información General
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 flex items-center">
                        📋 Número de Compra:
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                        #{compraSeleccionada.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 flex items-center">
                        📅 Fecha:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {new Date(compraSeleccionada.fecha || compraSeleccionada.fecha_compra || new Date()).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 flex items-center">
                        🏠 Dirección:
                      </span>
                      <span className="text-right text-gray-900 font-medium max-w-xs">
                        {compraSeleccionada.direccion || 'Av. Corrientes 1234, CABA, Argentina'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 flex items-center">
                        💳 Tarjeta:
                      </span>
                      <span className="text-gray-900 font-medium font-mono bg-gray-100 px-2 py-1 rounded">
                        {compraSeleccionada.tarjeta || '**** **** **** 1234'}
                      </span>
                    </div>
                  </div>
                </div>

                {compraSeleccionada.items && compraSeleccionada.items.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Productos Comprados
                    </h3>
                    <div className="space-y-4">
                      {compraSeleccionada.items.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <h4 className="font-semibold text-gray-900 text-base mb-2">
                                {item.nombre}
                              </h4>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <span className="font-medium">Cantidad:</span>
                                  <span className="ml-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                    {item.cantidad}
                                  </span>
                                </span>
                                <span className="flex items-center">
                                  <span className="font-medium">Precio unitario:</span>
                                  <span className="ml-1 text-gray-800 font-semibold">
                                    ${item.precio_unitario.toFixed(2)}
                                  </span>
                                </span>
                                <span className="flex items-center">
                                  <span className="font-medium">IVA:</span>
                                  <span className="ml-1 text-indigo-600 font-semibold">
                                    {item.categoria && item.categoria.toLowerCase().includes('electrón') ? '21%' : '10.5%'}
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600">
                                ${(item.precio_unitario * item.cantidad).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Subtotal
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                    Resumen de Facturación
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Subtotal:</span>
                      <span className="text-gray-900 font-semibold text-lg">${compraSeleccionada.subtotal}</span>
                    </div>
                    {compraSeleccionada.descuento > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 font-medium">Descuento:</span>
                        <span className="text-green-600 font-semibold text-lg">-${compraSeleccionada.descuento}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">IVA:</span>
                      <span className="text-gray-900 font-semibold text-lg">${compraSeleccionada.iva}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Envío:</span>
                      <span className={`font-semibold text-lg ${compraSeleccionada.envio === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {compraSeleccionada.envio === 0 ? 'GRATIS' : `$${compraSeleccionada.envio}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center font-bold text-xl pt-3 mt-3 border-t-2 border-gray-400 bg-white rounded px-3 py-2">
                    <span className="text-blue-600">Total pagado:</span>
                    <span className="text-green-600">${compraSeleccionada.total}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-8 text-center border border-blue-100">
                <div className="text-blue-400 mb-4">
                  <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Detalles de Compra
                </h3>
                <p className="text-gray-600 mb-4">
                  Selecciona una compra de la lista para ver su información completa
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  📋 Productos • 💰 Precios • 📄 Facturación
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}