"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import {
  obtenerCarrito,
  agregarProductoAlCarrito,
  quitarProductoDelCarrito,
} from "@/app/services/carritos";
import type { Carrito } from "@/app/types";

export default function Carrito() {
  const [items, setItems] = useState<NonNullable<Carrito["productos"]>>([]);
  const [totales, setTotales] = useState<{
    subtotal?: number;
    iva?: number;
    envio?: number;
    total?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  // Cálculo local inmediato (en centavos) para feedback instantáneo
  function calcularTotalesLocal(arr: NonNullable<Carrito["productos"]>) {
    const toCents = (v: number) => Math.round(v * 100);
    const fromCents = (c: number) => c / 100;
    const subtotalCents = arr.reduce(
      (acc, it) => acc + toCents(it.precio) * it.cantidad,
      0
    );
    const ivaCents = arr.reduce((acc, it) => {
      const cat = it.categoria?.toLowerCase() ?? "";
      const esElectronico = cat.includes("electr");
      const rate = esElectronico ? 10 : 21;
      const baseCents = toCents(it.precio) * it.cantidad;
      return acc + Math.round((baseCents * rate) / 100);
    }, 0);
    const totalSinEnvioCents = subtotalCents + ivaCents;
    const envioCents = totalSinEnvioCents > 100000 ? 0 : 5000;
    const totalCents = totalSinEnvioCents + envioCents;
    return {
      subtotal: fromCents(subtotalCents),
      iva: fromCents(ivaCents),
      envio: fromCents(envioCents),
      total: fromCents(totalCents),
    };
  }

  async function cargar() {
    try {
      setError(null);
      const carrito = await obtenerCarrito();
      setItems(carrito.productos ?? []);
      setTotales({
        subtotal: carrito.subtotal,
        iva: carrito.iva,
        envio: carrito.envio,
        total: carrito.total,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    function refrescar() {
      cargar();
    }
    window.addEventListener("cart:changed", refrescar);
    return () => window.removeEventListener("cart:changed", refrescar);
  }, []);

  async function actualizarCantidad(producto_id: number, delta: number) {
    try {
      const itemActual = items.find((i) => i.producto_id === producto_id);
      if (!itemActual) return;

      // Validar stock para incremento
      if (
        delta > 0 &&
        typeof itemActual.existencia === "number" &&
        itemActual.cantidad >= itemActual.existencia
      ) {
        setError("No hay stock suficiente para agregar más unidades.");
        return;
      }

      // Operación
      if (delta < 0 && itemActual.cantidad <= 1) {
        await quitarProductoDelCarrito(producto_id);
        // Optimista: remover inmediatamente y recalcular totales locales
        setItems((prev) => {
          const nuevo = prev.filter((p) => p.producto_id !== producto_id);
          setTotales(calcularTotalesLocal(nuevo));
          return nuevo;
        });
      } else {
        await agregarProductoAlCarrito(producto_id, delta);
        // Optimista: ajustar cantidad local y recalcular totales
        setItems((prev) => {
          const nuevo = prev.map((p) => {
            if (p.producto_id !== producto_id) return p;
            const nuevaCantidad = p.cantidad + delta;
            const nuevoSubtotal = p.precio * nuevaCantidad;
            return { ...p, cantidad: nuevaCantidad, subtotal: nuevoSubtotal };
          });
          setTotales(calcularTotalesLocal(nuevo));
          return nuevo;
        });
      }
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar");
    }
  }

  async function eliminarArticulo(producto_id: number) {
    try {
      await quitarProductoDelCarrito(producto_id);
      setItems((prev) => {
        const nuevo = prev.filter((p) => p.producto_id !== producto_id);
        setTotales(calcularTotalesLocal(nuevo));
        return nuevo;
      });
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  const articulosValidos = items ?? [];
  // Preferir totales del backend si están disponibles; si no, calcular localmente (en centavos)
  const toCents = (v: number) => Math.round(v * 100);
  const fromCents = (c: number) => c / 100;

  let subtotal = totales.subtotal ?? 0;
  let iva = totales.iva ?? 0;
  let envio = totales.envio ?? 0;
  let total = totales.total ?? 0;

  if (totales.subtotal == null || totales.total == null) {
    const subtotalCents = articulosValidos.reduce(
      (acc, it) => acc + toCents(it.precio) * it.cantidad,
      0
    );
    const ivaCents = articulosValidos.reduce((acc, it) => {
      const cat = it.categoria?.toLowerCase() ?? "";
      const esElectronico = cat.includes("electr");
      const rate = esElectronico ? 10 : 21;
      const baseCents = toCents(it.precio) * it.cantidad;
      return acc + Math.round((baseCents * rate) / 100);
    }, 0);
    const totalSinEnvioCents = subtotalCents + ivaCents;
    const envioCents = totalSinEnvioCents > 100000 ? 0 : 5000;
    const totalCents = totalSinEnvioCents + envioCents;
    subtotal = fromCents(subtotalCents);
    iva = fromCents(ivaCents);
    envio = fromCents(envioCents);
    total = fromCents(totalCents);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,0fr)]">
      <Card className="w-full max-w-3xl justify-self-center">
        <CardHeader>
          <CardTitle>Tu carrito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-4">
              {articulosValidos.map((item) => (
                <div
                  key={item.producto_id}
                  className="flex gap-7 rounded-lg border p-4"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-muted/50">
                    <Image
                      src={
                        item.imagen
                          ? item.imagen.startsWith("http")
                            ? item.imagen
                            : `${API_URL}/${item.imagen.replace(/^\//, "")}`
                          : `${API_URL}/imagenes/placeholder-producto.svg`
                      }
                      alt={item.nombre}
                      fill
                      className="object-contain"
                      sizes="80px"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 text-sm">
                    <div className="flex items-start justify-between">
                      <span className="font-semibold">{item.nombre}</span>
                      <span>${item.precio.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => actualizarCantidad(item.producto_id, -1)}
                        disabled={item.cantidad <= 1}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center">{item.cantidad}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => actualizarCantidad(item.producto_id, 1)}
                        disabled={
                          typeof item.existencia === "number" &&
                          item.cantidad >= item.existencia
                        }
                      >
                        +
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Total: $
                        {(item.subtotal ?? item.precio * item.cantidad).toFixed(
                          2
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarArticulo(item.producto_id)}
                      >
                        Quitar
                      </Button>
                    </div>
                    {typeof item.existencia === "number" && (
                      <span className="text-xs text-muted-foreground">
                        Stock disponible:{" "}
                        {Math.max(item.existencia - item.cantidad, 0)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {!loading && articulosValidos.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  Tu carrito está vacío.
                </div>
              )}
              {loading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Cargando carrito...
                </div>
              )}
              {error && (
                <div className="p-4 text-center text-sm text-red-600">
                  {(() => {
                    const e = error.toLowerCase();
                    if (
                      e.includes("401") ||
                      e.includes("falta token") ||
                      e.includes("no autorizado")
                    ) {
                      return "Inicia sesión para armar tu carrito";
                    }
                    return error;
                  })()}
                </div>
              )}
            </div>
          </ScrollArea>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA</span>
              <span className="font-semibold">${iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span className="font-semibold">${envio.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={articulosValidos.length === 0}>
            <Link href="/procesar-pago">Procesar pago</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
