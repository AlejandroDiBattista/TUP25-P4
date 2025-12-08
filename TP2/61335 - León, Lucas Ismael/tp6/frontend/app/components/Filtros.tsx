"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const CATEGORIAS = [
  { label: 'Todas las categorías', value: '' },
  { label: 'Electrónica', value: 'Electrónica' },
  { label: 'Joyería', value: 'Joyería' },
  { label: 'Ropa de hombre', value: 'Ropa de hombre' },
  { label: 'Ropa de mujer', value: 'Ropa de mujer' },
];

export default function Filtros() {
  const router = useRouter();
  const sp = useSearchParams();
  const [buscar, setBuscar] = useState(sp.get('buscar') || '');
  const [categoria, setCategoria] = useState(sp.get('categoria') || '');

  function pushParams(nextBuscar: string, nextCategoria: string) {
    const params = new URLSearchParams();
    if (nextBuscar) params.set('buscar', nextBuscar);
    if (nextCategoria) params.set('categoria', nextCategoria);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams(buscar.trim(), categoria);
  }

  function onChangeCategoria(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setCategoria(next);
    // Cambio inmediato en la URL al seleccionar categoría
    pushParams(buscar.trim(), next);
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3">
      <div className="flex-1">
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar..."
        />
      </div>
      <select
        value={categoria}
        onChange={onChangeCategoria}
        className="border rounded px-3 py-2 text-sm min-w-[200px]"
      >
        {CATEGORIAS.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
    </form>
  );
}
