"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { obtenerCompra, type Compra } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompraDetallePage() {
  const params = useParams<{ id: string }>();
  const compraId = Number(params?.id);
  const [compra, setCompra] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!compraId) return;
    const run = async () => {
      try {
        setLoading(true);
        const data = await obtenerCompra(compraId);
        setCompra(data);
      } catch (e: any) {
        const msg = e?.message || "";
        setError(msg);
        if (msg.toLowerCase().includes("autentic")) toast("Falta iniciar sesión");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [compraId, toast]);

  return (
    <div>
      <Card>
        <CardHeader className="flex items-center justify-between space-y-0">
          <CardTitle>Detalle de Compra</CardTitle>
          <Button asChild size="sm"><Link href="/compras">Volver</Link></Button>
        </CardHeader>
        <CardContent>
          {loading && <p>Cargando...</p>}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && compra && (
            <>
              <div className="mb-4 text-sm text-gray-700">
                <div className="flex justify-between"><span>Compra #</span><span>{compra.id}</span></div>
                <div className="flex justify-between font-semibold text-indigo-600"><span>Total</span><span>${compra.total.toFixed(2)}</span></div>
              </div>
              <div className="border rounded">
                <div className="grid grid-cols-4 gap-2 p-2 text-xs font-medium bg-gray-50">
                  <div>Producto</div>
                  <div className="text-right">Cantidad</div>
                  <div className="text-right">Precio</div>
                  <div className="text-right">Subtotal</div>
                </div>
                {compra.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 p-2 text-sm border-t">
                    <div>{it.titulo ?? `#${it.producto_id}`}</div>
                    <div className="text-right">{it.cantidad}</div>
                    <div className="text-right">${it.precio_unitario.toFixed(2)}</div>
                    <div className="text-right">${(it.subtotal ?? it.cantidad * it.precio_unitario).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
