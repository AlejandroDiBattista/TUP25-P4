'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Loader2,
  MapPin,
  Package2,
  Receipt,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { obtenerCompraPorId, obtenerCompras } from '@/app/services/compras';
import { CompraDetalle, CompraResumen } from '@/app/types';
import { formatCurrency } from '@/lib/pricing';
import { cn } from '@/lib/utils';

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

function maskCard(value?: string | null) {
  if (!value) {
    return 'No disponible';
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) {
    return `**** **** **** ${digits.padStart(4, '*')}`;
  }
  const visible = digits.slice(-4);
  return `**** **** **** ${visible}`;
}

export default function ComprasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { usuario, token, initialLoading } = useAuth();

  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [comprasLoading, setComprasLoading] = useState(true);
  const [comprasError, setComprasError] = useState<string | null>(null);

  const [detalle, setDetalle] = useState<CompraDetalle | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleError, setDetalleError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (initialLoading) {
      return;
    }
    if (!usuario) {
      router.replace('/iniciar-sesion');
    }
  }, [initialLoading, usuario, router]);

  const fetchCompras = useCallback(async (signal?: AbortSignal) => {
    if (!token) {
      return;
    }
    setComprasLoading(true);
    setComprasError(null);
    try {
      const data = await obtenerCompras(token, { signal });
      setCompras(data);
      if (data.length === 0) {
        setSelectedId(null);
        setDetalle(null);
        setDetalleError(null);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }
      setComprasError((error as Error).message);
    } finally {
      if (!signal?.aborted) {
        setComprasLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    const controller = new AbortController();
    fetchCompras(controller.signal);
    return () => controller.abort();
  }, [token, fetchCompras]);

  const compraParam = searchParams.get('compra');
  const compraIdFromQuery = useMemo(() => {
    if (!compraParam) {
      return null;
    }
    const parsed = Number.parseInt(compraParam, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [compraParam]);

  useEffect(() => {
    if (compras.length === 0) {
      return;
    }
    const initialSelection = compraIdFromQuery && compras.some((compra) => compra.id === compraIdFromQuery)
      ? compraIdFromQuery
      : compras[0]?.id;
    if (initialSelection && initialSelection !== selectedId) {
      setSelectedId(initialSelection);
    }
  }, [compras, compraIdFromQuery, selectedId]);

  useEffect(() => {
    if (!token || !selectedId) {
      return;
    }
    const controller = new AbortController();
    setDetalleLoading(true);
    setDetalleError(null);
    obtenerCompraPorId(token, selectedId, { signal: controller.signal })
      .then((data) => {
        setDetalle(data);
      })
      .catch((error) => {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        setDetalleError((error as Error).message);
        setDetalle(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setDetalleLoading(false);
        }
      });

    return () => controller.abort();
  }, [token, selectedId]);

  const handleSelectCompra = useCallback(
    (compraId: number) => {
      if (compraId === selectedId) {
        return;
      }
      setSelectedId(compraId);
      setDetalle(null);
      setDetalleError(null);
      router.replace(`/compras?compra=${compraId}`);
    },
    [router, selectedId],
  );

  const handleRetry = () => {
    fetchCompras();
  };

  const mostrandoDetalle = Boolean(detalle) || detalleLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al catálogo
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Historial de compras</h1>
        <p className="text-sm text-slate-600">
          Revisa tus órdenes previas, consulta los detalles y verifica los totales pagados.
        </p>
      </div>

      {comprasError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <p className="text-sm font-medium text-red-700">{comprasError}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {comprasLoading ? (
        <ListaComprasSkeleton />
      ) : compras.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No registramos compras</CardTitle>
            <CardDescription>
              Realiza tu primera compra para verla reflejada en este historial.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/">Volver a la tienda</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Compras recientes</CardTitle>
              <CardDescription>
                Selecciona una compra para ver el detalle completo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                {compras.map((compra) => {
                  const isSelected = compra.id === selectedId;
                  return (
                    <button
                      key={compra.id}
                      type="button"
                      onClick={() => handleSelectCompra(compra.id)}
                      className={cn(
                        'w-full px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
                        isSelected ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 hover:bg-slate-50',
                      )}
                    >
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>Compra #{compra.id}</span>
                        <span>{formatCurrency(compra.total)}</span>
                      </div>
                      <div className={cn('mt-1 flex items-center justify-between text-xs', isSelected ? 'text-slate-200' : 'text-slate-500')}>
                        <span>{formatDateTime(compra.fecha)}</span>
                        <span>{compra.cantidad_items} item{compra.cantidad_items === 1 ? '' : 's'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>Detalle de la compra</CardTitle>
                {detalleLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : null}
              </div>
              <CardDescription>
                {(detalle && `Compra #${detalle.id}`) || (detalleError ?? 'Selecciona una compra para ver el detalle.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {detalleError ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 text-sm text-red-700">{detalleError}</CardContent>
                </Card>
              ) : null}

              {mostrandoDetalle ? (
                <div className="space-y-5">
                  <section className="grid gap-4 sm:grid-cols-2">
                    <ResumenDato
                      icon={CalendarDays}
                      titulo="Fecha"
                      descripcion={detalle ? formatDateTime(detalle.fecha) : '---'}
                    />
                    <ResumenDato
                      icon={Package2}
                      titulo="Cantidad"
                      descripcion={detalle ? `${detalle.cantidad_items} item${detalle.cantidad_items === 1 ? '' : 's'}` : '---'}
                    />
                    <ResumenDato
                      icon={MapPin}
                      titulo="Dirección"
                      descripcion={detalle?.direccion ?? 'No registrada'}
                    />
                    <ResumenDato
                      icon={CreditCard}
                      titulo="Tarjeta"
                      descripcion={maskCard(detalle?.tarjeta)}
                    />
                  </section>

                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Productos</h2>
                    <div className="space-y-3">
                      {detalle?.items.map((item) => (
                        <div
                          key={item.producto_id}
                          className="rounded-lg border border-slate-200 p-3"
                        >
                          <div className="flex items-center justify-between text-sm font-medium text-slate-900">
                            <span>{item.nombre}</span>
                            <span>{formatCurrency(item.subtotal)}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span>{formatCurrency(item.precio_unitario)} c/u</span>
                            <span>{item.cantidad} unidad{item.cantidad === 1 ? '' : 'es'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900">{detalle ? formatCurrency(detalle.subtotal) : '---'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>IVA</span>
                      <span className="font-medium text-slate-900">{detalle ? formatCurrency(detalle.iva) : '---'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Envío</span>
                      <span className="font-medium text-slate-900">{detalle ? formatCurrency(detalle.envio) : '---'}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                      <span>Total pagado</span>
                      <span>{detalle ? formatCurrency(detalle.total) : '---'}</span>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center text-center text-sm text-slate-500">
                  <Receipt className="mb-3 h-8 w-8 text-slate-400" />
                  <p>Selecciona una compra del listado para ver sus detalles.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ResumenDato({
  icon: Icon,
  titulo,
  descripcion,
}: {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <Icon className="h-5 w-5 text-slate-500" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
        <p className="text-sm text-slate-900">{descripcion}</p>
      </div>
    </div>
  );
}

function ListaComprasSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <Card className="h-fit">
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
          ))}
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader>
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
