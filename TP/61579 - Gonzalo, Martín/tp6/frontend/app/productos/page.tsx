'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { obtenerProductos } from '../services/productos';
import { Producto } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const CATEGORIAS = [
  'Ropa de hombre',
  'Ropa de mujer',
  'Electrónica',
  'Joyería',
];

export default function ProductosPage() {
  const router = useRouter();
  const { estaLogueado, cargando: cargandoAuth } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  // Redirigir si no está logueado
  useEffect(() => {
    if (!cargandoAuth && !estaLogueado) {
      router.push('/login');
    }
  }, [estaLogueado, cargandoAuth, router]);

  // Cargar productos
  useEffect(() => {
    if (!estaLogueado) return; // No cargar si no está logueado

    const cargarProductos = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await obtenerProductos(busqueda, categoriaSeleccionada);
        setProductos(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, [busqueda, categoriaSeleccionada, estaLogueado]);

  if (cargandoAuth) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!estaLogueado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Catálogo de Productos</h1>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="">Todas las categorías</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Limpiar filtros */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setBusqueda('');
                  setCategoriaSeleccionada('');
                }}
                className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-800">Cargando productos...</p>
          </div>
        )}

        {/* Grid de Productos */}
        {!loading && (
          <>
            {productos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-800 text-lg">
                  No se encontraron productos
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productos.map((producto) => (
                  <Link
                    key={producto.id}
                    href={`/producto/${producto.id}`}
                  >
                    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer h-full flex flex-col">
                      {/* Imagen */}
                      <div className="bg-gray-200 h-48 flex items-center justify-center">
                        {producto.imagen ? (
                          <img
                            src={`http://localhost:8000/imagenes/${producto.imagen}`}
                            alt={producto.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">📦</span>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {producto.titulo}
                        </h3>

                        <p className="text-gray-800 text-sm mb-4 line-clamp-2 flex-1">
                          {producto.descripcion}
                        </p>

                        {/* Precio y Rating */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-2xl font-bold text-blue-600">
                              ${producto.precio}
                            </span>
                            <span className="text-yellow-500">
                              ★ {producto.valoracion}
                            </span>
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="mb-4">
                          {producto.existencia > 0 ? (
                            <span className="text-green-600 font-semibold">
                              En stock ({producto.existencia})
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold">
                              Agotado
                            </span>
                          )}
                        </div>

                        {/* Botón */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/producto/${producto.id}`);
                          }}
                          disabled={producto.existencia === 0}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
