'use client';

import { useEffect, useState } from 'react';
import { obtenerProductos, obtenerCategorias } from './services/productos';
import ProductoCard from './components/ProductoCard';
import { Producto } from './types';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [productosData, categoriasData] = await Promise.all([
          obtenerProductos(),
          obtenerCategorias(),
        ]);
        setProductos(productosData);
        setProductosFiltrados(productosData);
        setCategorias(categoriasData || []);
      } catch (err) {
        const mensajeError = err instanceof Error ? err.message : 'Error desconocido';
        setError('No se pudo conectar con el servidor. Por favor, verifica que el backend esté corriendo en http://localhost:8000. Detalle: ' + mensajeError);
        console.error("Error cargando datos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    // Filtrar productos
    let filtrados = productos;

    // Filtrar por categoría
    if (categoriaSeleccionada) {
      filtrados = filtrados.filter(
        (p) => p.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
      );
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      filtrados = filtrados.filter(
        (p) =>
          p.titulo.toLowerCase().includes(termino) ||
          p.descripcion.toLowerCase().includes(termino)
      );
    }

    setProductosFiltrados(filtrados);
  }, [busqueda, categoriaSeleccionada, productos]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Buscador y filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar productos
              </label>
              <Input
                type="text"
                placeholder="Busca por nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filtrar por categoría
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoriaSeleccionada === null ? 'default' : 'outline'}
                  onClick={() => setCategoriaSeleccionada(null)}
                >
                  Todas las categorías
                </Button>
                {categorias.map((cat) => (
                  <Button
                    key={cat}
                    variant={categoriaSeleccionada === cat ? 'default' : 'outline'}
                    onClick={() => setCategoriaSeleccionada(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contador de productos */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {isLoading ? 'Cargando productos...' : `${productosFiltrados.filter(p => p.existencia > 0).length} productos disponibles`}
          </p>
        </div>

        {/* Grid de productos */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Cargando productos...</p>
          </div>
        ) : productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No hay productos que coincidan con tu búsqueda.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
