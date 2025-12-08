'use client';

import { useMemo, useState } from 'react';
import type { Producto } from '@/app/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductoCard from '@/components/ui/ProductoCard';

type Props = {
  productos: Producto[];
};

// helpers
const nombreProd = (p: Producto) => (p.nombre ?? p.titulo ?? '').toString();
const descripcionProd = (p: Producto) => (p.descripcion ?? '').toString();
const catProd = (p: Producto) => (p.categoria ?? '').toString().trim();

export default function ProductosGrid({ productos }: Props) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('todas');

  const categorias = useMemo(() => {
    const set = new Set<string>();
    productos.forEach(p => {
      const c = catProd(p);
      if (c) set.add(c);
    });
    const lista = Array.from(set).sort((a, b) => a.localeCompare(b));
    return ['todas', ...lista];
  }, [productos]);

  const filtrados = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return productos.filter(p => {
      const c = catProd(p).toLowerCase();
      const catOk = cat === 'todas' || c === cat.toLowerCase();
      const txt = `${nombreProd(p)} ${descripcionProd(p)}`.toLowerCase();
      const qOk = ql === '' || txt.includes(ql);
      return catOk && qOk;
    });
  }, [productos, q, cat]);

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex-1 flex items-center gap-2">
          <Input
            placeholder="Buscar productos..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button variant="secondary" onClick={() => setQ('')}>Limpiar</Button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="cat" className="text-sm text-muted-foreground">Categoría</label>
          <select
            id="cat"
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            {categorias.map((c) => {
              const label = c ? c[0].toUpperCase() + c.slice(1) : 'Todas';
              return (
                <option key={c || 'todas'} value={c || 'todas'}>
                  {c === 'todas' ? 'Todas' : label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Info */}
      <p className="text-sm text-muted-foreground">
        {filtrados.length} de {productos.length} productos
      </p>

      {/* Grilla */}
      {filtrados.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          No se encontraron productos con esos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
          {filtrados.map((p) => (
            <div key={p.id}>
              <ProductoCard producto={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}