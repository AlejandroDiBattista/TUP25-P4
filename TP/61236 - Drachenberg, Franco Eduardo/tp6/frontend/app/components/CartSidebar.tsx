'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { calcularTotales, formatCurrency } from '@/lib/pricing';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export function CartSidebarSkeleton() {
  return (
    <Card className="hidden h-min animate-pulse bg-slate-100/60 lg:block">
      <CardHeader>
        <div className="h-6 w-32 rounded bg-slate-200" />
        <div className="h-4 w-48 rounded bg-slate-200" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-12 w-full rounded bg-slate-200" />
        ))}
      </CardContent>
      <CardFooter className="space-y-2 pt-0">
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
      </CardFooter>
    </Card>
  );
}

export function CartSidebar() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { carrito, loading, error, addItem, decreaseItem, removeItem, cancelar, isItemUpdating } =
    useCart();
  const [isCancelling, setIsCancelling] = useState(false);

  const items = carrito?.items ?? [];
  const subtotal = carrito?.total ?? 0;
  const totales = useMemo(() => calcularTotales(subtotal), [subtotal]);
  const estaVacio = items.length === 0;

  const manejarCheckout = () => {
    router.push('/checkout');
  };

  const manejarCancelar = () => {
    setIsCancelling(true);
    cancelar()
      .catch(() => {
        /* El contexto ya maneja el mensaje de error */
      })
      .finally(() => {
        setIsCancelling(false);
      });
  };

  return (
    <Card className="hidden h-min lg:block">
      <CardHeader className="space-y-2">
        <CardTitle>Tu carrito</CardTitle>
        <CardDescription>
          {usuario
            ? 'Administra tus productos y continúa con la compra cuando estés listo.'
            : 'Inicia sesión para ver y editar tu carrito.'}
        </CardDescription>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : estaVacio ? (
          <div className="rounded-md border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Agrega productos para verlos aquí con sus cantidades, precios e impuestos estimados.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.producto_id} className="rounded-lg border border-slate-200 p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.nombre}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(item.precio)} c/u</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.producto_id)}
                    disabled={isItemUpdating(item.producto_id) || loading || isCancelling}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => decreaseItem(item.producto_id)}
                      disabled={isItemUpdating(item.producto_id) || loading || isCancelling}
                      aria-label="Reducir cantidad"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold text-slate-900">
                      {item.cantidad}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addItem(item.producto_id)}
                      disabled={isItemUpdating(item.producto_id) || loading || isCancelling}
                      aria-label="Incrementar cantidad"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-slate-200 pt-4">
        <div className="w-full space-y-2 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">{formatCurrency(totales.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>IVA estimado</span>
            <span className="font-medium text-slate-900">{formatCurrency(totales.iva)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Envío</span>
            <span className="font-medium text-slate-900">{formatCurrency(totales.envio)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(totales.total)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            onClick={manejarCancelar}
            disabled={loading || estaVacio || isCancelling}
          >
            Cancelar
          </Button>
          <Button onClick={manejarCheckout} disabled={estaVacio || loading || isCancelling}>
            Continuar compra
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
