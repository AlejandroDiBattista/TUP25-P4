"use client";
import React, { useEffect, useState } from "react";

interface CompraResumen {
  id: number;
  fecha: string;
  total: number;
  envio: number;
  direccion: string;
}

interface CompraDetalle extends CompraResumen {
  items: { producto_id: number; nombre: string; cantidad: number; precio_unitario: number }[];
  tarjeta?: string;
}

export default function ComprasUnifiedPage() {
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [seleccion, setSeleccion] = useState<CompraDetalle | null>(null);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setCargandoLista(false); return; }
    (async () => {
      try {
        const res = await fetch("http://localhost:8000/compras", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Error obteniendo compras");
        const data = await res.json();
        setCompras(data);
        // Auto-seleccionar primera compra si existe
        if (data.length > 0) cargarDetalle(token, data[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setCargandoLista(false);
      }
    })();
  }, []);

  const cargarDetalle = async (token: string, id: number) => {
    setCargandoDetalle(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/compras/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Error obteniendo detalle");
      const data = await res.json();
      setSeleccion(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Mis compras</h1>
      {error && <div className="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white border border-gray-300 rounded-xl shadow-sm p-4 space-y-3">
          {cargandoLista ? (
            <div className="text-sm text-gray-600">Cargando compras...</div>
          ) : compras.length === 0 ? (
            <div className="text-sm text-gray-900">No hay compras.</div>
          ) : (
            compras.map(c => {
              const activa = seleccion?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => token && cargarDetalle(token, c.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition ${activa ? "bg-gray-50 border-gray-300" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="text-sm font-medium text-gray-900">Compra #{c.id}</div>
                  <div className="text-xs text-gray-500">{c.fecha}</div>
                  <div className="text-xs text-gray-500">Total: ${c.total}</div>
                </button>
              );
            })
          )}
        </div>
        <div className="md:col-span-2 bg-white border border-gray-300 rounded-xl shadow-sm p-6">
          {cargandoDetalle && <div className="text-sm text-gray-600">Cargando detalle...</div>}
          {!cargandoDetalle && seleccion && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Detalle de la compra</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-4">
                <div><span className="font-medium">Compra #:</span> {seleccion.id}</div>
                <div><span className="font-medium">Fecha:</span> {seleccion.fecha}</div>
                <div><span className="font-medium">Dirección:</span> {seleccion.direccion}</div>
                <div><span className="font-medium">Envío:</span> ${seleccion.envio}</div>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Productos</h3>
              <div className="divide-y divide-gray-200 mb-4">
                {seleccion.items.map(it => {
                  const line = it.precio_unitario * it.cantidad;
                  const rate = (it.nombre || "").toLowerCase().includes("elect") ? 0.10 : 0.21; // heurística si se quisiera
                  const iva = line * rate;
                  return (
                    <div key={`${seleccion.id}-${it.producto_id}`} className="py-3 flex justify-between text-sm">
                      <div>
                        <div className="text-gray-900">{it.nombre}</div>
                        <div className="text-xs text-gray-500">Cantidad: {it.cantidad}</div>
                        <div className="text-xs text-gray-500">IVA: ${iva.toFixed(2)}</div>
                      </div>
                      <div className="text-gray-900">${(it.precio_unitario * it.cantidad).toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
              {seleccion && (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="text-gray-900">${seleccion.items.reduce((acc, it) => acc + it.precio_unitario * it.cantidad, 0).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Envío:</span><span className="text-gray-900">${seleccion.envio}</span></div>
                  <div className="pt-2 mt-2 border-t flex justify-between font-semibold"><span>Total pagado:</span><span>${seleccion.total}</span></div>
                </div>
              )}
            </div>
          )}
          {!cargandoDetalle && !seleccion && !error && (
            <div className="text-sm text-gray-600">Selecciona una compra para ver el detalle.</div>
          )}
        </div>
      </div>
    </div>
  );
}
