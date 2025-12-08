"use client";

import { Producto } from "../types";
import { useCarrito } from "@/app/components/CarritoContext";
import Image from "next/image";

interface ProductoCardProps {
  producto: Producto;
  onAgregar: (producto: Producto) => void;
}

export default function ProductoCard({ producto, onAgregar }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { cartItems } = useCarrito();

   const handleAgregar = () => {
    // Ver cuántos de este producto ya están en el carrito
    const itemEnCarrito = cartItems.find((item) => item.id === producto.id);
    const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;

    // Si ya no hay más stock disponible, mostramos alerta
    if (cantidadEnCarrito >= producto.existencia) {
      alert("No hay más stock disponible de este producto");
      return;
    }

    // Si todavía hay stock, lo agregamos
    onAgregar(producto);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex items-start gap-4 p-4">
      <div className="relative w-40 h-40 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={`${API_URL}/${producto.imagen.replace(/^\/+/, '')}`}
          alt={producto.titulo}
          fill
          sizes="160px"
          className="object-contain p-2"
          unoptimized
        />
      </div>

      <div className="flex justify-between w-full">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{producto.titulo}</h3>
          <p className="text-sm text-gray-600 mb-2">{producto.descripcion}</p>
          <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
            {producto.categoria}
          </p>
        </div>

        <div className="flex flex-col items-end justify-start">
          <span className="text-xl font-bold text-black mb-1">${producto.precio}</span>
          <span className="text-xs text-gray-500 mb-2">Stock: {producto.existencia}</span>
            <button
              onClick={handleAgregar}
              disabled={producto.existencia === 0}
              className={`px-4 py-2 rounded-lg mt-3 transition-colors ${
                producto.existencia === 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
               }`}
            >
              {producto.existencia === 0 ? "Agotado" : "Agregar al carrito"}
          </button>

        </div>
      </div>
    </div>
  );
}
