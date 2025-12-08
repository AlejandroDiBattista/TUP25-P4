'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { obtenerDetalleCompra } from '../../services/compras';
import { Compra } from '../../types';

export default function DetalleCompraPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { estaLogueado, cargando: cargandoAuth } = useAuth();
  const [compra, setCompra] = useState<Compra | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const esExito = searchParams.get('exito') === 'true';

  // Resolver params y cargar compra
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // Redirigir si no está logueado
  useEffect(() => {
    if (!cargandoAuth && !estaLogueado) {
      router.push('/login');
    }
  }, [estaLogueado, cargandoAuth, router]);

  // Cargar detalle de compra
  useEffect(() => {
    const cargarCompra = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError('');
        const data = await obtenerDetalleCompra(parseInt(id));
        setCompra(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar compra');
      } finally {
        setLoading(false);
      }
    };

    if (estaLogueado && id) {
      cargarCompra();
    }
  }, [estaLogueado, id]);

  if (cargandoAuth) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!estaLogueado) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 text-lg">Cargando compra...</p>
        </div>
      </div>
    );
  }

  if (error || !compra) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-10">
          {esExito ? (
            <>
              <h1 className="text-2xl font-bold mb-4">✓ ¡Compra Realizada Exitosamente!</h1>
              <p className="text-gray-800 mb-6">Tu compra se ha procesado correctamente</p>
              <Link href="/mis-compras" className="text-blue-600 hover:underline text-lg font-semibold">
                Ver mis compras →
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">❌ Compra no encontrada</h1>
              <p className="text-gray-800 mb-6">{error || 'La compra que buscas no existe'}</p>
              <Link href="/mis-compras" className="text-blue-600 hover:underline text-lg font-semibold">
                ← Volver a mis compras
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Banner de éxito */}
        {esExito && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-8">
            <p className="font-semibold text-lg">
              ✓ ¡Compra realizada exitosamente!
            </p>
            <p className="text-sm">Recibirás un email con el resumen de tu compra</p>
          </div>
        )}

        {/* Encabezado */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Detalle de Compra</h1>
            <p className="text-gray-800">Compra #{compra.id}</p>
          </div>
          <Link
            href="/mis-compras"
            className="text-blue-600 hover:underline"
          >
            ← Volver a compras
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información de la compra */}
          <div className="lg:col-span-2">
            {/* Información general */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">📋 Información de la Compra</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-800 font-medium mb-1">Fecha</p>
                  <p className="font-semibold">
                    {new Date(compra.fecha).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium mb-1">Estado</p>
                  <p className="font-semibold text-green-600">✓ Completado</p>
                </div>
              </div>
            </div>

            {/* Dirección de entrega */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">📍 Dirección de Entrega</h2>
              <p className="text-gray-700">{compra.direccion}</p>
            </div>

            {/* Items de compra */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-100 p-6 border-b">
                <h2 className="text-xl font-bold">📦 Productos Comprados</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4">Producto</th>
                    <th className="text-center p-4">Precio Unit.</th>
                    <th className="text-center p-4">Cantidad</th>
                    <th className="text-right p-4">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {compra.items.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-semibold">
                        ID: {item.producto_id}
                      </td>
                      <td className="p-4 text-center">
                        ${item.precio_unitario.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        {item.cantidad}
                      </td>
                      <td className="p-4 text-right font-semibold">
                        ${(item.precio_unitario * item.cantidad).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de pago */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">💳 Resumen</h2>

              <div className="space-y-3 mb-6 pb-6 border-b">
                {compra.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Producto {item.producto_id} x{item.cantidad}
                    </span>
                    <span className="font-semibold">
                      ${(item.precio_unitario * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Pagado:</span>
                  <span className="text-blue-600">
                    ${compra.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                href="/productos"
                className="w-full block bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center font-semibold mb-3"
              >
                Continuar Comprando
              </Link>

              <Link
                href="/mis-compras"
                className="w-full block bg-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-400 transition text-center font-semibold"
              >
                Ver Todas las Compras
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
