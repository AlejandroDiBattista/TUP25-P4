import React from "react";
import { Producto } from "../types";

interface CarritoItemProps {
  producto: Producto;
  cantidad: number;
  onRemove: () => void;
}

export default function CarritoItem({ producto, cantidad, onRemove }: CarritoItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <div className="font-semibold">{producto.titulo}</div>
        <div className="text-sm text-gray-900">Cantidad: {cantidad}</div>
        <div className="text-sm text-gray-900">Precio unitario: ${producto.precio}</div>
      </div>
      <button
        className="bg-red-500 text-white px-3 py-1 rounded"
        onClick={onRemove}
      >
        Quitar
      </button>
    </div>
  );
}
