"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Producto } from "../types";
import { useAuthStore } from "../store/useAuthStore";
import { useCarritoStore } from "../store/useCarritoStore";

interface Props {
  producto: Producto;
}

export default function ProductoCard({ producto }: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { token } = useAuthStore();
  const { agregarProducto } = useCarritoStore();

  const handleAgregar = async () => {
    if (!token) {
      toast.error("Inicia sesión para agregar productos al carrito");
      return;
    }

    try {
      await agregarProducto(producto.id);
      toast.success(`"${producto.nombre}" agregado al carrito`);
    } catch (error: any) {
      toast.error(
        error.message || "No se pudo agregar el producto al carrito"
      );
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 flex flex-col sm:flex-row items-center gap-4 hover:shadow-md transition-shadow">
      <div className="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-md">
        <Image
          src={`${API_URL}/imagenes/${producto.imagen}`}
          alt={producto.nombre || "Imágen del producto"}
          fill
          unoptimized
          className="object-contain p-4"
        />
      </div>

      <div className="flex-1 space-y-1 text-center sm:text-left">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
          {producto.nombre}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {producto.descripcion}
        </p>
        <p className="text-xs text-gray-400">
          Categoría: {producto.categoria}
        </p>
        <div className="flex justify-center sm:justify-start items-center gap-1">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-sm text-gray-600">
            {producto.valoracion || "0.0"}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <p className="font-semibold text-lg text-gray-800">
          ${producto.precio.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">
          Stock: {producto.existencia}
        </p>
        <Button
          onClick={handleAgregar}
          disabled={producto.existencia === 0}
          className="bg-gray-800 hover:bg-gray-950 text-white transition-colors"
        >
          {producto.existencia === 0 ? "Agotado" : "Agregar al carrito"}
        </Button>
      </div>
    </div>
  );
}
