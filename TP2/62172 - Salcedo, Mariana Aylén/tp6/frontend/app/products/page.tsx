'use client';

import { useState, useEffect } from 'react';
import ProductoCard from '../components/ProductoCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { Producto } from '../types';

export default function ProductsPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');

  useEffect(() => {
    cargarProductos();
  }, [busqueda, categoria]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busqueda) params.append('busqueda', busqueda);
      if (categoria && categoria !== 'todas') params.append('categoria', categoria);

      const url = `http://localhost:8000/productos${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Error al cargar productos');
      
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Explorar Productos
        </h1>
        
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar value={busqueda} onChange={setBusqueda} />
          </div>
          <div className="w-full md:w-64">
            <CategoryFilter value={categoria} onChange={setCategoria} />
          </div>
        </div>

        {/* Contador de resultados */}
        <p className="text-gray-600">
          {loading ? 'Cargando...' : `${productos.length} productos encontrados`}
        </p>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
