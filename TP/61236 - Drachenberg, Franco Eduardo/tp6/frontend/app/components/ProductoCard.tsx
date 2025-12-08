'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Producto } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const nombre = producto.nombre ?? producto.titulo ?? "Producto sin nombre";
  const tieneImagen = Boolean(producto.imagen);
  const agotado = producto.existencia <= 0;
  const existencia = Math.max(producto.existencia, 0);
  const router = useRouter();
  const { usuario } = useAuth();
  const { addItem, isItemUpdating } = useCart();
  const botonDeshabilitado = agotado || isItemUpdating(producto.id);

  const manejarAgregar = () => {
    if (!usuario) {
      router.push("/iniciar-sesion");
      return;
    }
    startTransition(() => {
      addItem(producto.id).catch(() => {
        /* El contexto maneja el error mostrando feedback en el panel */
      });
    });
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-lg bg-slate-100 sm:w-28">
          {tieneImagen ? (
            <Image
              src={`${API_URL}/${producto.imagen}`}
              alt={nombre}
              width={96}
              height={96}
              className="h-20 w-20 object-contain"
              unoptimized
            />
          ) : (
            <span className="text-xs text-slate-500">Sin imagen</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="text-lg font-semibold text-slate-900">{nombre}</h3>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
            {producto.descripcion}
          </p>
          <span className="text-xs font-medium text-slate-500">
            Categoría: {producto.categoria}
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-3 sm:w-40 sm:items-end">
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <p className="text-2xl font-bold text-slate-900">
              ${producto.precio.toFixed(2)}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${agotado ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}
            >
              {agotado ? "Agotado" : "Disponible"}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Disponible: {existencia}
          </p>
          <Button
            variant={agotado ? "secondary" : "default"}
            className="w-full sm:w-auto"
            disabled={botonDeshabilitado}
            onClick={manejarAgregar}
          >
            {agotado ? "Sin stock" : isItemUpdating(producto.id) ? "Agregando..." : "Agregar al carrito"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
