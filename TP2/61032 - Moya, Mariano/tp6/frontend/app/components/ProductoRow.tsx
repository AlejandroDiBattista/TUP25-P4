import Image from "next/image";
import { Producto } from "../types";
import { useState } from "react";
import { Button } from "../../components/ui/button";

interface ProductoRowProps {
  producto: Producto;
  onAdd: (id: number) => void;
  isLogged?: boolean;
}

export default function ProductoRow({ producto, onAdd, isLogged = false }: ProductoRowProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // Stock visual local: no impacta backend
  const [visualStock, setVisualStock] = useState(producto.existencia);
  const agotado = visualStock <= 0;

  // Solo visual: no sincroniza con backend; se reinicia al recargar

  return (
    <div className="flex items-start justify-between bg-white border rounded-md p-4 shadow-sm">
      {/* Izquierda: imagen + datos */}
      <div className="flex gap-4">
        <div className="relative w-28 h-28 bg-gray-100 rounded overflow-hidden">
          <Image
            src={`${API_URL}/${producto.imagen}`}
            alt={producto.titulo}
            fill
            className="object-contain"
            sizes="112px"
            unoptimized
          />
        </div>
        <div className="max-w-xl">
          <h3 className="font-semibold text-gray-900 leading-5">{producto.titulo}</h3>
          <p className="text-sm text-gray-800 mt-1 line-clamp-2">{producto.descripcion}</p>
          <div className="text-xs text-gray-800 mt-2">Categoría: {producto.categoria}</div>
        </div>
      </div>

      {/* Derecha: precio, stock y botón */}
      <div className="flex flex-col items-end gap-3 min-w-[180px]">
        <div className="text-gray-900 font-semibold">${producto.precio.toFixed(2)}</div>
        <div className="text-xs text-gray-900">Disponible: {visualStock}</div>
        <Button
          className={`${agotado || !isLogged ? "bg-gray-200 text-gray-900 hover:bg-gray-200" : ""}`}
          onClick={() => {
            if (agotado || !isLogged) return;
            onAdd(producto.id);
            setVisualStock(s => (s > 0 ? s - 1 : 0));
          }}
          disabled={agotado || !isLogged}
        >
          {agotado ? "Agotado" : isLogged ? "Agregar al carrito" : "Ingresá para comprar"}
        </Button>
      </div>
    </div>
  );
}
