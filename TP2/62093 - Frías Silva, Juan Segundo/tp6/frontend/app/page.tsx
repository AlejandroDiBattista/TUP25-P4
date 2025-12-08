'use client';

import { useEffect, useState } from 'react';
import { obtenerProductos, agregarAlCarrito } from './services/productos';
import { Producto } from './types';
import Image from 'next/image';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    cargarProductos();
  }, [categoriaFiltro, busqueda]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await obtenerProductos(categoriaFiltro, busqueda);
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarAlCarrito = async (productoId: number) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await agregarAlCarrito(productoId, 1, token);
      setMensaje('Producto agregado al carrito');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error: any) {
      setMensaje(error.message || 'Error al agregar al carrito');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const categorias = ['Todas', 'Electrónica', 'Ropa de hombre', 'Ropa de mujer', 'Joyería'];

  return (
    <div className="min-h-screen bg-gray-50">
      {mensaje && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {mensaje}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar productos
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value === 'Todas' ? '' : e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Productos Disponibles ({productos.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productos.map((producto) => (
                <div key={producto.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-64 bg-gray-100">
                    <Image
                      src={`${API_URL}/${producto.imagen}`}
                      alt={producto.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain p-4"
                      unoptimized
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {producto.categoria}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 h-14">
                      {producto.titulo}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
                      {producto.descripcion}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-700 ml-1">{producto.valoracion}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Stock: {producto.existencia}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">
                        ${producto.precio}
                      </span>
                      
                      {producto.existencia > 0 ? (
                        <button
                          onClick={() => handleAgregarAlCarrito(producto.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Agregar
                        </button>
                      ) : (
                        <span className="text-red-600 font-semibold text-sm">Agotado</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
