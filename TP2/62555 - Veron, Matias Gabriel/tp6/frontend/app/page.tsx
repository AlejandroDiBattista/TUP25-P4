'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Producto } from './types';
import { obtenerProductos, obtenerCategorias, buscarProductos, filtrarPorCategoria } from './services/productos';
import { agregarAlCarrito, obtenerCarrito, eliminarDelCarrito, vaciarCarrito, finalizarCompra, actualizarCantidad, CarritoResponse } from './services/carrito';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Cargar productos y categorías al inicio
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        const [productosData, categoriasData] = await Promise.all([
          obtenerProductos(),
          obtenerCategorias()
        ]);
        
        setProductos(productosData);
        setProductosFiltrados(productosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Cargar carrito si el usuario está autenticado
  useEffect(() => {
    const cargarCarrito = async () => {
      if (user) {
        try {
          const carritoData = await obtenerCarrito();
          setCarrito(carritoData);
        } catch (error) {
          console.error('Error cargando carrito:', error);
        }
      } else {
        setCarrito(null);
      }
    };

    cargarCarrito();
  }, [user]);

  // Manejar búsqueda de productos
  const handleSearch = async (query: string) => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/productos/`;
      const params = new URLSearchParams();
      
      if (query.trim()) {
        params.append('q', query);
      }
      
      if (categoriaSeleccionada !== 'todas') {
        params.append('categoria', categoriaSeleccionada);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Error al buscar productos');
      }
      
      const data = await response.json();
      const resultados = data.map((item: any) => ({
        id: item.id,
        nombre: item.titulo,
        precio: item.precio,
        descripcion: item.descripcion,
        categoria: item.categoria,
        valoracion: item.valoracion,
        stock: item.existencia,
        imagen: item.imagen,
      }));
      
      setProductosFiltrados(resultados);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  // Manejar filtro por categoría
  const handleCategoryFilter = async (categoria: string) => {
    try {
      setCategoriaSeleccionada(categoria);
      
      // Reejecutar búsqueda con la nueva categoría
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      const currentQuery = searchInput ? searchInput.value : '';
      
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/productos/`;
      const params = new URLSearchParams();
      
      if (currentQuery.trim()) {
        params.append('q', currentQuery);
      }
      
      if (categoria !== 'todas') {
        params.append('categoria', categoria);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Error al filtrar productos');
      }
      
      const data = await response.json();
      const resultados = data.map((item: any) => ({
        id: item.id,
        nombre: item.titulo,
        precio: item.precio,
        descripcion: item.descripcion,
        categoria: item.categoria,
        valoracion: item.valoracion,
        stock: item.existencia,
        imagen: item.imagen,
      }));
      
      setProductosFiltrados(resultados);
    } catch (error) {
      console.error('Error filtrando por categoría:', error);
    }
  };

  // Agregar producto al carrito
  const handleAddToCart = async (productId: number, quantity: number) => {
    try {
      await agregarAlCarrito(productId, quantity);
      
      // Actualizar carrito
      const carritoActualizado = await obtenerCarrito();
      setCarrito(carritoActualizado);
      
      // Actualizar stock local inmediatamente
      setProductos(prevProductos => 
        prevProductos.map(p => 
          p.id === productId ? { ...p, stock: p.stock - quantity } : p
        )
      );
      setProductosFiltrados(prevProductos => 
        prevProductos.map(p => 
          p.id === productId ? { ...p, stock: p.stock - quantity } : p
        )
      );
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      alert('Error al agregar producto al carrito');
    }
  };

  // Actualizar cantidad en el carrito
  const handleUpdateQuantity = async (productoId: number, newQuantity: number) => {
    try {
      // Encontrar la cantidad actual en el carrito
      const itemActual = carrito?.items.find(item => item.producto.id === productoId);
      const cantidadActual = itemActual ? itemActual.cantidad : 0;
      
      if (newQuantity > 0) {
        await actualizarCantidad(productoId, newQuantity);
        
        // Actualizar stock local: diferencia = nueva cantidad - cantidad actual
        const diferencia = newQuantity - cantidadActual;
        setProductos(prevProductos => 
          prevProductos.map(producto => 
            producto.id === productoId 
              ? { ...producto, stock: producto.stock - diferencia }
              : producto
          )
        );
        setProductosFiltrados(prevProductos => 
          prevProductos.map(producto => 
            producto.id === productoId 
              ? { ...producto, stock: producto.stock - diferencia }
              : producto
          )
        );
      } else {
        await eliminarDelCarrito(productoId);
        
        // Restaurar todo el stock del item eliminado
        setProductos(prevProductos => 
          prevProductos.map(producto => 
            producto.id === productoId 
              ? { ...producto, stock: producto.stock + cantidadActual }
              : producto
          )
        );
        setProductosFiltrados(prevProductos => 
          prevProductos.map(producto => 
            producto.id === productoId 
              ? { ...producto, stock: producto.stock + cantidadActual }
              : producto
          )
        );
      }
      
      // Actualizar el carrito
      const carritoActualizado = await obtenerCarrito();
      setCarrito(carritoActualizado);
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      // Recargar el carrito en caso de error para mantener sincronizado
      const carritoActualizado = await obtenerCarrito();
      setCarrito(carritoActualizado);
    }
  };

  // Eliminar item del carrito
  const handleRemoveItem = async (productoId: number) => {
    try {
      // Encontrar la cantidad actual para restaurar el stock
      const itemActual = carrito?.items.find(item => item.producto.id === productoId);
      const cantidadActual = itemActual ? itemActual.cantidad : 0;
      
      await eliminarDelCarrito(productoId);
      
      // Restaurar el stock local
      setProductos(prevProductos => 
        prevProductos.map(producto => 
          producto.id === productoId 
            ? { ...producto, stock: producto.stock + cantidadActual }
            : producto
        )
      );
      setProductosFiltrados(prevProductos => 
        prevProductos.map(producto => 
          producto.id === productoId 
            ? { ...producto, stock: producto.stock + cantidadActual }
            : producto
        )
      );
      
      const carritoActualizado = await obtenerCarrito();
      setCarrito(carritoActualizado);
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
    }
  };

  // Vaciar carrito
  const handleClearCart = async () => {
    try {
      // Guardar items del carrito para restaurar stock
      const itemsParaRestaurar = carrito?.items || [];
      
      await vaciarCarrito();
      const carritoActualizado = await obtenerCarrito();
      setCarrito(carritoActualizado);
      
      // Restaurar stock local
      setProductos(prevProductos => 
        prevProductos.map(p => {
          const itemCarrito = itemsParaRestaurar.find(item => item.producto.id === p.id);
          return itemCarrito ? { ...p, stock: p.stock + itemCarrito.cantidad } : p;
        })
      );
      setProductosFiltrados(prevProductos => 
        prevProductos.map(p => {
          const itemCarrito = itemsParaRestaurar.find(item => item.producto.id === p.id);
          return itemCarrito ? { ...p, stock: p.stock + itemCarrito.cantidad } : p;
        })
      );
    } catch (error) {
      console.error('Error vaciando carrito:', error);
    }
  };

  const cartItemCount = carrito?.items.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          onSearch={handleSearch} 
          categorias={categorias}
          categoriaSeleccionada={categoriaSeleccionada}
          onCategoryChange={handleCategoryFilter}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearch={handleSearch} 
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onCategoryChange={handleCategoryFilter}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Contenido principal */}
          <div className="flex-1">
            {/* Grid de productos */}
            {productosFiltrados.length > 0 ? (
              <div className="space-y-4">
                {productosFiltrados.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    onAddToCart={handleAddToCart}
                    isAuthenticated={!!user}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500">
                  Intenta ajustar los filtros o realizar una búsqueda diferente.
                </p>
              </div>
            )}
          </div>

          {/* Carrito lateral - solo visible si el usuario está autenticado */}
          {user && (
            <div className="hidden lg:block w-80">
              <CartSidebar
                carrito={carrito}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
