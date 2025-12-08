'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerProductos, obtenerCategorias } from '../services/productos';
import type { Producto } from '../types';
import ProductoListItem from './ProductoListItem';

export default function ProductosBrowser() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState<'todas' | string>('todas');

  const [categorias, setCategorias] = useState<string[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const [refreshTick, setRefreshTick] = useState(0);

  // Escuchar eventos globales para refrescar la lista cuando cambia stock o carrito
  useEffect(() => {
    const onStock = () => setRefreshTick((n) => n + 1);
    const onCart = () => setRefreshTick((n) => n + 1);

    if (typeof window !== 'undefined') {
      window.addEventListener('stock:changed', onStock as EventListener);
      window.addEventListener('cart:updated', onCart as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('stock:changed', onStock as EventListener);
        window.removeEventListener('cart:updated', onCart as EventListener);
      }
    };
  }, []);

  // Cargar categorías una vez
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        setLoadingCategorias(true);
        const cats = await obtenerCategorias();
        if (!cancelado) setCategorias(cats);
      } catch {
        
      } finally {
        if (!cancelado) setLoadingCategorias(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  // Buscar productos con debounce 
  useEffect(() => {
    let cancelado = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerProductos({
          search: search.trim() || undefined,
          categoria: categoria === 'todas' ? undefined : categoria,
        });
        if (!cancelado) setProductos(data);
      } catch (err: any) {
        if (!cancelado) {
          setError(err?.message ?? 'Ocurrió un error al cargar productos');
          setProductos([]);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    const t = setTimeout(fetchData, 250); // debounce
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [search, categoria, refreshTick]); // 👈 incluir refreshTick

  const opcionesCategorias = useMemo(() => {
    const base = ['todas', ...categorias];
    return Array.from(new Set(base));
  }, [categorias]);

  // Actualización optimista: cuando se agrega un producto, bajamos existencia local
  function handleAdded(id: number) {
    setProductos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, existencia: Math.max(0, (p.existencia ?? 0) - 1) } : p
      )
    );
  }

  return (
    <div className="w-full">
      {/* Fila de filtros (coincide con la altura del placeholder del panel) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px] mb-4">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="w-full rounded-md border border-gray-300 bg-white px-10 py-2 outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-600"
            aria-label="Buscar productos"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
          aria-label="Filtrar por categoría"
        >
          {opcionesCategorias.map((c) => (
            <option key={c} value={c}>
              {c === 'todas' ? 'Todas las categorías' : c}
            </option>
          ))}
          {loadingCategorias && <option disabled>Cargando categorías…</option>}
        </select>
      </div>

      {/* Lista de productos */}
      <div className="space-y-4">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : loading ? (
          <p className="text-gray-500">Cargando productos…</p>
        ) : productos.length === 0 ? (
          <p className="text-gray-500">No se encontraron productos.</p>
        ) : (
          productos.map((p) => (
            <ProductoListItem key={p.id} producto={p} onAdd={handleAdded} />
          ))
        )}
      </div>
    </div>
  );
}
