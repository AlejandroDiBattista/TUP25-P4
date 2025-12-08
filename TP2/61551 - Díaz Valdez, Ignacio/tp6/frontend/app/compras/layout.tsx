"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { obtenerCompras, type Compra } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ComprasLayout({ children }: { children: React.ReactNode }) {
  const [compras, setCompras] = useState<Compra[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await obtenerCompras();
        setCompras(data);
      } catch (e: any) {
        const msg = e?.message || "";
        setError(msg);
        if (msg.toLowerCase().includes("autentic")) toast("Falta iniciar sesión");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [toast]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-6">Mis compras</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="md:col-span-1">
          {loading && <p>Cargando...</p>}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && compras && compras.length === 0 && (
            <p className="text-gray-600">No hay compras registradas.</p>
          )}
          {!loading && compras && compras.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Listado</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {compras.map((c) => {
                    const href = `/compras/${c.id}`;
                    const active = pathname === href;
                    return (
                      <li key={c.id} className="border rounded p-3 flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium">Compra #{c.id}</div>
                          <div className="text-gray-600">{c.items.length} items</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">${c.total.toFixed(2)}</span>
                          <Button asChild size="sm" variant={active ? "outline" : "default"}>
                            <Link href={href}>Ver detalle</Link>
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </aside>

        <main className="md:col-span-2">{children}</main>
      </div>
    </div>
  );
}
