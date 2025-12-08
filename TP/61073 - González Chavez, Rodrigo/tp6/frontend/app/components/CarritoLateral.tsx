"use client";

import { useCarritoStore } from "../store/useCarritoStore";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CarritoLateral() {
  const {
    productos,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    cancelarCarrito,
    subtotal,
    iva,
    envio,
    total,
  } = useCarritoStore();

  const { token } = useAuthStore();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleFinalizarCarrito = async () => {
    if (!token) {
      toast.error("Debes iniciar sesión para finalizar la compra");
      router.push("/login");
      return;
    }

    router.push("/finalizar-compra");
  };

  const handleCancelarCarrito = async () => {
    try {
      await cancelarCarrito();
      toast.success("Carrito cancelado correctamente");
    } catch (error: any) {
      toast.error(error.message || "No se pudo cancelar el carrito");
    }
  };

  return (
    <aside className="bg-white border rounded-lg shadow-sm p-4 min-w-[320px] h-fit sticky top-24">
      {!token ? (
        <p className="text-sm text-gray-500 text-center">
          Inicia sesión para ver y editar tu carrito.
        </p>
      ) : productos.length === 0 ? (
        <p className="text-sm text-gray-500 text-center">
          Agrega productos a tu carrito.
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {productos.map((p) => (
              <div
                key={p.producto_id}
                className="flex items-center gap-3 border-b pb-2"
              >
                <div className="relative w-12 h-12">
                  <Image
                    src={`${API_URL}/imagenes/${p.imagen}`}
                    alt={p.nombre || "Imágen del producto"}
                    fill
                    unoptimized
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-500">
                    ${p.precio.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => disminuirCantidad(p.producto_id)}
                    >
                      -
                    </Button>
                    <span>{p.cantidad}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => aumentarCantidad(p.producto_id)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-semibold">
                  ${(p.precio * p.cantidad).toFixed(2)}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => eliminarProducto(p.producto_id)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar producto"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA</span>
              <span>${iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>${envio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleCancelarCarrito}>
              Cancelar
            </Button>
            <Button
              className="bg-gray-800 hover:bg-gray-950"
              onClick={handleFinalizarCarrito}
              disabled={productos.length === 0}
            >
              Continuar compra
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}
