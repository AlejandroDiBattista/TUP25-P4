'use client';

import { useState, useEffect } from 'react';
import { obtenerProductos } from '../services/productos';
import { agregarAlCarrito } from '../services/carrito';
import { useAuth } from '@/app/context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navigation from './Navigation';
import CarritoSidebar from './CarritoSidebar';
import { useCarrito } from '@/app/context';


export default function ProductoCatalogo() {
  const [filtrados, setFiltrados] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { refreshCarrito } = useCarrito();


  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await obtenerProductos();
      setFiltrados(data);
      
      const cats = [...new Set(data.map((p: any) => p.categoria))].filter(Boolean);
      setCategorias(cats);
      setError(null);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltro = async () => {
    try {
      setLoading(true);
      const data = await obtenerProductos(categoria || undefined, busqueda || undefined);
      setFiltrados(data);
    } catch (err) {
      console.error('Error al filtrar:', err);
      setError('Error al filtrar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCarrito = async (producto_id: number) => {
    if (!isAuthenticated) {
      router.push('/Login');
      return;
    }

    try {
      await agregarAlCarrito(producto_id, 1);
      alert('Producto agregado al carrito');
    } catch (err) {
      console.error('Error al agregar:', err);
      alert('Error al agregar producto');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-12">Cargando productos...</div>;
    }
    
    if (filtrados.length === 0) {
      return <div className="text-center py-12">No hay productos disponibles</div>;
    }
    
    return (
      <div className="space-y-4">
        {filtrados.map((producto: any) => (
          <div key={producto.id} className="bg-white p-6 rounded-lg shadow flex gap-6 items-center">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
              <img 
                src={`/imagenes/${String(producto.id).padStart(4, '0')}.png`}
                alt={producto.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">{producto.nombre}</h3>
              <p className="text-gray-600 text-sm mb-2">{producto.descripcion}</p>
              <p className="text-gray-500 text-xs">Categoría: {producto.categoria}</p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">${producto.precio.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mb-3">
                {producto.existencia > 0 
                  ? `Disponible: ${producto.existencia}` 
                  : 'Agotado'}
              </p>
              <Button
                onClick={() => handleAgregarCarrito(producto.id)}
                disabled={producto.existencia === 0}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {producto.existencia === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex">
        <div className={mostrarCarrito ? 'w-2/3' : 'w-full'}>
          <div className="p-6">
            {/* Barra de búsqueda y filtros */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Button onClick={handleFiltro}>Buscar</Button>
                {isAuthenticated && (
                  <Button 
                    onClick={() => setMostrarCarrito(!mostrarCarrito)}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    🛒 Carrito
                  </Button>
                )}
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Lista de productos */}
            {renderContent()}
          </div>
        </div>

        {/* Carrito lateral */}
        {isAuthenticated && (
          <CarritoSidebar mostrar={mostrarCarrito} setMostrar={setMostrarCarrito} />
        )}
      </div>
    </div>
  );
}