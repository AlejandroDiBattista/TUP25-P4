"use client"
import { Producto } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductoCard({ producto }: { producto: Producto }) {
  const { agregarAlCarrito } = useCart()

  function imageUrl(imagen?: string) {
    if (!imagen) return "/no-image.png";
    if (imagen.startsWith("http://") || imagen.startsWith("https://")) return imagen;
    return `http://127.0.0.1:8000/imagenes/${imagen.replace(/^\/+/, "")}`;
  }

  const disponible = producto.existencia && producto.existencia > 0;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden border-pink-100 card-fancy rounded-2xl">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Imagen */}
          <div className="w-full sm:w-32 h-32 relative flex-shrink-0 bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
            <img
              src={imageUrl(producto.imagen)}
              alt={producto.nombre || "Producto"}
              className="w-full h-full object-contain p-2"
            />
          </div>

          {/* Contenido */}
          <div className="flex-1 p-4 sm:p-6 sm:pl-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {producto.nombre}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {producto.descripcion}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-100">
                    <Package className="h-3 w-3" />
                    {producto.categoria}
                  </span>
                </div>
              </div>

              {/* Precio y acciones */}
              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                <div className="flex-1 sm:flex-none">
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    ${producto.precio.toFixed(2)}
                  </p>
                  <p className={`text-xs font-medium mt-1 ${
                    disponible ? "text-green-600" : "text-red-600"
                  }`}>
                    {disponible 
                      ? `✓ Stock: ${producto.existencia}` 
                      : "✕ Agotado"}
                  </p>
                </div>
                
                <Button 
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  disabled={!disponible}
                  size="sm"
                    onClick={() => agregarAlCarrito(producto)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
