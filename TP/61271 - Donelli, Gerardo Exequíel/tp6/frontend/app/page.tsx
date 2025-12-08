'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { obtenerProductos, obtenerCategorias } from './services/productos';
import { agregarAlCarrito } from './services/carrito';
import { Producto } from './types';
import Carrito from './components/Carrito';
import ProductoCard from './components/ProductoCard';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Loader2, ShoppingCart, Search, X, Package, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { estaAutenticado, cargando, token } = useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [error, setError] = useState('');
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [actualizarCarrito, setActualizarCarrito] = useState(0);

  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      router.push('/auth/login');
    }
  }, [estaAutenticado, cargando, router]);

  useEffect(() => {
    if (estaAutenticado) {
      cargarCategorias();
      cargarProductos();
    }
  }, [estaAutenticado]);

  useEffect(() => {
    if (estaAutenticado) {
      cargarProductos();
    }
  }, [categoriaSeleccionada, busqueda, estaAutenticado]);

  const cargarCategorias = async () => {
    try {
      const cats = await obtenerCategorias();
      setCategorias(cats);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const cargarProductos = async () => {
    setCargandoProductos(true);
    try {
      const prods = await obtenerProductos(
        categoriaSeleccionada || undefined,
        busqueda || undefined
      );
      setProductos(prods);
      setError('');
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setCargandoProductos(false);
    }
  };

  const handleAgregarAlCarrito = async (productoId: number) => {
    if (!token) return;
    
    try {
      await agregarAlCarrito(token, { producto_id: productoId, cantidad: 1 });
      setActualizarCarrito(prev => prev + 1);
      toast.success('Producto agregado', {
        description: 'El producto se agregó al carrito correctamente',
      });
    } catch (err) {
      toast.error('Error al agregar', {
        description: err instanceof Error ? err.message : 'No se pudo agregar el producto al carrito',
      });
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!estaAutenticado) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header con título y botón de carrito */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Catálogo de Productos</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Package className="h-4 w-4" />
            {productos.length} productos disponibles
          </p>
        </div>
        <Button onClick={() => setCarritoVisible(true)} size="lg">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Ver Carrito
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="busqueda" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar productos
            </Label>
            <Input
              type="text"
              id="busqueda"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtrar por categoría
            </Label>
            <select
              id="categoria"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(categoriaSeleccionada || busqueda) && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex gap-2">
              {busqueda && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="h-3 w-3" />
                  "{busqueda}"
                </Badge>
              )}
              {categoriaSeleccionada && (
                <Badge variant="secondary" className="gap-1">
                  <Filter className="h-3 w-3" />
                  {categoriaSeleccionada}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategoriaSeleccionada('');
                setBusqueda('');
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          </div>
        )}
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Productos */}
      {cargandoProductos ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <div key={producto.id} className="flex flex-col">
              <ProductoCard producto={producto} />
              <div className="mt-4">
                {producto.existencia > 0 ? (
                  <>
                    <Badge variant="secondary" className="mb-3">
                      {producto.existencia} disponibles
                    </Badge>
                    <Button
                      onClick={() => handleAgregarAlCarrito(producto.id)}
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Agregar al carrito
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="destructive" className="mb-3">Agotado</Badge>
                    <Button disabled className="w-full">
                      No disponible
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal del Carrito */}
      <Carrito
        open={carritoVisible}
        onOpenChange={setCarritoVisible}
        actualizarTrigger={actualizarCarrito}
        onActualizar={() => setActualizarCarrito(prev => prev + 1)}
      />
    </div>
  );
}
