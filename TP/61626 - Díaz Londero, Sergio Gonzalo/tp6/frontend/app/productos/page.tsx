'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, addToCart, getCart, removeFromCart, checkout } from '@/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingCart, Plus, Minus, X } from 'lucide-react';
import Image from 'next/image';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  existencia: number;
  imagen?: string;
}

interface ItemCarrito {
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio: number;
  imagen?: string;
}

interface CarritoResponse {
  items: ItemCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación pero NO redirigir
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    cargarProductos();
    
    // Solo cargar carrito si está autenticado
    if (token) {
      cargarCarrito();
    }
  }, [categoria, busqueda]);

  const cargarProductos = async () => {
    try {
      // Si categoria es "todas", enviar string vacío al backend
      const categoriaFiltro = categoria === 'todas' ? '' : categoria;
      const data = await getProducts(categoriaFiltro, busqueda);
      setProductos(data);
      setLoading(false);
    } catch (error) {
      setError('Error al cargar los productos');
      setLoading(false);
    }
  };

  const cargarCarrito = async () => {
    try {
      const data = await getCart();
      setCarrito(data);
    } catch (error) {
      // Carrito vacío o error
      setCarrito(null);
    }
  };

  const handleAddToCart = async (productoId: number) => {
    // Verificar autenticación antes de agregar
    if (!isAuthenticated) {
      console.log('Debe iniciar sesión para agregar productos al carrito');
      return;
    }

    try {
      await addToCart(productoId, 1);
      await cargarCarrito();
      await cargarProductos(); // Actualizar stock disponible
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  };

  const handleIncrementarCantidad = async (productoId: number) => {
    try {
      await addToCart(productoId, 1);
      await cargarCarrito();
      await cargarProductos(); // Actualizar stock disponible
    } catch (error) {
      console.error('Error al incrementar cantidad:', error);
    }
  };

  const handleDisminuirCantidad = async (productoId: number) => {
    try {
      // Verificar la cantidad actual antes de disminuir
      const itemActual = carrito?.items.find(item => item.producto_id === productoId);
      
      if (itemActual && itemActual.cantidad > 1) {
        // Si hay más de 1, eliminar solo 1 unidad agregando -1
        // Primero removemos todo el producto
        await removeFromCart(productoId);
        // Luego agregamos la cantidad que quedaba menos 1
        await addToCart(productoId, itemActual.cantidad - 1);
      } else {
        // Si solo hay 1, eliminar completamente
        await removeFromCart(productoId);
      }
      
      await cargarCarrito();
      await cargarProductos(); // Actualizar stock disponible
    } catch (error) {
      console.error('Error al disminuir cantidad:', error);
    }
  };

  const handleContinuarCompra = () => {
    router.push('/carrito');
  };

  const handleCancelarCarrito = async () => {
    if (carrito?.items && carrito.items.length > 0) {
      try {
        for (const item of carrito.items) {
          await removeFromCart(item.producto_id);
        }
        await cargarCarrito();
        await cargarProductos(); // Restaurar stock disponible
      } catch (error) {
        console.error('Error al cancelar el carrito:', error);
      }
    }
  };

  // Obtener el stock disponible considerando lo que está en el carrito
  const getStockDisponible = (productoId: number, stockTotal: number) => {
    const itemEnCarrito = carrito?.items.find(item => item.producto_id === productoId);
    if (itemEnCarrito) {
      return stockTotal; // El stock ya refleja lo disponible después de agregar al carrito
    }
    return stockTotal;
  };

  // Verificar si se puede incrementar la cantidad
  const puedeIncrementar = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId);
    return producto && producto.existencia > 0;
  };

  // Helper para limpiar la ruta de imagen
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    // Si ya incluye "imagenes/", usar la ruta completa
    if (imagePath.startsWith('imagenes/')) {
      return `http://localhost:8000/${imagePath}`;
    }
    // Si no, agregar el prefijo
    return `http://localhost:8000/imagenes/${imagePath}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-muted-foreground">Cargando productos...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-destructive">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className="h-10 w-96">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              <SelectItem value="Ropa de hombre">Ropa de hombre</SelectItem>
              <SelectItem value="Ropa de mujer">Ropa de mujer</SelectItem>
              <SelectItem value="Electrónica">Electrónica</SelectItem>
              <SelectItem value="Joyería">Joyería</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Layout con productos y carrito */}
        <div className="flex gap-6">
          {/* Panel de productos - Izquierda */}
          <div className="flex-1">
            {/* Lista de productos */}
            <div className="space-y-4">
          {productos.map((producto) => (
            <Card key={producto.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Imagen del producto */}
                  <div className="relative w-40 h-40 bg-muted rounded flex-shrink-0 overflow-hidden">
                    {producto.imagen ? (
                      <Image
                        src={getImageUrl(producto.imagen) || ''}
                        alt={producto.nombre}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{producto.nombre}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {producto.descripcion}
                      </p>
                      <Badge variant="secondary" className="text-xs mb-2">
                        Categoría: {producto.categoria}
                      </Badge>
                    </div>
                  </div>

                  {/* Precio y acción */}
                  <div className="flex flex-col items-end justify-between min-w-[180px]">
                    <div className="text-right">
                      <div className="text-3xl font-bold mb-1">
                        ${producto.precio.toFixed(2)}
                      </div>
                      <Badge 
                        variant={producto.existencia > 0 ? "secondary" : "destructive"}
                        className="mb-2"
                      >
                        {producto.existencia > 0 ? `Disponible: ${producto.existencia}` : 'Sin stock'}
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={() => handleAddToCart(producto.id)}
                      disabled={producto.existencia === 0}
                      size="lg"
                      className="w-full"
                    >
                      Agregar al carrito
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>

            {productos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No se encontraron productos</p>
              </div>
            )}
          </div>

          {/* Panel del carrito - Derecha */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col">
              <div className="bg-card border rounded-lg overflow-hidden flex flex-col p-6">
                {!isAuthenticated ? (
                  /* Mensaje cuando NO está autenticado */
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Inicia sesión para ver y editar tu carrito.
                    </p>
                  </div>
                ) : carrito && carrito.items && carrito.items.length > 0 ? (
                    <>
                      {/* Items del carrito con scroll */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-28rem)]">
              {carrito.items.map((item) => {
                const producto = productos.find(p => p.id === item.producto_id);
                return (
                  <Card key={item.producto_id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Imagen del producto */}
                        <div className="relative w-16 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                          {(item.imagen || producto?.imagen) ? (
                            <Image
                              src={getImageUrl(item.imagen || producto?.imagen) || ''}
                              alt={item.nombre}
                              fill
                              className="object-cover"
                              sizes="64px"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2">{item.nombre}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            ${item.precio.toFixed(2)} c/u
                          </p>
                          
                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDisminuirCantidad(item.producto_id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.cantidad}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleIncrementarCantidad(item.producto_id)}
                              disabled={!puedeIncrementar(item.producto_id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {producto && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Stock disponible: {producto.existencia}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-sm">
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
                      </div>

                      {/* Resumen y botones - Siempre visible al final */}
                      <div className="p-6 pt-4 border-t space-y-4">
              {/* Resumen */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${carrito.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA</span>
                    <span>${carrito.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span>{carrito.envio === 0 ? 'Gratis' : `$${carrito.envio.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-xl">${carrito.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Botones */}
              <div className="space-y-2">
                <Button onClick={handleContinuarCompra} className="w-full" size="lg">
                  Continuar compra
                </Button>
                <Button 
                  onClick={handleCancelarCarrito} 
                  variant="outline" 
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
                      </div>
                    </>
                ) : (
                  /* Carrito vacío pero autenticado */
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Tu carrito está vacío</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}