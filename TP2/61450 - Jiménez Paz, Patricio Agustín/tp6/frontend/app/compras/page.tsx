'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { obtenerHistorialCompras, obtenerDetalleCompra } from '../services/compras';
import { CompraResumen, Compra } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { toast } from 'sonner';
import DetalleCompra from '../components/DetalleCompra';

export default function ComprasPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    cargarCompras();
  }, [isAuthenticated]);

  const cargarCompras = async () => {
    try {
      setLoading(true);
      const data = await obtenerHistorialCompras();
      setCompras(data);
      // Seleccionar la primera compra automáticamente
      if (data.length > 0) {
        cargarDetalle(data[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar el historial de compras');
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalle = async (compraId: number) => {
    try {
      setLoadingDetalle(true);
      const detalle = await obtenerDetalleCompra(compraId);
      setCompraSeleccionada(detalle);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar el detalle de la compra');
    } finally {
      setLoadingDetalle(false);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Cargando compras...</p>
      </div>
    );
  }

  if (compras.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sin Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Aún no has realizado ninguna compra</p>
              <Link href="/">
                <Button className="w-full">Ir a Comprar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Historial de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Listado de compras */}
          <div className="lg:col-span-1 space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mis Compras</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
                {compras.map((compra) => (
                  <div
                    key={compra.id}
                    onClick={() => cargarDetalle(compra.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      compraSeleccionada?.id === compra.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-900">Orden #{compra.id}</span>
                      <Badge 
                        variant={compra.estado === 'completada' ? 'default' : 'secondary'}
                        className="capitalize text-xs"
                      >
                        {compra.estado}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(compra.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      ${compra.total.toFixed(2)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Volver a la Tienda
              </Button>
            </Link>
          </div>

          {/* Columna derecha - Detalle de compra seleccionada */}
          <div className="lg:col-span-2">
            {loadingDetalle ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600">Cargando detalle...</p>
                </CardContent>
              </Card>
            ) : compraSeleccionada ? (
              <DetalleCompra compra={compraSeleccionada} />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Selecciona una compra para ver los detalles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
