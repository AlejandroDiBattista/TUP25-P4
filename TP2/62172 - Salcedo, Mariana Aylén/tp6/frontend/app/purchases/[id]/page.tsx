'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Calendar, CheckCircle } from 'lucide-react';

interface CompraItem {
  id: number;
  producto_id: number;
  producto_titulo: string;
  producto_imagen: string;
  producto_categoria: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Compra {
  id: number;
  usuario_id: number;
  fecha: string;
  total: number;
  estado: string;
  direccion?: string;
  ciudad?: string;
  codigo_postal?: string;
  telefono?: string;
  items: CompraItem[];
}

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [compra, setCompra] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCompra();
  }, [params.id]);

  const cargarCompra = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:8000/compras/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Compra no encontrada');
      }

      const data = await response.json();
      setCompra(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Cargando compra...</p>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-red-500">Compra no encontrada</p>
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchases')}>
            Volver a Mis Compras
          </Button>
        </div>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/purchases')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Mis Compras
      </Button>

      {/* Header de la compra */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pedido #{compra.id}
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatearFecha(compra.fecha)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="text-lg font-semibold text-green-600 capitalize">
                {compra.estado}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Productos ({compra.items.length})
          </h2>

          <div className="space-y-4">
            {compra.items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  {/* Imagen */}
                  <div className="relative w-24 h-24 bg-gray-100 rounded-md flex-shrink-0">
                    <Image
                      src={`${API_URL}/${item.producto_imagen}`}
                      alt={item.producto_titulo}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>

                  {/* Información */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.producto_titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.producto_categoria}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        Cantidad: {item.cantidad}
                      </span>
                      <span className="text-sm text-gray-600">
                        Precio unitario: ${item.precio_unitario.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Resumen
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">${compra.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío:</span>
                <span className="font-medium text-green-600">Gratis</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total Pagado:</span>
                <span className="text-blue-600">${compra.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Dirección de envío */}
            {compra.direccion && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Dirección de envío</h3>
                <p className="text-sm text-gray-700">{compra.direccion}</p>
                {compra.ciudad && compra.codigo_postal && (
                  <p className="text-sm text-gray-700">
                    {compra.ciudad}, CP {compra.codigo_postal}
                  </p>
                )}
                {compra.telefono && (
                  <p className="text-sm text-gray-600 mt-1">Tel: {compra.telefono}</p>
                )}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Compra completada</p>
                  <p className="text-green-700 text-xs">
                    Tu pedido ha sido procesado exitosamente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">
                    {compra.items.reduce((sum, item) => sum + item.cantidad, 0)} productos
                  </p>
                  <p className="text-blue-700 text-xs">
                    Productos incluidos en este pedido
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              onClick={() => router.push('/products')}
            >
              Seguir Comprando
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
