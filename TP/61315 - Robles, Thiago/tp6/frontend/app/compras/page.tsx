"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { obtenerCompras } from "../services/compras";

type Row = { id: number; fecha: string; total: number; envio: string };

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const usuarioId =
          typeof window !== "undefined"
            ? localStorage.getItem("usuarioId")
            : null;
        if (!usuarioId) return;
        const compras = await obtenerCompras(usuarioId);
        setRows(
          compras.map((c) => ({
            id: c.id,
            fecha: c.fecha,
            total: c.total,
            envio: c.envio,
          }))
        );
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Mis compras</h2>
      {error && <p className="text-red-600">{error}</p>}
      {rows.length === 0 ? (
        <p className="text-muted-foreground">No hay compras todavía.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded border p-3 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">Compra #{r.id}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(r.fecha).toLocaleString()} • Envío: ${r.envio}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">${r.total.toFixed(2)}</span>
                <Link
                  className="text-primary underline"
                  href={`/compras/${r.id}`}
                >
                  Ver detalle
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
