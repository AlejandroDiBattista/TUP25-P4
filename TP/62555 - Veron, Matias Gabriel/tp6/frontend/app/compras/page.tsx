'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, CheckCircle, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Compra, CompraDetalle } from '../types';
import { obtenerCompras, obtenerCompraPorId } from '../services/compras';
import { formatearPrecio, formatearFecha } from '../utils/format';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function ComprasPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<CompraDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);

  const isSuccess = searchParams.get('success') === 'true';
  const totalCompra = searchParams.get('total');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (isSuccess) setShowSuccessDialog(true);
    cargarCompras();
  }, [user, router, isSuccess]);

  const cargarCompras = async () => {
    try {
      setIsLoading(true);
      const comprasData = await obtenerCompras();
      setCompras(comprasData);
    } catch (error) {
      console.error('Error cargando compras:', error);
      setError('Error al cargar las compras');
    } finally {
      setIsLoading(false);
    }
  };

  const verDetalle = async (id: number) => {
    try {
      const detalle = await obtenerCompraPorId(id);
      setCompraSeleccionada(detalle);
      setShowDetalleDialog(true);
    } catch (error) {
      console.error('Error cargando detalle:', error);
      setError('Error al cargar el detalle de la compra');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartItemCount={0} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando compras...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemCount={0} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Mis Compras</h1>
          <p className="text-gray-600 mt-1">Historial de todas tus compras realizadas</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>
        )}

        {compras.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="mx-auto h-24 w-24 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes compras</h3>
              <p className="text-gray-600 mb-6">Cuando realices tu primera compra, aparecerá aquí.</p>
              <Link href="/"><Button>Ir de compras</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {compras.map((compra) => (
              <Card key={compra.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => verDetalle(compra.id)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle><span>Compra #{compra.id}</span></CardTitle>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatearFecha(compra.fecha)}</span>
                      </div>
                      {compra.direccion && (
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{compra.direccion}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${formatearPrecio(compra.total)}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showDetalleDialog} onOpenChange={setShowDetalleDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalle de la compra</DialogTitle></DialogHeader>
          {compraSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-600">Compra #:</p><p className="font-semibold">{compraSeleccionada.id}</p></div>
                <div><p className="text-gray-600">Fecha:</p><p className="font-semibold">{formatearFecha(compraSeleccionada.fecha)}</p></div>
                <div><p className="text-gray-600">Dirección:</p><p className="font-semibold">{compraSeleccionada.direccion}</p></div>
                <div><p className="text-gray-600">Tarjeta:</p><p className="font-semibold">**** **** **** {compraSeleccionada.tarjeta}</p></div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Productos</h3>
                <div className="space-y-3">
                  {compraSeleccionada.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${formatearPrecio(item.subtotal)}</p>
                        <p className="text-sm text-gray-600">(IVA: ${formatearPrecio(item.precio_unitario)})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-semibold">${formatearPrecio(compraSeleccionada.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">IVA:</span><span className="font-semibold">${formatearPrecio(compraSeleccionada.iva)}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold">
                    {compraSeleccionada.envio === 0 ? (
                      <span className="text-green-600 font-bold">GRATIS!!!</span>
                    ) : (
                      `$${formatearPrecio(compraSeleccionada.envio)}`
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg"><span className="font-bold">Total pagado:</span><span className="font-bold text-blue-600">${formatearPrecio(compraSeleccionada.total)}</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">¡Compra realizada con éxito!</DialogTitle>
            <DialogDescription className="text-center">
              Tu pedido ha sido procesado correctamente.
              {totalCompra && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">
                    Total pagado: ${parseFloat(totalCompra).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setShowSuccessDialog(false)}>Continuar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
