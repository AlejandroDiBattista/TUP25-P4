"use client";

import Image from "next/image";
import { Producto } from "../types";
import { Carrito } from "../services/productos";
import { useState } from "react";

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [loading, setLoading] = useState(false);

  const nombre = producto.nombre || "Producto";
  const descripcion = producto.descripcion || "Sin descripción disponible";
  const categoria = producto.categoria || "Sin categoría";
  const existencia = producto.existencia ?? 0;

  // Soporta ambos formatos:
  // - imagen: "imagenes/0001.png"  -> usa tal cual
  // - imagen: "0001.png"           -> prefix "/imagenes/"
  // - sin imagen                   -> fallback
  const imagenSrc = (() => {
    if (!producto.imagen) return `${API_URL}/imagenes/0001.png`;
    if (producto.imagen.startsWith("http")) return producto.imagen;
    if (producto.imagen.startsWith("imagenes/")) return `${API_URL}/${producto.imagen}`;
    return `${API_URL}/imagenes/${producto.imagen}`;
  })();

  const agotado = existencia <= 0;

  const handleAdd = async () => {
    setLoading(true);
    try {
      await Carrito.agregar(producto.id, 1);
      alert("Agregado al carrito");
    } catch (e) {
  const msg = e instanceof Error ? e.message : "Error al agregar";
  alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="relative h-64 bg-gray-100">
        <Image
          src={imagenSrc}
          alt={nombre}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          unoptimized
        />
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold line-clamp-2">{nombre}</h3>

        <p className="text-sm text-gray-600 line-clamp-2">{descripcion}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {categoria}
          </span>
          <span className="text-xs text-gray-500">Stock: {existencia}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            ${Number(producto.precio ?? 0).toFixed(2)}
          </span>

          <button
            className="btn disabled:opacity-50"
            onClick={handleAdd}
            disabled={agotado || loading}
          >
            {agotado ? "Agotado" : loading ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
