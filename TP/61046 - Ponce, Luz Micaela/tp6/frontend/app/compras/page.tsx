"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CompraResumen, Compra } from '../types';
import { obtenerHistorialCompras, obtenerDetalleCompra } from '../services/compras';
import { Separator } from '../components/ui/separator';


function formatFecha(fechaISO: string) {
  return new Date(fechaISO).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function ComprasPage() {
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const exitoCompra = searchParams.get('exito') === 'true';

  useEffect(() => {
    async function cargarHistorial() {
      try {
        const historial = await obtenerHistorialCompras();
        setCompras(historial);
        if (historial.length > 0) {
          cargarDetalle(historial[0].id.toString());
        }
      } catch (err: any) {
        if (err.message.includes('autenticado')) {
          router.push('/iniciar-sesion');
        } else {
          setError(err.message);
        }
      } finally {
        setCargando(false);
      }
    }
    cargarHistorial();
  }, [router]);

  const cargarDetalle = async (id: string) => {
    try {
      setCompraSeleccionada(null);
      setCargando(true);
      const detalle = await obtenerDetalleCompra(id);
      setCompraSeleccionada(detalle);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargando && compras.length === 0) {
    return <p className="text-center p-8">Cargando historial de compras...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Mis compras
        </h1>

        {exitoCompra && (
          <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-md mb-8">
            ¡Compra realizada con éxito!
          </div>
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {compras.length === 0 && !cargando ? (
          <p>Aún no has realizado ninguna compra.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-md h-fit">
              <ul className="divide-y divide-gray-200">
                {compras.map((compra) => (
                  <li
                    key={compra.id}
                    onClick={() => cargarDetalle(compra.id.toString())}
                    className={`p-4 cursor-pointer hover:bg-pink-50 ${
                      compraSeleccionada?.id === compra.id ? 'bg-pink-100' : ''
                    }`}
                  >
                    <p className="font-semibold text-pink-700">Compra #{compra.id}</p>
                    <p className="text-sm text-gray-600">{formatFecha(compra.fecha)}</p>
                    <p className="text-md font-bold text-gray-800 mt-1">
                      Total: ${compra.total.toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-md">
              {cargando && !compraSeleccionada ? (
                <p>Cargando detalle...</p>
              ) : !compraSeleccionada ? (
                <p>Selecciona una compra para ver el detalle.</p>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Detalle de la compra
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <p className="text-gray-500">Compra #:</p>
                      <p className="font-medium text-gray-900">{compraSeleccionada.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha:</p>
                      <p className="font-medium text-gray-900">
                        {formatFecha(compraSeleccionada.fecha)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Dirección:</p>
                      <p className="font-medium text-gray-900">
                        {compraSeleccionada.direccion}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tarjeta:</p>
                      <p className="font-medium text-gray-900">
                        **** **** **** {compraSeleccionada.tarjeta.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Productos</h3>
                    <div className="space-y-4">
                      {compraSeleccionada.productos.map((item) => (
                        <div key={item.producto_id}>
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">{item.nombre}</p>
                              <p className="text-sm text-gray-500">
                                Cantidad: {item.cantidad}
                              </p>
                            </div>
                            <p className="font-medium text-gray-900">
                              ${(item.precio_unitario * item.cantidad).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 pl-2">
                            (IVA incluido en el total)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />
                  <div className="space-y-2 text-md">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal (aprox.):</span>
                      <span className="font-medium">
                        ${(compraSeleccionada.total - compraSeleccionada.envio).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Envío:</span>
                      <span className="font-medium">${compraSeleccionada.envio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-pink-600 mt-2">
                      <span>Total pagado:</span>
                      <span>${compraSeleccionada.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}