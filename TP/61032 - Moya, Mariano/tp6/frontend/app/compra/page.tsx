"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Producto } from "../types";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

interface CarritoProducto {
  id: number;
  cantidad: number;
}

export default function CompraPage() {
  const [carrito, setCarrito] = useState<CarritoProducto[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [confirmacion, setConfirmacion] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Cargar productos
    fetch("http://localhost:8000/productos")
      .then(res => res.json())
      .then(setProductos);
    // Preferir carrito del backend si hay token; caso contrario usar localStorage
    const token = localStorage.getItem("token");
    (async () => {
      try {
        if (token) {
          const res = await fetch("http://localhost:8000/carrito", { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            type ApiItem = { id: number; cantidad: number };
            const list: CarritoProducto[] = (data.productos || []).map((p: ApiItem) => ({ id: p.id, cantidad: p.cantidad }));
            localStorage.setItem("carrito", JSON.stringify(list));
            setCarrito(list);
            return;
          }
        }
      } catch {}
      const carritoLS = JSON.parse(localStorage.getItem("carrito") || "[]");
      setCarrito(carritoLS);
    })();
  }, []);

  // Layout nuevo no incluye quitar ítems desde aquí – sólo resumen

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Debes iniciar sesión para comprar.");
      const res = await fetch("http://localhost:8000/carrito/finalizar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ direccion, tarjeta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.mensaje || "Error al finalizar compra");
      setConfirmacion(`Compra realizada con éxito. Total: $${data.total}`);
      setCarrito([]);
      localStorage.setItem("carrito", "[]");
      setTimeout(() => router.push("/compras"), 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido");
      }
    }
  };

  const productosEnCarrito = useMemo(() => (
    carrito
      .map(item => {
        const prod = productos.find(p => p.id === item.id);
        return prod ? { ...prod, cantidad: item.cantidad } : null;
      })
      .filter(Boolean) as (Producto & { cantidad: number })[]
  ), [carrito, productos]);

  const { totalProductos, ivaTotal, envio, totalPagar } = useMemo(() => {
    let subtotal = 0;
    let iva = 0;
    for (const p of productosEnCarrito) {
      const line = p.precio * p.cantidad;
      subtotal += line;
      const rate = (p.categoria || "").toLowerCase().startsWith("elect") ? 0.10 : 0.21;
      iva += line * rate;
    }
    const envioCalc = subtotal === 0 ? 0 : (subtotal > 1000 ? 0 : 50);
    return {
      totalProductos: subtotal,
      ivaTotal: iva,
      envio: envioCalc,
      totalPagar: subtotal + iva + envioCalc,
    };
  }, [productosEnCarrito]);

  const format = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Finalizar compra</h1>
      {confirmacion && (
        <div className="mb-4 rounded bg-green-50 border border-green-200 text-green-700 px-3 py-2">
          {confirmacion}
        </div>
      )}
      {productosEnCarrito.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-gray-900">El carrito está vacío.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-gray-300 rounded-xl shadow-sm p-6 outline outline-1 outline-gray-300">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Resumen del carrito</h3>
            <div className="divide-y divide-gray-200">
              {productosEnCarrito.map((p) => {
                const line = p.precio * p.cantidad;
                const rate = (p.categoria || "").toLowerCase().startsWith("elect") ? 0.10 : 0.21;
                const iva = line * rate;
                return (
                  <div key={`${p.id}-${p.cantidad}`} className="py-3 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{p.titulo}</div>
                      <div className="text-xs text-gray-500">Cantidad: {p.cantidad}</div>
                      <div className="text-xs text-gray-500">IVA: {format(iva)}</div>
                    </div>
                    <div className="text-sm text-gray-900">{format(line)}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Total productos:</span><span className="text-gray-900">{format(totalProductos)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">IVA:</span><span className="text-gray-900">{format(ivaTotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Envío:</span><span className="text-gray-900">{format(envio)}</span></div>
              <div className="pt-2 mt-2 border-t flex justify-between font-semibold"><span>Total a pagar:</span><span>{format(totalPagar)}</span></div>
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-6 outline outline-1 outline-gray-300">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Datos de envío</h3>
            <form onSubmit={handleFinalizar} className="space-y-4">
              <Input
                type="text"
                placeholder="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Tarjeta"
                value={tarjeta}
                maxLength={19}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const parts = digits.match(/.{1,4}/g) || [];
                  setTarjeta(parts.join(" "));
                }}
                required
              />
              {error && (
                <div className="rounded bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>
              )}
              <Button type="submit" className="w-full">Confirmar compra</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
