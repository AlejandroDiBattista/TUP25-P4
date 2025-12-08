'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, X } from 'lucide-react';
import { useCarrito } from '../hooks/useCarrito';
import { CartItem } from './CartItem';
import { toast } from 'sonner';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const router = useRouter();
  const { carrito, loading, agregar, quitar, cancelar, recargar } = useCarrito();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Recargar carrito cuando se abre el sidebar
  useEffect(() => {
    if (open) {
      recargar();
    }
  }, [open, recargar]);

  const handleUpdateQuantity = async (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;

    try {
      const item = carrito?.items.find(i => i.producto_id === productoId);
      if (!item) return;
      
      const cantidadActual = item.cantidad;
      const diferencia = nuevaCantidad - cantidadActual;

      if (diferencia > 0) {
        // Aumentar cantidad: enviar solo las unidades adicionales
        await agregar(productoId, diferencia);
        toast.success('Cantidad actualizada');
      } else if (diferencia < 0) {
        // Disminuir cantidad: quitar del carrito y volver a agregar
        await quitar(productoId);
        if (nuevaCantidad > 0) {
          await agregar(productoId, nuevaCantidad);
        }
        toast.success('Cantidad actualizada');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar cantidad';
      toast.error(message);
      // Recargar el carrito para reflejar el estado real del backend
      await recargar();
    }
  };

  const handleRemove = async (productoId: number) => {
    try {
      await quitar(productoId);
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar producto';
      toast.error(message);
    }
  };

  const handleCancelar = async () => {
    try {
      await cancelar();
      toast.success('Carrito cancelado');
      setShowCancelDialog(false);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cancelar carrito';
      toast.error(message);
    }
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(valor);
  };

  const hayItems = carrito && carrito.items && carrito.items.length > 0;

  return (
    <>
      {/* Sidebar fijo a la derecha con transición */}
      <div className={`fixed top-16 right-0 w-full sm:w-[450px] h-[calc(100vh-4rem)] bg-white border-l shadow-lg z-20 flex flex-col transition-transform duration-500 ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="px-6 py-4 border-b space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Carrito de compras</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            {hayItems
              ? `${carrito.items.length} ${carrito.items.length === 1 ? 'producto' : 'productos'} en tu carrito`
              : 'Tu carrito está vacío'}
          </p>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            )}

            {!loading && !hayItems && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2">Tu carrito está vacío</p>
                <p className="text-sm text-gray-400">
                  Agrega productos para comenzar tu compra
                </p>
              </div>
            )}

            {!loading && hayItems && (
              <div className="space-y-0">
                {carrito.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                    isUpdating={loading}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Resumen de totales */}
        {hayItems && !loading && (
          <div className="border-t px-6 py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatearMoneda(carrito.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA</span>
                <span className="font-medium">{formatearMoneda(carrito.iva)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="font-medium">
                  {carrito.envio === 0 ? 'GRATIS' : formatearMoneda(carrito.envio)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatearMoneda(carrito.total)}</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  onClose();
                  router.push('/checkout');
                }}
              >
                Continuar compra
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCancelDialog(true)}
                disabled={loading}
              >
                Cancelar carrito
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Alert Dialog para confirmar cancelación */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar carrito?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todos los productos de tu carrito. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mantener carrito</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelar}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, cancelar carrito
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
