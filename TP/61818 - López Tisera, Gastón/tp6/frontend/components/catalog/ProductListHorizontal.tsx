'use client';

import Image from "next/image";
import { useState } from "react";

import type { Producto } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

const ASSETS_BASE_URL =
  process.env.NEXT_PUBLIC_ASSETS_URL ?? "http://127.0.0.1:8000";

function buildImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${ASSETS_BASE_URL}/${path.replace(/^\//, "")}`;
}

interface ProductListHorizontalProps {
  productos: Producto[];
}

export function ProductListHorizontal({ productos }: ProductListHorizontalProps) {
  const { user } = useAuth();
  const { addItem, cart } = useCart();
  const [loading, setLoading] = useState<number | null>(null);

  const handleAddToCart = async (producto: Producto) => {
    if (!user) return;
    
    // Verificar stock disponible
    const cartItem = cart?.items.find((item) => item.producto_id === producto.id);
    const cantidadEnCarrito = cartItem?.cantidad ?? 0;
    const stockDisponible = producto.existencia - cantidadEnCarrito;
    
    if (stockDisponible <= 0) {
      return; // No agregar más si ya alcanzó el stock
    }
    
    setLoading(producto.id);
    try {
      await addItem({ producto_id: producto.id, cantidad: 1 });
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    } finally {
      setLoading(null);
    }
  };

  if (productos.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        No se encontraron productos
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {productos.map((producto) => {
        // Calcular stock disponible restando lo que está en el carrito
        const cartItem = cart?.items.find((item) => item.producto_id === producto.id);
        const cantidadEnCarrito = cartItem?.cantidad ?? 0;
        const stockDisponible = producto.existencia - cantidadEnCarrito;
        const agotado = stockDisponible <= 0;
        const imageUrl = buildImageUrl(producto.imagen);
        const isLoading = loading === producto.id;

        return (
          <article
            key={producto.id}
            className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            {/* Imagen */}
            <div className="relative h-32 w-32 flex-shrink-0">
              <Image
                src={imageUrl}
                alt={producto.titulo}
                width={128}
                height={128}
                className="h-full w-full object-contain"
                unoptimized
              />
              {agotado && (
                <span className="absolute left-0 top-0 rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                  Agotado
                </span>
              )}
            </div>

            {/* Información del producto */}
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {producto.titulo}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {producto.descripcion}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Categoría: {producto.categoria}
                </p>
              </div>
            </div>

            {/* Precio y acción */}
            <div className="flex flex-col items-end justify-between">
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  ${producto.precio.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">
                  Disponible: {stockDisponible}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddToCart(producto)}
                disabled={agotado || !user || isLoading}
                className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {agotado ? "Sin stock" : isLoading ? "Agregando..." : "Agregar al carrito"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

