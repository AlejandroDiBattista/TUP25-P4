"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getToken } from '../services/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MisCompras() {
  const [loading, setLoading] = useState(true);
  const [compras, setCompras] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // avoid accessing localStorage during SSR; render a neutral placeholder first
    setMounted(true);
    if (!getToken()) {
      setLoading(false);
      return;
    }
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const token = getToken();
        const resp = await fetch(`${API_URL}/compras`, { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) throw new Error('Error al obtener compras');
        const data = await resp.json();
        if (alive) setCompras(data || []);
      } catch (e: any) {
        if (alive) setError(e.message || 'Error');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // check query param for last compra and auto-load its detail once mounted
  useEffect(() => {
    if (!mounted) return;
    const compra = searchParams?.get ? searchParams.get('compra') : null;
    if (compra) {
      const id = parseInt(compra, 10);
      if (!isNaN(id)) loadDetalle(id);
    }
  }, [searchParams, mounted]);

  async function loadDetalle(id: number) {
    try {
      const token = getToken();
      const resp = await fetch(`${API_URL}/compras/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) throw new Error('Error al obtener detalle');
      const data = await resp.json();
      setSelected(data);
    } catch (e: any) {
      setError(e.message || 'Error');
    }
  }

  // while mounting, render a neutral placeholder to avoid SSR/client mismatch
  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white border rounded p-6"> 
          <h2 className="text-xl font-semibold mb-2">Mis compras</h2>
          <div>Cargando...</div>
        </div>
      </div>
    );
  }

  if (!getToken()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border rounded p-6"> 
          <h2 className="text-xl font-semibold mb-2">Mis compras</h2>
          <p>Debes iniciar sesión para ver tus compras. <a href="/ingresar" className="text-blue-600 underline">Ingresar</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <h3 className="font-semibold mb-4">Compras</h3>
        {loading ? <div>Cargando...</div> : (
          <div className="flex flex-col gap-3">
            {compras.map((c) => (
              <button key={c.id} onClick={() => loadDetalle(c.id)} className="text-left border rounded p-3 hover:bg-gray-50"> 
                <div className="font-semibold">Compra #{c.id}</div>
                <div className="text-sm text-black">Total: ${c.total.toFixed(2)}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2 bg-white border rounded p-6">
        <h3 className="font-semibold mb-4">Detalle de la compra</h3>
        {selected ? (
          <div>
            <div className="mb-2">Compra #: {selected.compra.id}</div>
            <div className="mb-2">Fecha: {new Date(selected.compra.fecha).toLocaleString()}</div>
            <div className="mb-2">Dirección: {selected.compra.direccion}</div>
            <div className="mb-2">Tarjeta: {`****-****-****-${String(selected.compra.tarjeta).slice(-4)}`}</div>
            <div className="mb-4">Total: ${selected.compra.total.toFixed(2)}</div>
            <div>
              {selected.items.map((it: any) => (
                <div key={it.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-semibold">{it.nombre}</div>
                    <div className="text-sm text-black">Cantidad: {it.cantidad}</div>
                  </div>
                  <div className="font-bold">${(it.precio_unitario * it.cantidad).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>Selecciona una compra para ver su detalle.</div>
        )}
        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
      </div>
    </div>
  );
}
