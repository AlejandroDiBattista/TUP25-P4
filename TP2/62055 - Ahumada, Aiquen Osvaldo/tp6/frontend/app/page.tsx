"use client";

import { useState, useEffect } from 'react';
import { obtenerProductos } from './services/productos';
import ProductoCard from './components/ProductoCard';

export default function Home() {
  const [productos, setProductos] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarProductos() {
      try {
        const data = await obtenerProductos();
        setProductos(data);
      } catch (err: any) {
        console.error('Home: error al obtener productos', err);
        setErrorMessage(err?.message || 'Error desconocido al cargar productos');
      } finally {
        setLoading(false);
      }
    }
    cargarProductos();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Cargando productos...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Catálogo de Productos
          </h1>
          <p className="text-gray-600 mt-2">
            {errorMessage ? errorMessage : `${productos.length} productos disponibles`}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {errorMessage ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
            {errorMessage}
            <div className="text-sm mt-2">Asegurate de que el backend esté corriendo en la URL configurada.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((producto: any) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
