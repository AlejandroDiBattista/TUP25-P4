"use client";

import Image from "next/image";
import { useState } from "react";
import { getAuthHeaders } from "../services/auth";
import { Producto } from "../types";

interface ProductoCardProps {
  producto: Producto;
  autenticado?: boolean;
  cantidadEnCarrito?: number;
  onAgregado?: () => void;
}

export default function ProductoCard({
  producto,
  autenticado = false,
  cantidadEnCarrito = 0,
  onAgregado,
}: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const stockRestante = producto.existencia - cantidadEnCarrito;
  const sinStock = stockRestante <= 0;
  const titulo = producto.titulo ?? producto.nombre ?? "";

  const agregarAlCarrito = async () => {
    if (!autenticado) {
      setMensaje("Debes iniciar sesión");
      setTimeout(() => setMensaje(""), 2000);
      return;
    }

    if (sinStock) {
      setMensaje("Sin stock");
      setTimeout(() => setMensaje(""), 2000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/carrito/agregar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          producto_id: producto.id,
          cantidad: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al agregar al carrito");
      }

      setMensaje("✓ Agregado");
      onAgregado?.();
      setTimeout(() => setMensaje(""), 2000);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      setMensaje("Error");
      setTimeout(() => setMensaje(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="relative h-64 bg-gray-100">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={`${titulo} - ${producto.categoria}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          loading="eager"
          priority
          unoptimized
        />
      </div>
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 min-h-16">
          {titulo}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-16">
          {producto.descripcion}
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {producto.categoria}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-700">{producto.valoracion}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-blue-600">
            ${producto.precio}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {producto.existencia}
          </span>
        </div>

        {/* Botón de agregar al carrito */}
        <div className="mt-auto pt-2">
          <button
            onClick={agregarAlCarrito}
            disabled={loading || sinStock}
            className="btn-primary w-full text-sm"
          >
            {mensaje ||
              (loading
                ? "Agregando..."
                : sinStock
                ? "Sin stock"
                : `Agregar (${stockRestante} disp.)`)}
          </button>
        </div>
      </div>
    </div>
  );
}
