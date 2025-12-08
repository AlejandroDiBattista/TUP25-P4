'use client';

import { useState, useEffect } from 'react';
import { obtenerProductos } from './services/productos';
import ProductoCard from './components/ProductoCard';
import { Producto } from './types';
import { Input } from '@/app/components/ui/input';
import { Search } from 'lucide-react';

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProductos(productos);
    } else {
      const filtered = productos.filter(
        (producto) =>
          producto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProductos(filtered);
    }
  }, [searchTerm, productos]);

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductos();
      setProductos(data);
      setFilteredProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Catálogo de Productos
            </h1>
            <p className="text-gray-600 mt-3">
              {filteredProductos.length} producto{filteredProductos.length !== 1 ? 's' : ''} disponible{filteredProductos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredProductos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProductos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
