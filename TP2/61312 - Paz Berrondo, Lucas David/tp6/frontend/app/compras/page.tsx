'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    estaAutenticado,
    getAuthHeaders,
    obtenerNombreAlmacenado,
    obtenerUsuarioActual,
} from '../services/auth';

interface ItemCompra {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

interface CompraResumen {
  id: number;
  fecha: string;
  total: number;
  envio: number;
  cantidad_items: number;
}

interface CompraDetalle extends CompraResumen {
  direccion: string;
  tarjeta: string;
  items: ItemCompra[];
  subtotal: number;
}

const enmascararTarjeta = (tarjeta: string) => {
  const digits = tarjeta.replace(/\s+/g, '');
  if (digits.length < 4) return '**** **** **** ****';
  return `**** **** **** ${digits.slice(-4)}`;
};

export default function ComprasPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [compraDetalle, setCompraDetalle] = useState<number | null>(null);
  const [detalles, setDetalles] = useState<Record<number, CompraDetalle>>({});
  const [detalleCargando, setDetalleCargando] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');

  const cargarCompras = async () => {
    try {
      const response = await fetch(`${API_URL}/compras/historial`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Error al cargar compras');
      
      const data: CompraResumen[] = await response.json();
      setCompras(data);
    } catch (error) {
      console.error('Error:', error);
      setMensaje(error instanceof Error ? error.message : 'Error al cargar compras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!estaAutenticado()) {
      router.push('/auth');
      return;
    }
    cargarCompras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!estaAutenticado()) {
      setNombreUsuario('');
      return;
    }

    const almacenado = obtenerNombreAlmacenado();
    if (almacenado) {
      setNombreUsuario(almacenado);
      return;
    }

    obtenerUsuarioActual()
      .then((usuario) => setNombreUsuario(usuario.nombre))
      .catch((err) => console.error('Error al obtener usuario actual:', err));
  }, []);

  const toggleDetalle = async (compraId: number) => {
    if (compraDetalle === compraId) {
      setCompraDetalle(null);
      return;
    }

    if (!detalles[compraId]) {
      setDetalleCargando(compraId);
      try {
        const response = await fetch(`${API_URL}/compras/${compraId}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error('Error al cargar detalle de compra');

        const detalle: CompraDetalle = await response.json();
        setDetalles((prev) => ({ ...prev, [compraId]: detalle }));
        setCompraDetalle(compraId);
      } catch (error) {
        console.error('Error al cargar detalle:', error);
        setMensaje(error instanceof Error ? error.message : 'Error al cargar detalle de compra');
        setTimeout(() => setMensaje(''), 3000);
      } finally {
        setDetalleCargando(null);
      }
      return;
    }

    setCompraDetalle(compraId);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
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
        <p className="text-gray-600">Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Compras</h1>
              <p className="text-gray-600 mt-2">Consulta el historial y detalles de tus pedidos.</p>
            </div>
            <div className="flex items-center gap-4">
              {nombreUsuario && (
                <span className="nav-username">Hola, {nombreUsuario}</span>
              )}
              <button
                onClick={() => router.push('/')}
                className="btn-link"
              >
                ← Volver al catálogo
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {mensaje && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {mensaje}
          </div>
        )}
        {compras.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-xl mb-4">No tienes compras aún</p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Comenzar a comprar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">
              Total de compras: {compras.length}
            </p>

            {compras.map((compra) => {
              const detalle = detalles[compra.id];
              const cantidadProductos = detalle ? detalle.items.length : compra.cantidad_items;

              return (
                <div key={compra.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header de la compra */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => void toggleDetalle(compra.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Compra #{compra.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatearFecha(compra.fecha)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {cantidadProductos} producto{cantidadProductos !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ${compra.total.toFixed(2)}
                      </p>
                      <button className="text-sm text-blue-600 hover:text-blue-700 mt-2">
                        {detalleCargando === compra.id
                          ? 'Cargando...'
                          : compraDetalle === compra.id
                            ? 'Ocultar detalles ▲'
                            : 'Ver detalles ▼'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detalle expandible */}
                {compraDetalle === compra.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {detalleCargando === compra.id ? (
                      <p className="text-sm text-gray-600">Cargando detalle...</p>
                    ) : detalle ? (
                      <>
                        {/* Lista de productos */}
                        <h4 className="font-semibold text-gray-900 mb-4">Productos:</h4>
                        <div className="space-y-3 mb-6">
                          {detalle.items.map((item) => (
                            <div key={item.producto_id} className="flex justify-between items-center bg-white p-3 rounded">
                              <div>
                                <p className="font-medium text-gray-900">{item.nombre}</p>
                                <p className="text-sm text-gray-600">
                                  Cantidad: {item.cantidad} × ${item.precio_unitario.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                ${item.subtotal.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Resumen de totales */}
                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between text-gray-700">
                            <span>Subtotal:</span>
                            <span>${detalle.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>IVA:</span>
                            <span>${(detalle.total - detalle.subtotal - detalle.envio).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>Envío:</span>
                            <span>{detalle.envio === 0 ? 'GRATIS' : `$${detalle.envio.toFixed(2)}`}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-blue-600">${detalle.total.toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
                            <p>
                              <span className="font-medium">Dirección:</span> {detalle.direccion}
                            </p>
                            <p>
                              <span className="font-medium">Tarjeta:</span> {enmascararTarjeta(detalle.tarjeta)}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-red-600">No se pudo cargar el detalle de la compra.</p>
                    )}
                  </div>
                )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
