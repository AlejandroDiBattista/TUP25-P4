'use client';

import { useEffect, useState } from 'react';
import ProductoCard from './components/ProductoCard';
import { Navbar } from './components/Navbar';
import { Producto } from './types';

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const loadProductos = async () => {
      try {
        let url = `${API_URL}/productos`;
        const params = new URLSearchParams();
        if (searchTerm) params.append('buscar', searchTerm);
        if (selectedCategory) params.append('categoria', selectedCategory);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        }
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductos();
  }, [searchTerm, selectedCategory, API_URL]);

  const categorias = ['Ropa de hombre', 'Ropa de mujer', 'Joyería', 'Electrónica'];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-light text-black mb-6 tracking-tight">
            Catálogo de Productos
          </h1>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm bg-white"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <p className="text-gray-500 mt-4 text-sm">
            {isLoading ? 'Cargando...' : `${productos.length} productos disponibles`}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Cargando productos...</div>
        ) : productos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron productos
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
