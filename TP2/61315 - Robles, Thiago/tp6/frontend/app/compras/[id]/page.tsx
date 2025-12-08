"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { obtenerCompraDetalle } from "../../services/compras";
import Link from "next/link";

export default function CompraDetallePage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  interface Item {
    id: number;
    compra_id: number;
    producto_id: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
  }
  interface CompraDetalle {
    id: number;
    usuario_id: number;
    fecha: string;
    direccion: string;
    tarjeta: string;
    estado?: string;
    total: number;
    envio: string | number;
    items?: Item[];
  }
  const [compra, setCompra] = useState<CompraDetalle | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await obtenerCompraDetalle(id);
        setCompra(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="p-4">Cargando compra...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!compra)
    return <p className="p-4 text-muted-foreground">No encontrada</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Compra #{compra.id}</h2>
        <Link href="/compras" className="text-primary underline">
          Volver
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Fecha:</span>{" "}
            {new Date(compra.fecha).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Dirección:</span> {compra.direccion}
          </p>
          <p>
            <span className="font-medium">Tarjeta:</span> {compra.tarjeta}
          </p>
          <p>
            <span className="font-medium">Estado:</span> {compra.estado}
          </p>
        </div>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Envío:</span> $
            {parseFloat(compra.envio).toFixed(2)}
          </p>
          <p>
            <span className="font-medium">Total:</span> $
            {compra.total.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Items</h3>
        <ul className="divide-y border rounded">
          {compra.items?.map((it: Item) => (
            <li key={it.id} className="flex justify-between p-2 text-sm">
              <span>
                {it.nombre} × {it.cantidad}
              </span>
              <span>${(it.precio_unitario * it.cantidad).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
