"use client";

import { useState } from 'react';
import { Producto } from '../types';
import { obtenerProductos } from '../services/productos';
import ProductoCard from './ProductoCard';

interface CatalogoProps {
  productosIniciales: Producto[];
}

export default function Catalogo({ productosIniciales }: CatalogoProps) {
    const [productos, setProductos] = useState(productosIniciales);
    const [buscar, setBuscar] = useState('');
    const [categoria, setCategoria] = useState('');
    const [cargando, setCargando] = useState(false);

    const aplicarFiltros = async () => {
    setCargando(true);
    try {
      const productosFiltrados = await obtenerProductos({ buscar, categoria });
      setProductos(productosFiltrados);
    } catch (error) {
      console.error("Error al filtrar productos:", error);
    }
    setCargando(false);
  };

  const limpiarFiltros = async () => {
    setCargando(true);
    setBuscar('');
    setCategoria('');
    try {
      const todosLosProductos = await obtenerProductos();
      setProductos(todosLosProductos);
    } catch (error) {
      console.error("Error al limpiar filtros:", error);
    }
    setCargando(false);
  };

  const categorias = [
    "Ropa de hombre",
    "Joyería",
    "Electrónica",
    "Ropa de mujer",
  ];

  return (
    <div>
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-4">

          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-grow p-2 border border-gray-300 rounded-md text-gray-900"
          />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white text-gray-900"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={aplicarFiltros}
            disabled={cargando}
            className="px-6 py-2 bg-pink-500 text-white rounded-md font-semibold hover:bg-pink-600 transition-colors"
          >
            {cargando ? 'Buscando...' : 'Buscar'}
          </button>
          <button
            onClick={limpiarFiltros}
            disabled={cargando}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Catálogo de Productos
        </h1>
        <p className="text-gray-600 mt-1">
          {cargando ? 'Cargando...' : `${productos.length} productos encontrados`}
        </p>
      </div>

      {cargando ? (
        <p className="text-center text-gray-500">Cargando productos...</p>
      ) : productos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No se encontraron productos con esos filtros.
        </p>
      )}
    </div>
  );
}