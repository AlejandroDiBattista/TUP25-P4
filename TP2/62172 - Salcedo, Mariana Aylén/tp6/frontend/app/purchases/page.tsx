'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Package, Calendar, DollarSign } from 'lucide-react';

interface CompraItem {
  id: number;
  producto_id: number;
  producto_titulo: string;
  producto_imagen: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Compra {
  id: number;
  fecha: string;
  total: number;
  estado: string;
  direccion?: string;
  ciudad?: string;
  codigo_postal?: string;
  telefono?: string;
  items: CompraItem[];
}

export default function PurchasesPage() {
  const router = useRouter();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);

  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarCompras = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/compras', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar compras');
      }

      const data = await response.json();
      setCompras(data);
      // Seleccionar la primera compra por defecto
      if (data.length > 0) {
        setCompraSeleccionada(data[0]);
      }
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
        <p className="text-center text-gray-500">Cargando compras...</p>
      </div>
    );
  }

  if (compras.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 text-center">
          <Package className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No tienes compras aún
          </h2>
          <p className="text-gray-600 mb-6">
            Explora nuestros productos y realiza tu primera compra
          </p>
          <Button onClick={() => router.push('/products')}>
            Ir a Productos
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mis Compras
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de compras - lado izquierdo */}
        <div className="lg:col-span-1 space-y-4">
          {compras.map((compra) => (
            <Card
              key={compra.id}
              className={`p-4 cursor-pointer transition-all ${
                compraSeleccionada?.id === compra.id
                  ? 'border-2 border-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setCompraSeleccionada(compra)}
            >
              <div className="mb-3">
                <h3 className="font-bold text-gray-900">
                  Compra #{compra.id}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatearFecha(compra.fecha)}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                Total: ${compra.total.toFixed(2)}
              </p>
            </Card>
          ))}
        </div>

        {/* Detalle de la compra seleccionada - lado derecho */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Detalle de la compra
            </h2>
            
            {compraSeleccionada && (
              <>
                {/* Info de la compra */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Compra #:</p>
                    <p className="font-semibold text-gray-900">{compraSeleccionada.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha:</p>
                    <p className="font-semibold text-gray-900">
                      {formatearFecha(compraSeleccionada.fecha)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Dirección de envío:</p>
                    <p className="font-semibold text-gray-900">
                      {compraSeleccionada.direccion || 'No especificada'}
                    </p>
                    {compraSeleccionada.ciudad && compraSeleccionada.codigo_postal && (
                      <p className="font-semibold text-gray-900">
                        {compraSeleccionada.ciudad}, CP {compraSeleccionada.codigo_postal}
                      </p>
                    )}
                    {compraSeleccionada.telefono && (
                      <p className="text-sm text-gray-600 mt-1">
                        Tel: {compraSeleccionada.telefono}
                      </p>
                    )}
                  </div>
                </div>

                {/* Productos */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Productos</h3>
                  <div className="space-y-4">
                    {compraSeleccionada.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.producto_titulo}</p>
                          <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ${item.subtotal.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            IVA: ${(item.subtotal * 0.21).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totales */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      ${(compraSeleccionada.total / 1.21).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>IVA:</span>
                    <span className="font-semibold">
                      ${(compraSeleccionada.total - compraSeleccionada.total / 1.21).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Envío:</span>
                    <span className="font-semibold">$50.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Total pagado:</span>
                    <span>${compraSeleccionada.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
