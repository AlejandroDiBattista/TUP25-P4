'use client'

import { useState, useEffect } from 'react';
import ProductoCard from './components/ProductoCard';
import { Producto } from './types';

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    
    // Listener para refrescar productos después de compra
    const checkRefresh = () => {
      const shouldRefresh = localStorage.getItem('forceProductRefresh');
      if (shouldRefresh) {
        localStorage.removeItem('forceProductRefresh');
        console.log('🔄 Refrescando productos después de compra...');
        fetchProductos();
      }
    };
    
    // Listener para cambios en localStorage desde otras pestañas/ventanas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'forceProductRefresh' && e.newValue) {
        console.log('🔄 Detectado cambio en localStorage, refrescando productos...');
        localStorage.removeItem('forceProductRefresh');
        fetchProductos();
      }
    };
    
    // Listener para cuando el documento regresa al foco
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkRefresh();
      }
    };
    
    // Verificar al cargar la página
    checkRefresh();
    
    // Agregar listeners
    window.addEventListener('focus', checkRefresh);
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Verificar periódicamente (como fallback)
    const interval = setInterval(checkRefresh, 2000);
    
    return () => {
      window.removeEventListener('focus', checkRefresh);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    filtrarProductos();
  }, [productos, busqueda, categoria]);

  const fetchProductos = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/productos`);
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/categorias`);
      if (response.ok) {
        const data = await response.json();
        setCategorias(data.categorias || []);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const filtrarProductos = () => {
    let productosTemp = [...productos];

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      productosTemp = productosTemp.filter(producto =>
        producto.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (categoria) {
      productosTemp = productosTemp.filter(producto =>
        producto.categoria.toLowerCase().includes(categoria.toLowerCase())
      );
    }

    setProductosFiltrados(productosTemp);
  };

  const refreshProductos = () => {
    fetchProductos();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Catálogo de Productos
          </h1>
          <p className="text-gray-700 text-lg">
            {productosFiltrados.length} productos {busqueda || categoria ? 'encontrados' : 'disponibles'}
          </p>
        </div>

        {/* Barra de búsqueda y filtros mejorada */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="busqueda" className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar productos
              </label>
              <input
                id="busqueda"
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="categoria" className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría
              </label>
              <select 
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white min-w-[200px]"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat} className="text-gray-900 font-medium">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {setBusqueda(''); setCategoria('');}}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta con otros términos de búsqueda o selecciona una categoría diferente.
            </p>
            <button
              onClick={() => {setBusqueda(''); setCategoria('');}}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} onStockUpdate={refreshProductos} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
