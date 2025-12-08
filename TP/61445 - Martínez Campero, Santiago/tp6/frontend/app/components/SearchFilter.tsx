'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SearchFilterProps {
  categorias: string[];
}

export default function SearchFilter({ categorias }: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [buscar, setBuscar] = useState(searchParams.get('buscar') || '');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '');
  const [ordenar, setOrdenar] = useState(searchParams.get('ordenar') || 'nombre');
  const [precioMin, setPrecioMin] = useState(searchParams.get('precioMin') || '');
  const [precioMax, setPrecioMax] = useState(searchParams.get('precioMax') || '');

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (buscar) params.append('buscar', buscar);
    if (categoria) params.append('categoria', categoria);
    if (ordenar && ordenar !== 'nombre') params.append('ordenar', ordenar);
    if (precioMin) params.append('precioMin', precioMin);
    if (precioMax) params.append('precioMax', precioMax);

    router.push(`/productos?${params.toString()}`);
  };

  const handleLimpiar = () => {
    setBuscar('');
    setCategoria('');
    setOrdenar('nombre');
    setPrecioMin('');
    setPrecioMax('');
    router.push('/productos');
  };

  const handleOrdenarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoOrdenar = e.target.value;
    setOrdenar(nuevoOrdenar);
    
    // Ejecutar búsqueda automáticamente cuando cambia el ordenamiento
    const params = new URLSearchParams();
    if (buscar) params.append('buscar', buscar);
    if (categoria) params.append('categoria', categoria);
    if (nuevoOrdenar && nuevoOrdenar !== 'nombre') params.append('ordenar', nuevoOrdenar);
    if (precioMin) params.append('precioMin', precioMin);
    if (precioMax) params.append('precioMax', precioMax);

    router.push(`/productos?${params.toString()}`);
  };

  const handlePrecioChange = () => {
    // Ejecutar búsqueda automáticamente cuando cambian los precios
    const params = new URLSearchParams();
    if (buscar) params.append('buscar', buscar);
    if (categoria) params.append('categoria', categoria);
    if (ordenar && ordenar !== 'nombre') params.append('ordenar', ordenar);
    if (precioMin) params.append('precioMin', precioMin);
    if (precioMax) params.append('precioMax', precioMax);

    router.push(`/productos?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar y Filtrar</h2>

      <form onSubmit={handleBuscar} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda por nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filtro por categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por precio mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Mínimo
            </label>
            <input
              type="number"
              placeholder="$0"
              value={precioMin}
              onChange={(e) => {
                setPrecioMin(e.target.value);
              }}
              onBlur={handlePrecioChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filtro por precio máximo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Máximo
            </label>
            <input
              type="number"
              placeholder="$10000"
              value={precioMax}
              onChange={(e) => {
                setPrecioMax(e.target.value);
              }}
              onBlur={handlePrecioChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={ordenar}
              onChange={handleOrdenarChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="nombre">Nombre (A-Z)</option>
              <option value="precio-asc">Precio (Menor a Mayor)</option>
              <option value="precio-desc">Precio (Mayor a Menor)</option>
              <option value="valoracion">Mejor Valorado</option>
            </select>
          </div>
        </div>

        {/* Botones de búsqueda */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            Buscar
          </Button>
          <Button
            type="button"
            onClick={handleLimpiar}
            variant="outline"
          >
            Limpiar Filtros
          </Button>
        </div>

        {/* Tags de filtros activos */}
        {(buscar || categoria || (ordenar && ordenar !== 'nombre') || precioMin || precioMax) && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {buscar && (
              <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Búsqueda: {buscar}
                <button
                  type="button"
                  onClick={() => setBuscar('')}
                  className="font-bold hover:text-blue-900"
                >
                  ✕
                </button>
              </span>
            )}
            {categoria && (
              <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Categoría: {categoria}
                <button
                  type="button"
                  onClick={() => setCategoria('')}
                  className="font-bold hover:text-green-900"
                >
                  ✕
                </button>
              </span>
            )}
            {ordenar && ordenar !== 'nombre' && (
              <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                Ordenar: {ordenar}
                <button
                  type="button"
                  onClick={() => setOrdenar('nombre')}
                  className="font-bold hover:text-purple-900"
                >
                  ✕
                </button>
              </span>
            )}
            {(precioMin || precioMax) && (
              <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                Precio: ${precioMin || '0'} - ${precioMax || '∞'}
                <button
                  type="button"
                  onClick={() => {
                    setPrecioMin('');
                    setPrecioMax('');
                  }}
                  className="font-bold hover:text-orange-900"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
