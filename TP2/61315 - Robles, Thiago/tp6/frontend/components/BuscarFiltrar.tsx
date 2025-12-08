'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const categorias : { value: string; label: string }[] = [
  { value: '', label: 'Todas las categorías' },
  { value: 'Ropa de hombre', label: 'Ropa de hombre' },
  { value: 'Ropa de mujer', label: 'Ropa de mujer' },
  { value: 'Electrónica', label: 'Electrónica' },
  { value: 'Joyería', label: 'Joyería' },
];

export default function BuscarFiltrar() {
  // router nos sirve para navegar programáticamente
  const router = useRouter();
  // Path name nos sirve para obtener la ruta actual
  const pathname = usePathname();
  // Search params nos sirve para obtener los parámetros de búsqueda actuales
  const searchParams = useSearchParams();
  // useTransition nos sirve para hacer transiciones de estado sin bloquear la UI
  const [isPending, startTransition] = useTransition();

  const [buscar, setBuscar] = useState(searchParams.get('buscar') ?? '');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') ?? '');

   useEffect(() => {
    const params = new URLSearchParams();
    if (buscar.trim()) params.set('buscar', buscar.trim());
    if (categoria) params.set('categoria', categoria);

    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) return;

    startTransition(() => {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    });
  }, [buscar, categoria, pathname, router, searchParams]);

  return (
    <div className="flex gap-3 items-center">
      <input
        className="w-full px-3 py-2 rounded-md border outline-none text-black"
        placeholder="Buscar..."
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
      />
      <select
        className="px-3 py-2 rounded-md border bg-white text-black outline-none"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        disabled={isPending}
      >
        {categorias.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}