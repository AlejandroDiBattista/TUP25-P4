'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, MapPin } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';
import { calcularTotales, formatCurrency } from '@/lib/pricing';

export default function CheckoutPage() {
  const router = useRouter();
  const { usuario, initialLoading } = useAuth();
  const { carrito, loading: cartLoading, error: cartError, finalizar, clearError } = useCart();
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ total: number; compraId: number } | null>(null);

  useEffect(() => {
    if (!initialLoading && !usuario) {
      router.replace('/iniciar-sesion');
    }
  }, [initialLoading, usuario, router]);

  useEffect(() => {
    if (!confirmation) {
      return;
    }
    const timeout = window.setTimeout(() => {
      router.push(`/compras?compra=${confirmation.compraId}`);
    }, 1800);
    return () => window.clearTimeout(timeout);
  }, [confirmation, router]);

  const subtotal = carrito?.total ?? 0;
  const totales = useMemo(() => calcularTotales(subtotal), [subtotal]);
  const estaVacio = !carrito || carrito.items.length === 0;

  function handleTarjetaChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const masked = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setTarjeta(masked);
  }

  function validarFormulario() {
    const trimmedAddress = direccion.trim();
    const tarjetaDigits = tarjeta.replace(/\D/g, '');

    if (trimmedAddress.length < 10) {
      return 'Ingresa una dirección completa de al menos 10 caracteres.';
    }

    if (tarjetaDigits.length < 12) {
      return 'Ingresa un número de tarjeta válido.';
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitError(null);
    clearError();

    const validation = validarFormulario();
    if (validation) {
      setFormError(validation);
      return;
    }

    if (estaVacio) {
      setFormError('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
      return;
    }

    const tarjetaDigits = tarjeta.replace(/\D/g, '');
    setIsSubmitting(true);
    try {
      const resultado = await finalizar({ direccion: direccion.trim(), tarjeta: tarjetaDigits });
      setConfirmation({ total: resultado.total, compraId: resultado.compra_id });
      setDireccion('');
      setTarjeta('');
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }
      setSubmitError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const mostrandoConfirmacion = Boolean(confirmation);
  const disabled = cartLoading || isSubmitting || mostrandoConfirmacion;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Seguir comprando
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Finalizar compra</h1>
        <p className="text-sm text-slate-600">
          Completa los datos de envío y pago para cerrar tu compra. Revisa el resumen de tu pedido antes de confirmar.
        </p>
      </div>

      {cartError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-red-700">
            <span>{cartError}</span>
          </CardContent>
        </Card>
      ) : null}

      {submitError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-red-700">
            <span>{submitError}</span>
          </CardContent>
        </Card>
      ) : null}

      {formError ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-amber-700">
            <span>{formError}</span>
          </CardContent>
        </Card>
      ) : null}

      {estaVacio && !cartLoading && !mostrandoConfirmacion ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Tu carrito está vacío</CardTitle>
            <CardDescription>
              Agrega productos desde el catálogo para avanzar con el checkout.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/">Ir al catálogo</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Card>
            <CardHeader className="flex flex-col gap-1">
              <CardTitle>Datos de envío</CardTitle>
              <CardDescription>Usaremos esta información para entregarte tu pedido.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-slate-500" /> Dirección de entrega
                    </Label>
                    <Textarea
                      id="direccion"
                      placeholder="Ej: Av. Siempre Viva 742, Springfield"
                      value={direccion}
                      onChange={(event) => setDireccion(event.target.value)}
                      disabled={disabled}
                      rows={4}
                    />
                    <p className="text-xs text-slate-500">
                      Incluye calle, altura, ciudad y referencias para asegurar una entrega exitosa.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tarjeta" className="flex items-center gap-2 text-sm font-medium">
                      <CreditCard className="h-4 w-4 text-slate-500" /> Tarjeta de pago
                    </Label>
                    <Input
                      id="tarjeta"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={tarjeta}
                      onChange={(event) => handleTarjetaChange(event.target.value)}
                      disabled={disabled}
                    />
                    <p className="text-xs text-slate-500">
                      Solo almacenamos los últimos dígitos para mostrarte el resumen de la compra.
                    </p>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={disabled}>
                  {isSubmitting || cartLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando compra
                    </>
                  ) : (
                    'Confirmar y pagar'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="h-fit border-slate-200">
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
              <CardDescription>Revisa los productos, cantidades y montos estimados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-16 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {carrito?.items.map((item) => (
                    <div key={item.producto_id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-900">{item.nombre}</span>
                        <span className="text-slate-500">x{item.cantidad}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                        <span>{formatCurrency(item.precio)} c/u</span>
                        <span className="font-medium text-slate-900">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatCurrency(totales.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>IVA (21%)</span>
                <span className="font-medium text-slate-900">{formatCurrency(totales.iva)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Envío estimado</span>
                <span className="font-medium text-slate-900">{formatCurrency(totales.envio)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                <span>Total a pagar</span>
                <span>{formatCurrency(totales.total)}</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {mostrandoConfirmacion && confirmation ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 p-4 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">Compra confirmada</p>
              <p className="text-sm">
                Tu pedido se registró correctamente. Total abonado: {formatCurrency(confirmation.total)}. Estamos redirigiéndote al historial para ver el detalle.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
