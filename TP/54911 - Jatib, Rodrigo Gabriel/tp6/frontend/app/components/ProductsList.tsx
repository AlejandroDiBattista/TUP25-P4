"use client";
import React, { useEffect, useMemo, useState } from 'react';
import ProductoCard from './ProductoCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function ProductsList() {
  const [productos, setProductos] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      const candidates = [API_URL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8001'];
      let success = false;
      for (const base of candidates) {
        const url = `${String(base).replace(/\/$/, '')}/productos`;
        try {
          const resp = await fetch(url, { signal: controller.signal });
          if (!resp.ok) {
            console.warn('Productos response not ok', url, resp.status);
            continue;
          }
          const data = await resp.json();
          if (mounted) setProductos(data || []);
          success = true;
          break;
        } catch (err) {
          const e: any = err;
          if (e && e.name === 'AbortError') break;
          console.warn('Fetch failed for', url, e && e.message ? e.message : e);
          continue;
        }
      }
      if (!success && mounted) setProductos([]);
      if (mounted) setLoading(false);
    };
    load();
    return () => { mounted = false; controller.abort(); };
  }, []);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    productos.forEach(p => { if (p.categoria) set.add(p.categoria); });
    return Array.from(set).sort();
  }, [productos]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return productos.filter(p => {
      if (categoria && p.categoria !== categoria) return false;
      if (!term) return true;
      return (p.nombre || p.titulo || '').toString().toLowerCase().includes(term)
        || (p.descripcion || '').toString().toLowerCase().includes(term);
    });
  }, [productos, q, categoria]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex gap-3">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-1 border rounded px-3 py-2"
          />

          <select value={categoria} onChange={e => setCategoria(e.target.value)} className="border rounded px-3 py-2">
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button onClick={() => { setQ(''); setCategoria(''); }} className="px-3 py-2 border rounded">Limpiar</button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-2">
        {loading ? (
          <div className="text-center text-gray-600">Cargando productos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(p => <ProductoCard key={p.id} producto={p} />)}
          </div>
        )}
      </main>
    </div>
  );
}
