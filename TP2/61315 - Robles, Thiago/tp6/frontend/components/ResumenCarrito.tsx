"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { obtenerCarrito } from "@/app/services/carritos";

type ItemResumen = {
  nombre: string;
  precio: number;
  cantidad: number;
  categoria?: string;
};

export default function ResumenCarrito() {
  const [items, setItems] = useState<ItemResumen[]>([]);

  async function cargar() {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setItems([]);
      return;
    }
    const carrito = await obtenerCarrito();
    setItems(
      (carrito.productos ?? []).map((p) => ({
        nombre: p.nombre,
        precio: p.precio,
        cantidad: p.cantidad,
        categoria: (p as { categoria?: string }).categoria,
      }))
    );
  }

  useEffect(() => {
    const id = setTimeout(() => {
      void cargar();
    }, 0);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    const refrescar = () => cargar();
    window.addEventListener("cart:changed", refrescar);
    return () => window.removeEventListener("cart:changed", refrescar);
  }, []);

  const { subtotal, iva, envio, total } = useMemo(() => {
    const subtotal = items.reduce(
      (acc, it) => acc + it.precio * it.cantidad,
      0
    );
    // IVA por categoría: electrónicos 10%, resto 21%
    const iva = items.reduce((acc, it) => {
      const cat = (it.categoria ?? "").toLowerCase();
      const esElectronico = cat.includes("electr");
      const tasa = esElectronico ? 0.1 : 0.21;
      return acc + it.precio * it.cantidad * tasa;
    }, 0);
    // Envío: gratis si subtotal+iva > $1000; si no, $50
    const envio = subtotal + iva > 1000 ? 0 : 50;
    const total = subtotal + iva + envio;

    return { subtotal, iva, envio, total };
  }, [items]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del carrito</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between gap-4">
              <div>
                <p className="font-semibold text-base text-foreground">
                  {item.nombre}
                </p>
                <p className="text-muted-foreground">
                  Cantidad: {item.cantidad}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-base text-foreground">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-muted-foreground">
              Tu carrito está vacío.
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Total productos:</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>IVA (aprox):</span>
            <span className="font-semibold">${iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío:</span>
            <span className="font-semibold">${envio.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-base font-semibold">
          <span>Total a pagar:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
