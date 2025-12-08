'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { obtenerCarrito, eliminarDelCarrito, vaciarCarrito, finalizarCompra } from '../services/carrito';
import type { CarritoResponse } from '../services/carrito';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function CarritoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    cargarCarrito();
  }, [user, router]);

  const cargarCarrito = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerCarrito();
      setCarrito(data);
    } catch (error) {
      console.error('Error cargando carrito:', error);
      setError('Error al cargar el carrito');
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarCantidad = async (_itemId: number, _nuevaCantidad: number) => {
    // No disponible - el backend no soporta actualización de cantidad
    // El usuario debe eliminar y volver a agregar el producto
    alert('Para cambiar la cantidad, elimina el producto y agrégalo nuevamente desde el catálogo');
    return;
  };

  const eliminarItem = async (itemId: number) => {
    try {
      setIsUpdating(true);
      await eliminarDelCarrito(itemId);
      await cargarCarrito();
    } catch (error) {
      console.error('Error eliminando item:', error);
      setError('Error al eliminar el producto');
    } finally {
      setIsUpdating(false);
    }
  };

  const vaciarCarritoCompleto = async () => {
    try {
      setIsUpdating(true);
      await vaciarCarrito();
      await cargarCarrito();
    } catch (error) {
      console.error('Error vaciando carrito:', error);
      setError('Error al vaciar el carrito');
    } finally {
      setIsUpdating(false);
    }
  };

  const procesarCompra = async () => {
    if (!direccion.trim() || !tarjeta.trim()) {
      alert('Por favor completa la dirección y número de tarjeta');
      return;
    }

    try {
      setIsCheckingOut(true);
      const resultado = await finalizarCompra({ direccion, tarjeta });
      
      // Redirigir a página de compras con mensaje de éxito
      router.push(`/compras?success=true&total=${resultado.total}`);
    } catch (error) {
      console.error('Error procesando compra:', error);
      setError('Error al procesar la compra');
    } finally {
      setIsCheckingOut(false);
      setShowCheckoutDialog(false);
    }
  };

  const totalItems = carrito?.items.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartItemCount={0} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemCount={totalItems} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header del carrito */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continuar comprando
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
              <p className="text-gray-600 mt-1">
                {carrito?.items.length || 0} producto{(carrito?.items.length || 0) !== 1 ? 's' : ''} en tu carrito
              </p>
            </div>
            
            {(carrito?.items.length || 0) > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vaciar carrito
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Vaciar carrito?</DialogTitle>
                    <DialogDescription>
                      Esta acción eliminará todos los productos de tu carrito. No podrás deshacer esta acción.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button variant="destructive" onClick={vaciarCarritoCompleto}>
                      Vaciar carrito
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {(carrito?.items.length || 0) === 0 ? (
          // Carrito vacío
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 mb-6">
                Agrega algunos productos para comenzar tu compra.
              </p>
              <Link href="/">
                <Button>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Ir de compras
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          // Carrito con productos
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {carrito?.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                          {item.producto?.imagen ? (
                            <Image
                              src={`http://localhost:8000/imagenes/${item.producto.imagen}`}
                              alt={item.producto.nombre}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              Sin imagen
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.producto?.nombre}
                        </h3>
                        {item.producto?.categoria && (
                          <Badge variant="secondary" className="mt-1">
                            {item.producto.categoria}
                          </Badge>
                        )}
                        <p className="text-xl font-bold text-blue-600 mt-2">
                          ${item.producto?.precio?.toLocaleString()}
                        </p>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                          disabled={isUpdating || item.cantidad <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="text-lg font-semibold min-w-[2rem] text-center">
                          {item.cantidad}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                          disabled={isUpdating || item.cantidad >= (item.producto?.stock || 0)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Subtotal y eliminar */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${((item.producto?.precio || 0) * item.cantidad).toLocaleString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarItem(item.id)}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Resumen de compra */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Resumen de compra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} productos)</span>
                    <span>${carrito?.subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>IVA</span>
                    <span>${carrito?.iva.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>
                      {(carrito?.envio || 0) === 0 ? (
                        <span className="text-green-600 font-bold">GRATIS!!!</span>
                      ) : (
                        `$${carrito?.envio.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${carrito?.total.toLocaleString()}</span>
                  </div>

                  {(carrito?.subtotal || 0) < 100000 && (
                    <p className="text-sm text-gray-600">
                      Agrega ${(100000 - (carrito?.subtotal || 0)).toLocaleString()} más para envío gratis
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => setShowCheckoutDialog(true)}
                    disabled={isCheckingOut || (carrito?.items.length || 0) === 0}
                  >
                    {isCheckingOut ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    {isCheckingOut ? 'Procesando...' : 'Finalizar compra'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Dialog de checkout */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar compra</DialogTitle>
            <DialogDescription>
              Ingresa tus datos de envío y pago para completar la compra
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección de envío *</Label>
              <Input
                id="direccion"
                placeholder="Calle, Número, Ciudad"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tarjeta">Número de tarjeta *</Label>
              <Input
                id="tarjeta"
                placeholder="XXXX XXXX XXXX XXXX"
                value={tarjeta}
                onChange={(e) => setTarjeta(e.target.value)}
                maxLength={19}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Total a pagar:</strong> ${carrito?.total.toLocaleString()}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckoutDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={procesarCompra} disabled={isCheckingOut}>
              {isCheckingOut ? 'Procesando...' : 'Confirmar compra'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}