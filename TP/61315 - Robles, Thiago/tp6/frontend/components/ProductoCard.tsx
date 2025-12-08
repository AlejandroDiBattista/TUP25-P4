"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ShoppingCart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Producto } from "@/app/types";
import {
  agregarProductoAlCarrito,
  obtenerCarrito,
} from "@/app/services/carritos";

import Swal from "sweetalert2";

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const formatearPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });

  const imagenBase = producto.imagen || "imagenes/placeholder-producto.svg";
  const relativePath = imagenBase.includes("/")
    ? imagenBase
    : `imagenes/${imagenBase}`;
  const imageSrc = imagenBase.startsWith("http")
    ? imagenBase
    : `${API_URL}/${relativePath.replace(/^\//, "")}`;

  // Cantidad de este producto presente en el carrito actual
  const [enCarrito, setEnCarrito] = useState<number>(0);

  // Disponible = stock base del producto - cantidad que ya está en el carrito
  const disponible = Math.max((producto.existencia ?? 0) - enCarrito, 0);

  // Carga inicial y suscripción a cambios del carrito
  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      try {
        const data = await obtenerCarrito();
        const item = data.productos?.find((p) => p.producto_id === producto.id);
        if (!cancelado) setEnCarrito(item?.cantidad ?? 0);
      } catch {
        if (!cancelado) setEnCarrito(0);
      }
    };
    cargar();
    const handler = () => cargar();
    window.addEventListener("cart:changed", handler);
    return () => {
      cancelado = true;
      window.removeEventListener("cart:changed", handler);
    };
  }, [producto.id]);

  const tieneToken =
    typeof window !== "undefined" && !!localStorage.getItem("token");
  const puedeAgregar = disponible > 0 && tieneToken;

  async function onAgregar() {
    try {
      const usuarioId =
        typeof window !== "undefined"
          ? localStorage.getItem("usuarioId")
          : null;
      if (!usuarioId) {
        Swal.fire({
          icon: "warning",
          title: "Inicia sesión",
          text: "Necesitas iniciar sesión para agregar productos.",
        });
        return;
      }

      // Validar stock antes de intentar
      if (disponible <= 0) {
        Swal.fire({
          icon: "info",
          title: "Sin stock",
          text: "Este producto está agotado.",
        });
        return;
      }

      await agregarProductoAlCarrito(producto.id!, 1);
      // Optimista: reflejar al instante
      setEnCarrito((n) => n + 1);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:changed"));
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo agregar al carrito.",
      });
    }
  }

  return (
    <Card className="mt-3 overflow-hidden border-border/50 bg-card shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-stretch">
        <div className="relative h-36 w-full overflow-hidden rounded-md bg-muted/40 sm:h-auto sm:w-40">
          <Image
            src={imageSrc}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain"
            unoptimized
          />
        </div>

        <CardContent className="flex flex-1 flex-col gap-4 p-0 sm:flex-row sm:gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-1 font-medium uppercase tracking-wide">
                {producto.categoria}
              </span>
              <Separator
                orientation="vertical"
                className="hidden h-4 sm:block"
              />
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground"></span>
              </div>
              <Separator
                orientation="vertical"
                className="hidden h-4 sm:block"
              />
              <span>Stock total: {disponible}</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold leading-tight text-foreground">
                {producto.nombre}
              </h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {producto.descripcion}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between gap-3 sm:min-w-48">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Precio
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatearPrecio.format(producto.precio)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  disponible
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {disponible ? `Stock: ${disponible}` : "Agotado"}
              </span>

              <Button
                disabled={!puedeAgregar}
                onClick={onAgregar}
                title={!tieneToken ? "Inicia sesión para comprar" : undefined}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
