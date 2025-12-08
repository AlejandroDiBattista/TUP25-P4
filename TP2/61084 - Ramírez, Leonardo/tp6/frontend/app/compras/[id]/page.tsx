'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

interface CarritoItem {
  producto_id: number;
  cantidad: number;
}

interface Compra {
  id: number;
  usuario: string;
  items: CarritoItem[];
  subtotal?: number;
  iva?: number;
  envio?: number;
  total: number;
  direccion: string;
  fecha: string;
  // El backend enriquece con 'items_detallados'
  items_detallados?: Array<{
    producto_id: number;
    cantidad: number;
    titulo?: string;
    precio?: number;
    imagen?: string;
    categoria?: string;
    subtotal?: number;
  }>;
}

export default function DetalleCompraBPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const compraId = params?.id;

  const [compra, setCompra] = useState<Compra | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }

    const loadCompra = async () => {
      try {
        const response = await fetch(`${API_URL}/compras/${compraId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Compra no encontrada');
        }

        const data = await response.json();
        setCompra(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la compra');
      } finally {
        setIsLoading(false);
      }
    };

    if (compraId) {
      loadCompra();
    }
  }, [token, compraId, router, API_URL]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <button
          onClick={() => router.back()}
          className="text-black hover:opacity-70 mb-6 text-sm underline transition-opacity"
        >
          ← Volver
        </button>

        {error && (
          <div className="mb-6 p-4 border border-black text-black text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Cargando detalle...</div>
        ) : compra ? (
          <div className="border border-gray-200 p-8">
            {/* Mensaje de éxito */}
            <div className="mb-8 p-6 bg-black text-white text-center">
              <p className="text-2xl font-light mb-2">✓ Compra exitosa</p>
              <p className="text-sm opacity-80">Tu pedido ha sido procesado correctamente</p>
            </div>

            <h1 className="text-2xl font-light mb-8 tracking-tight">Compra #{compra.id}</h1>

            <div className="space-y-6 mb-8 pb-8 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Fecha de compra</p>
                <p className="text-base font-normal">
                  {new Date(compra.fecha).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Dirección de envío</p>
                <p className="text-base font-normal">{compra.direccion}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-normal mb-6 tracking-tight">Artículos comprados</h2>
              <div className="space-y-3">
                {(compra.items_detallados ?? compra.items).map((item: any) => {
                  const precioUnitario = item.precio || 0;
                  const totalProducto = precioUnitario * item.cantidad;
                  
                  return (
                    <div key={item.producto_id} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <p className="text-sm font-normal text-gray-900 mb-1">
                          {item.titulo ? item.titulo : `Producto ID: ${item.producto_id}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${precioUnitario.toFixed(2)} × {item.cantidad} unidades
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-normal text-black">
                          ${totalProducto.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-6 border border-gray-200">
              <h3 className="font-normal text-base mb-3 uppercase tracking-wider">Resumen</h3>
              <div className="space-y-2 text-sm mb-3">
                {typeof compra.subtotal === 'number' && (
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${compra.subtotal.toFixed(2)}</span></div>
                )}
                {typeof compra.iva === 'number' && (
                  <div className="flex justify-between"><span className="text-gray-600">IVA</span><span>${compra.iva.toFixed(2)}</span></div>
                )}
                {typeof compra.envio === 'number' && (
                  <div className="flex justify-between"><span className="text-gray-600">Envío{compra.envio === 0 ? ' (gratis)' : ''}</span><span>${compra.envio.toFixed(2)}</span></div>
                )}
              </div>
              <div className="flex justify-between text-base border-t border-gray-200 pt-3">
                <span className="font-normal">Total</span>
                <span className="text-2xl font-light text-black">${compra.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full mt-8 bg-black hover:bg-gray-800 text-white font-normal py-3 transition-colors text-sm uppercase tracking-wider"
            >
              Continuar comprando
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
