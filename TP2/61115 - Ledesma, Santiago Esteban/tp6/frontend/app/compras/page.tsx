 'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ItemCompra {
  id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  compra_id: number;
  producto_id: number;
}

interface Compra {
  id: number;
  fecha: string;
  items?: ItemCompra[];
  total: number;
  direccion: string;
  tarjeta?: string;
  envio?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ComprasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('tp6_token') : null;

  const loadCompraDetalle = useCallback(async (compraId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/compras/${compraId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al obtener detalle de compra');
      const data = await res.json();
      // El backend responde { compra, items } en el detalle
      const detalle = data.compra ? { ...data.compra, items: data.items } : data;
      setCompraSeleccionada(detalle);
    } catch (err) {
      console.error('loadCompraDetalle', err);
      setError(err instanceof Error ? err.message : 'Error al cargar detalle');
    }
  }, [token]);

  useEffect(() => {
    const fetchCompras = async () => {
      if (!token) {
        setError('Debes iniciar sesión');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/compras`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Error al obtener compras');

        const data = await res.json();
        setCompras(data);
        // Si hay query param ?compra=ID, cargar ese detalle. Sino la primera compra.
        const compraParam = searchParams ? searchParams.get('compra') : null;
        if (compraParam) {
          const id = Number(compraParam);
          if (!isNaN(id)) await loadCompraDetalle(id);
        } else if (data.length > 0) {
          await loadCompraDetalle(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar compras');
      } finally {
        setLoading(false);
      }
    };

    fetchCompras();
  }, [token, loadCompraDetalle, searchParams]);

  

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando compras...</p>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Debes iniciar sesión</h1>
          <Button onClick={() => router.push('/login')}>Ir a login</Button>
        </div>
      </main>
    );
  }

  // Calcular subtotal, IVA y envío de una compra
  const calcularDetalles = (compra: Compra) => {
    let subtotal = 0;
    let iva = 0;

    (compra.items || []).forEach((item) => {
      const itemSubtotal = item.cantidad * item.precio_unitario;
      subtotal += itemSubtotal;
      const esElectronica = item.nombre.toLowerCase().includes('electro');
      const tasaIva = esElectronica ? 0.10 : 0.21;
      iva += itemSubtotal * tasaIva;
    });

    const envio = subtotal > 1000 ? 0 : (compra.envio || 50);
    return { subtotal, iva, envio };
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2 text-sky-700">Mis compras</h1>
        <p className="text-sm text-gray-600 mb-6">Historial de tus compras realizadas</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
            {error}
          </div>
        )}

        {compras.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center border border-sky-200">
            <p className="text-gray-600 mb-4">No tienes compras realizadas aún</p>
            <Button onClick={() => router.push('/')}>Ir al catálogo</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Lista de compras (sidebar) */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-b from-gray-200 to-white rounded-lg shadow-lg p-4 border border-gray-300 max-h-96 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Historial</h2>
                <div className="space-y-2">
                  {compras.map((compra) => (
                    <button
                      key={compra.id}
                      onClick={() => loadCompraDetalle(compra.id)}
                      className={`w-full text-left p-3 rounded-lg transition border-l-4 ${
                        compraSeleccionada?.id === compra.id
                          ? 'bg-sky-100 border-sky-600 shadow'
                          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-800">Compra #{compra.id}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(compra.fecha).toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        ${compra.total.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Detalle de compra */}
            <div className="lg:col-span-3">
              {compraSeleccionada ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Productos y datos de envío */}
                  <div className="lg:col-span-2 bg-gradient-to-b from-gray-200 to-white rounded-lg shadow-lg p-6 border border-gray-300">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                      Compra #{compraSeleccionada.id}
                    </h2>

                    {/* Información general */}
                    <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b border-gray-300">
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Fecha</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(compraSeleccionada.fecha).toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Tarjeta</p>
                        <p className="font-semibold text-gray-800">
                          {compraSeleccionada.tarjeta || '••••-••••-••••-****'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Dirección</p>
                        <p className="font-semibold text-gray-800">{compraSeleccionada.direccion}</p>
                      </div>
                    </div>

                    {/* Productos */}
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Productos</h3>
                    <div className="space-y-3 mb-6 pb-4 border-b border-gray-300">
                      {(compraSeleccionada.items || []).map((item) => {
                        const itemSubtotal = item.cantidad * item.precio_unitario;
                        const esElectronica = item.nombre.toLowerCase().includes('electro');
                        const tasaIva = esElectronica ? 0.10 : 0.21;
                        const ivaItem = itemSubtotal * tasaIva;
                        return (
                          <div key={item.id} className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{item.nombre}</div>
                              <div className="text-sm text-gray-600">Cantidad: {item.cantidad} • ${item.precio_unitario.toFixed(2)} c/u</div>
                              <div className="text-xs text-gray-500">IVA: ${ivaItem.toFixed(2)}</div>
                            </div>
                            <div className="text-right font-semibold text-gray-800">
                              ${itemSubtotal.toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                      ← Volver a productos
                    </Button>
                  </div>

                  {/* Totales (sidebar derecho) */}
                  <div>
                    <div className="bg-gradient-to-b from-gray-200 to-white rounded-lg shadow-lg p-6 border border-gray-300 h-fit">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumen</h3>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Total productos:</span>
                          <span className="font-semibold">${calcularDetalles(compraSeleccionada).subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">IVA:</span>
                          <span className="font-semibold">${calcularDetalles(compraSeleccionada).iva.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 pb-2">
                          <span className="text-gray-700">Envío:</span>
                          <span className="font-semibold">${calcularDetalles(compraSeleccionada).envio.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold pt-2 text-gray-900">
                          <span>Total:</span>
                          <span>${compraSeleccionada.total.toFixed(2)}</span>
                        </div>
                        {calcularDetalles(compraSeleccionada).envio === 0 && (
                          <p className="text-xs text-green-600 mt-2">✓ Envío gratis por compra {`>`} $1000</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-b from-gray-200 to-white rounded-lg shadow-lg p-8 text-center border border-gray-300">
                  <p className="text-gray-600">Selecciona una compra para ver los detalles</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
