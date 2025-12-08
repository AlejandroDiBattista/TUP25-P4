"use client";

import { useState } from "react";
import DatosEnvio from "@/components/DatosEnvio";
import ResumenCarrito from "@/components/ResumenCarrito";
import { finalizarCompra } from "../services/compras";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onConfirmar({
    direccion,
    tarjeta,
  }: {
    direccion: string;
    tarjeta: string;
  }) {
    try {
      setLoading(true);
      const usuarioId =
        typeof window !== "undefined"
          ? localStorage.getItem("usuarioId")
          : null;
      if (!usuarioId) throw new Error("Inicia sesión para comprar");
      const data = await finalizarCompra(usuarioId, direccion, tarjeta);
      Swal.fire({
        icon: "success",
        title: "Compra realizada",
        text: `Total: $${data.total.toFixed(2)}`,
      }).then(() => {
        router.push(`/compras/${data.compra_id}`);
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "No se pudo finalizar",
        text: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <ResumenCarrito />
        </div>
        <aside className="h-full lg:sticky lg:top-24">
          <DatosEnvio onConfirmar={onConfirmar} loading={loading} />
        </aside>
      </div>
    </div>
  );
}
