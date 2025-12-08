"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { useCarritoStore } from "../store/useCarritoStore";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import ResumenCompra from "../components/ResumenCompra";

export default function FinalizarCompraPage() {
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const router = useRouter();
  const { token } = useAuthStore();
  const { productos, finalizarCompra } = useCarritoStore();

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!direccion.trim() || !tarjeta.trim()) {
      toast.error("Completa todos los campos antes de confirmar");
      return;
    }

    if (!token) {
      toast.error("Debes iniciar sesión para confirmar la compra");
      router.push("/login");
      return;
    }

    try {
      await finalizarCompra(direccion, tarjeta);
      toast.success("Compra realizada con éxito");
      router.push("/mis-compras")
    } catch (error: any) {
      console.error("Error al procesar la compra:", error);
      toast.error("Error al procesar la compra");
    }
  };

  if (productos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        No hay productos en el carrito.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-6xl">
        <ResumenCompra />
        <Card>
          <CardHeader>
            <CardTitle>Datos para el envío</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConfirmar} className="flex flex-col gap-4">
              <Input
                placeholder="Dirección de envío"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
              <Input
                placeholder="Número de tarjeta"
                value={tarjeta}
                onChange={(e) => setTarjeta(e.target.value)}
                maxLength={16}
                required
              />
              <div className="flex gap-3 justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2"
                  onClick={() => router.back()}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="w-1/2 bg-gray-800 hover:bg-gray-950 text-white"
                >
                  Confirmar Compra
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
