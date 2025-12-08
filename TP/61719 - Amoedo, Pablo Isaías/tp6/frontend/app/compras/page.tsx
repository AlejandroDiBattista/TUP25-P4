'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context';
import { useRouter } from 'next/navigation';
import { obtenerHistorialCompras, obtenerDetalleCompra, CompraResumen, CompraDetalle } from '../services/compras';
import { Button } from '@/components/ui/button';
import Navigation from '../components/Navigation';

export default function ComprasPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [detalleCompra, setDetalleCompra] = useState<CompraDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    cargarCompras();
  }, [isAuthenticated]);

  const cargarCompras = async () => {
    try {
      setLoading(true);
      const data = await obtenerHistorialCompras();
      setCompras(data);
      setError(null);
    } catch (err: any) {
      console.error('Error:', err);
      const mensaje = err.response?.data?.detail || err.message || 'Error al cargar compras';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (compra_id: number) => {
    try {
      const detalle = await obtenerDetalleCompra(compra_id);
      setDetalleCompra(detalle);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar detalle de compra');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Mis compras</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Listado de compras */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow">
              {loading ? (
                <div className="p-6 text-center">Cargando...</div>
              ) : compras.length === 0 ? (
                <div className="p-6 text-center text-gray-600">
                  <p>No hay compras realizadas</p>
                  <Button
                    onClick={() => router.push('/productos')}
                    className="mt-4 bg-blue-600 text-white"
                  >
                    Ir a comprar
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {compras.map(compra => (
                    <button
                      key={compra.compra_id}
                      onClick={() => handleVerDetalle(compra.compra_id)}
                      className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${
                        detalleCompra?.compra_id === compra.compra_id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="font-semibold">Compra #{compra.compra_id}</div>
                      <div className="text-sm text-gray-600">{compra.fecha}</div>
                      <div className="text-sm font-semibold text-blue-600">
                        ${compra.total.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detalle de compra */}
          <div className="col-span-2">
            {!detalleCompra ? (
              <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600">
                Selecciona una compra para ver detalles
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <h2 className="text-xl font-bold">
                  Detalle de la compra
                </h2>

                {/* Información general */}
                <div className="grid grid-cols-2 gap-4 pb-6 border-b">
                  <div>
                    <span className="text-gray-600">Compra #:</span>
                    <p className="font-semibold">{detalleCompra.compra_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha:</span>
                    <p className="font-semibold">{detalleCompra.fecha}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Dirección:</span>
                    <p className="font-semibold">{detalleCompra.direccion}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tarjeta:</span>
                    <p className="font-semibold">{detalleCompra.tarjeta}</p>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h3 className="font-bold mb-4">Productos</h3>
                  <div className="space-y-3">
                    {detalleCompra.productos.map(producto => (
                      <div key={producto.producto_id} className="flex justify-between pb-3 border-b">
                        <div>
                          <p className="font-semibold">{producto.nombre}</p>
                          <p className="text-sm text-gray-600">
                            ${producto.precio_unitario.toFixed(2)} x {producto.cantidad}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${producto.subtotal.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen */}
                <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${detalleCompra.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA:</span>
                    <span>${detalleCompra.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>${detalleCompra.envio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total pagado:</span>
                    <span>${detalleCompra.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
