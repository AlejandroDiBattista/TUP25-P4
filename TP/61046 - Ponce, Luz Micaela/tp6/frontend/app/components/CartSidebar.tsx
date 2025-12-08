"use client";

import { useCart } from '../context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CartSidebar() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeItem,
    loading,
    cancelarCompra
  } = useCart();


  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col sm:max-w-lg bg-pink-50">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-pink-700">Mi Carrito</SheetTitle>
        </SheetHeader>

        <Separator className="bg-pink-200" />
        {loading && <p>Actualizando carrito...</p>}
        {!cart || cart.productos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600">Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="flex flex-col gap-4">
                {cart.productos.map((item) => (
                  <div key={item.producto.id} className="flex gap-3 bg-white p-3 rounded-md shadow-sm">
                    <Image
                      src={`${API_URL}/${item.producto.imagen}`}
                      alt={item.producto.titulo}
                      width={80}
                      height={80}
                      className="object-contain rounded-md border"
                      unoptimized
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 line-clamp-1">{item.producto.titulo}</h4>
                      <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                      <p className="text-md font-bold text-pink-600">${(item.producto.precio * item.cantidad).toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => removeItem(item.producto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Separator className="bg-pink-200" />
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA:</span>
                <span className="font-medium">${cart.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span className="font-medium">${cart.envio.toFixed(2)}</span>
              </div>
              <Separator className="bg-pink-200" />
              <div className="flex justify-between text-lg font-bold text-pink-700">
                <span>Total:</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </div>

            <SheetFooter className="gap-2">


              <AlertDialog>
                <AlertDialogTrigger asChild>

                  <Button
                    variant="outline"
                    className="border-pink-300 text-pink-600 hover:bg-pink-100 hover:text-pink-700"
                  >
                    Cancelar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción vaciará tu carrito de compras por completo. No podrás deshacerla.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cerrar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={cancelarCompra}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sí, vaciar carrito
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Link href="/finalizar-compra" className="w-full">
                <Button
                  onClick={closeCart}
                  className="w-full bg-pink-500 text-white hover:bg-pink-600"
                >
                  Continuar compra
                </Button>
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}