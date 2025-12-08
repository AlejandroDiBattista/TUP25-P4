"use client";
import { useState, FormEvent } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutPage() {
  const { data, checkout } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const compra = await checkout(direccion, tarjeta);
      toast("Compra realizada");
      // Redirigir a historial de compras
      router.push("/compras");
    } catch (err: any) {
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("autentic")) {
        toast("Falta iniciar sesión");
      } else {
        setError(err?.message || "No se pudo finalizar la compra");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-6">Finalizar compra</h1>
      {data && data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del carrito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {data.items.map((it, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{it.titulo ?? `#${it.producto_id}`}</div>
                      <div className="text-xs text-gray-500">Cantidad: {it.cantidad}</div>
                    </div>
                    <div className="text-sm font-medium">${(it.subtotal ?? it.cantidad * it.precio_unitario).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-700 space-y-1">
                <div className="flex justify-between"><span>Total productos:</span><span>${data.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>IVA:</span><span>${data.total_iva.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Envío:</span><span>${data.envio.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-indigo-600 text-base"><span>Total a pagar:</span><span>${data.total.toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datos de envío</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1">
                  <Label>Dirección</Label>
                  <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} required minLength={3} />
                </div>
                <div className="space-y-1">
                  <Label>Tarjeta</Label>
                  <Input value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} required minLength={4} />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button disabled={loading}>{loading ? "Procesando..." : "Confirmar compra"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-gray-600">Tu carrito está vacío.</p>
      )}
    </div>
  );
}
