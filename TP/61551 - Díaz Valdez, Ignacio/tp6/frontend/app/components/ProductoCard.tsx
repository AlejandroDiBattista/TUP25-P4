"use client";
import { Producto } from "@/app/types";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const { add } = useCart();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);

  const puedeComprar = (producto.existencia ?? 0) > 0;
  const handleAdd = async () => {
    if (!puedeComprar) return;
    try {
      setAdding(true);
      await add(producto.id, 1);
    } catch (e: any) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("autentic")) {
        // Mostrar mensaje sin redirigir
        toast("Falta iniciar sesión");
      } else {
        // eslint-disable-next-line no-console
        console.error(e);
        toast("No se pudo agregar al carrito");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow transition-shadow">
      <div className="relative h-56 bg-gray-50">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={producto.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          unoptimized
        />
      </div>
      <CardContent>
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">{producto.titulo}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{producto.descripcion}</p>
        <div className="flex items-center justify-between mb-2">
          <Badge>{producto.categoria}</Badge>
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <span className="text-yellow-500">★</span>
            <span>{producto.valoracion}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-indigo-600">${producto.precio}</span>
          <span className={puedeComprar ? "text-xs text-gray-500" : "text-xs text-red-600"}>
            {puedeComprar ? `Stock: ${producto.existencia}` : "Agotado"}
          </span>
        </div>
        <Button onClick={handleAdd} disabled={!puedeComprar || adding} className="w-full mt-3">
          {adding ? "Agregando..." : "Agregar al carrito"}
        </Button>
      </CardContent>
    </Card>
  );
}
