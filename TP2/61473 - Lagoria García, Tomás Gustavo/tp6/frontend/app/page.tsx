'use client';

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CartSidebar } from './components/CartSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { obtenerProductos } from './services/productos';
import { useCarrito } from './hooks/useCarrito';
import { useAuth } from './context/AuthContext';
import { useProductos } from './context/ProductosContext';
import { Producto } from './types';

export default function HomePage() {
  const { productos, loading: loadingProductos, recargarProductos } = useProductos();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoria, setCategoria] = useState<string>('todas');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const { agregar } = useCarrito();
  const { isAuthenticated, logout } = useAuth();

  // Cargar productos inicialmente
  useEffect(() => {
    recargarProductos();
  }, []);

  // Cargar categorías al inicio
  useEffect(() => {
    cargarCategorias();
  }, []);

  // Cargar productos cuando cambian los filtros
  useEffect(() => {
    cargarProductos();
  }, [searchTerm, categoria]);

  const cargarCategorias = async () => {
    try {
      // Cargar todos los productos para extraer categorías únicas
      const data = await obtenerProductos();
      const categoriasUnicas = [...new Set(data.map(p => p.categoria))];
      setCategorias(categoriasUnicas);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const filtros = {
        buscar: searchTerm || undefined,
        categoria: categoria !== 'todas' ? categoria : undefined,
      };
      await recargarProductos();
    } catch (error) {
      toast.error('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (producto: Producto) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    try {
      await agregar(producto.id, 1);
      toast.success(`${producto.titulo} agregado al carrito`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al agregar al carrito';
      
      // Si el error es de sesión expirada, cerrar sesión automáticamente
      if (message.includes('sesión ha expirado') || message.includes('token')) {
        toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        await logout();
      } else {
        toast.error(message);
      }
    }
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setCategoria('todas');
  };

  // Filtrar productos en memoria
  const productosFiltrados = productos.filter(producto => {
    const cumpleBusqueda = !searchTerm || 
      producto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const cumpleCategoria = categoria === 'todas' || producto.categoria === categoria;
    
    return cumpleBusqueda && cumpleCategoria;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartToggle={() => setCartOpen(!cartOpen)} />

      <main className="container mx-auto px-4 py-8">
        {/* Contenedor con grid que se adapta al carrito */}
        <div className={`transition-all duration-500 ease-in-out ${cartOpen ? 'mr-[460px]' : ''}`}>
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Catálogo de Productos
          </h1>
          <p className="text-gray-600">
            Descubre nuestra selección de productos
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className={`grid gap-4 transition-all duration-500 ${
            cartOpen 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-[1fr_auto_auto]'
          }`}>
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selector de categoría */}
            <div className={cartOpen ? 'w-full' : 'w-[200px]'}>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5}>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botón limpiar filtros */}
            {(searchTerm || categoria !== 'todas') && (
              <Button 
                variant="outline" 
                onClick={limpiarFiltros}
                className={cartOpen ? 'w-full md:col-span-2' : 'w-auto'}
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Resultados */}
        {loadingProductos || loading ? (
          // Skeleton de carga
          <div className={`grid transition-all duration-500 ease-in-out ${
            cartOpen 
              ? 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-3' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          }`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3 max-w-sm mx-auto w-full">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : productosFiltrados.length > 0 ? (
          <>
            {/* Contador de resultados */}
            <p className="text-sm text-gray-600 mb-4">
              {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            </p>

            {/* Grid de productos */}
            <div className={`grid transition-all duration-500 ease-in-out ${
              cartOpen 
                ? 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-3' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            }`}>
              {productosFiltrados.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </>
        ) : (
          // Sin resultados
          <Alert>
            <AlertDescription>
              No se encontraron productos con los filtros seleccionados.
            </AlertDescription>
          </Alert>
        )}
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
