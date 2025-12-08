'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';

export default function CartPage() {
  const router = useRouter();
  const { items, actualizarCantidad, eliminarDelCarrito, vaciarCarrito, totalPrecio } = useCart();
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState('');
  const [mostrarDialogoVaciar, setMostrarDialogoVaciar] = useState(false);

  const handleActualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    actualizarCantidad(productoId, nuevaCantidad);
  };

  const handleEliminar = (productoId: number) => {
    eliminarDelCarrito(productoId);
    setMensajeToast('Producto eliminado del carrito');
    setMostrarToast(true);
  };

  const handleVaciarCarrito = () => {
    vaciarCarrito();
    setMensajeToast('Carrito vaciado');
    setMostrarToast(true);
    setMostrarDialogoVaciar(false);
  };

  const handleFinalizarCompra = async () => {
    // Redirigir a la página de checkout
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            Agrega productos para comenzar tu compra
          </p>
          <Button onClick={() => router.push('/products')}>
            Ir a Productos
          </Button>
        </Card>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {mostrarToast && (
        <Toast
          mensaje={mensajeToast}
          onClose={() => setMostrarToast(false)}
        />
      )}

      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/products')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Seguir comprando
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Carrito de Compras
            </h1>
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarDialogoVaciar(true)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Vaciar carrito
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.producto.id} className="p-4">
                <div className="flex gap-4">
                  {/* Imagen del producto */}
                  <div className="relative w-24 h-24 bg-gray-100 rounded-md flex-shrink-0">
                    <Image
                      src={`${API_URL}/${item.producto.imagen}`}
                      alt={item.producto.titulo}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.producto.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {item.producto.categoria}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Selector de cantidad */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleActualizarCantidad(
                              item.producto.id,
                              item.cantidad - 1
                            )
                          }
                          disabled={item.cantidad <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-semibold min-w-[2rem] text-center">
                          {item.cantidad}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleActualizarCantidad(
                              item.producto.id,
                              item.cantidad + 1
                            )
                          }
                          disabled={item.cantidad >= item.producto.existencia}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Precio */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          ${(item.producto.precio * item.cantidad).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${item.producto.precio} c/u
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEliminar(item.producto.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Resumen del Pedido
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">${totalPrecio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío:</span>
                <span className="font-medium text-green-600">Gratis</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-blue-600">${totalPrecio.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleFinalizarCompra}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Finalizar Compra
            </Button>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Envío gratis
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Pago seguro
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Devoluciones fáciles
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Diálogo de confirmación para vaciar carrito */}
      <AlertDialog open={mostrarDialogoVaciar} onOpenChange={setMostrarDialogoVaciar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Vaciar carrito?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todos los productos del carrito. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleVaciarCarrito}
              className="bg-red-600 hover:bg-red-700"
            >
              Vaciar carrito
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
