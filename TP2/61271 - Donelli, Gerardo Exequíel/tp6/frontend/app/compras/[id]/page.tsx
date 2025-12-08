'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { obtenerDetalleCompra, type CompraDetalle } from '../../services/compras';
import Image from 'next/image';

export default function DetalleCompraPage() {
  const { estaAutenticado, cargando, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const compraId = params.id as string;

  const [compra, setCompra] = useState<CompraDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(true);
  const [error, setError] = useState('');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      router.push('/auth/login');
    }
  }, [estaAutenticado, cargando, router]);

  useEffect(() => {
    if (estaAutenticado && token && compraId) {
      cargarDetalle();
    }
  }, [estaAutenticado, token, compraId]);

  const cargarDetalle = async () => {
    if (!token || !compraId) return;

    setCargandoDetalle(true);
    try {
      const data = await obtenerDetalleCompra(token, parseInt(compraId));
      setCompra(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el detalle');
    } finally {
      setCargandoDetalle(false);
    }
  };

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!estaAutenticado) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Botón volver */}
      <button
        onClick={() => router.push('/compras')}
        className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Volver al historial
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Contenido */}
      {cargandoDetalle ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalle...</p>
        </div>
      ) : !compra ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontró la compra
          </h3>
          <button
            onClick={() => router.push('/compras')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Volver al historial
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Compra #{compra.id}
                </h1>
                <p className="text-sm text-gray-600">
                  {formatearFecha(compra.fecha)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-indigo-600">
                  ${compra.total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">Dirección de envío</p>
                <p className="text-base text-gray-900 font-medium">
                  {compra.direccion}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tarjeta</p>
                <p className="text-base text-gray-900 font-medium">
                  **** **** **** {compra.tarjeta.slice(-4)}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Productos ({compra.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {compra.items.map((item, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex gap-4 items-start">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={`${API_URL}/${item.imagen}`}
                        alt={item.nombre}
                        fill
                        sizes="80px"
                        className="object-contain rounded"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        {item.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.cantidad}
                      </p>
                      <p className="text-sm text-gray-600">
                        Precio unitario: ${item.precio_unitario.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de pago */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de pago
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">
                  ${compra.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA</span>
                <span className="text-gray-900 font-medium">
                  ${compra.iva.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="text-gray-900 font-medium">
                  {compra.envio === 0 ? (
                    <span className="text-green-600 font-semibold">GRATIS</span>
                  ) : (
                    `$${compra.envio.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-indigo-600">
                    ${compra.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Esta compra fue registrada el {formatearFecha(compra.fecha)}. 
                  {compra.envio === 0 && ' Calificaste para envío gratis por superar $1000 en subtotal.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
