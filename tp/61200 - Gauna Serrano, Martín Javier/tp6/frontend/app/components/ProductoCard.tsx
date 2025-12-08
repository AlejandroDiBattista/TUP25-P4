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
        headers: getAuthHeaders(),
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
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border">
      
      {/* Imagen */}
      <div className="relative h-60 bg-gray-100 flex items-center justify-center">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={`${titulo} - ${producto.categoria}`}
          fill
          sizes="100%"
          className="object-contain p-6"
          unoptimized
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-12">
          {titulo}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-12">
          {producto.descripcion}
        </p>

        <div className="flex justify-between items-center mb-3">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {producto.categoria}
          </span>

          <span className="flex items-center text-yellow-500 text-sm">
            ★ <span className="text-gray-700 ml-1">{producto.valoracion}</span>
          </span>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-red-600">
            ${producto.precio}
          </span>
          <span className="text-xs text-gray-500">
            Stock: {producto.existencia}
          </span>
        </div>

        <button
          onClick={agregarAlCarrito}
          disabled={loading || sinStock}
          className={`w-full py-2 rounded-lg text-white font-semibold transition-all ${
            sinStock
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-900"
          }`}
        >
          {mensaje
            ? mensaje
            : loading
            ? "Agregando..."
            : sinStock
            ? "Sin stock"
            : `Agregar (${stockRestante} disp.)`}
        </button>
      </div>
    </div>
  );
}
