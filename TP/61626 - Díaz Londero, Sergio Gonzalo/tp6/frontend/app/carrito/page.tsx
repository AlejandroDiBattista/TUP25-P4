'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, removeFromCart, checkout, cancelCart } from '@/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ShoppingBag, CreditCard } from 'lucide-react';

interface ItemCarrito {
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio: number;
  iva?: number;
}

interface CarritoResponse {
  items: ItemCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }
    cargarCarrito();
  }, [router]);

  const cargarCarrito = async () => {
    try {
      const data = await getCart();
      setCarrito(data);
      setLoading(false);
    } catch (error) {
      setError('Error al cargar el carrito');
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productoId: number) => {
    try {
      await removeFromCart(productoId);
      await cargarCarrito();
    } catch (error: any) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await checkout(direccion, tarjeta);
      router.push('/compras');
    } catch (error: any) {
      console.error('Error al procesar la compra:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelCart();
      router.push('/productos');
    } catch (error: any) {
      console.error('Error al cancelar el carrito:', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-muted-foreground">Cargando carrito...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-destructive">{error}</div>
    </div>
  );

  if (!carrito || !carrito.items || carrito.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Tu carrito está vacío</CardTitle>
            <CardDescription>
              Debe iniciar sesión para ver y modificar el carrito
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push('/productos')}>
              Ver productos
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos - 2 columnas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos en tu carrito</CardTitle>
              <CardDescription>
                {carrito.items.length} {carrito.items.length === 1 ? 'producto' : 'productos'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 py-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[45%]">Producto</TableHead>
                    <TableHead className="text-center w-[15%]">Cantidad</TableHead>
                    <TableHead className="text-right w-[15%]">Precio</TableHead>
                    <TableHead className="text-right w-[18%]">Subtotal</TableHead>
                    <TableHead className="w-[7%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carrito.items.map((item) => (
                    <TableRow key={item.producto_id}>
                      <TableCell className="font-medium">{item.nombre}</TableCell>
                      <TableCell className="text-center">{item.cantidad}</TableCell>
                      <TableCell className="text-right">${item.precio.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${(item.cantidad * item.precio).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.producto_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Resumen y pago - 1 columna más ancha */}
        <div className="space-y-6">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${carrito.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA</span>
                <span className="font-medium">${carrito.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="font-medium">
                  {carrito.envio === 0 ? 'Gratis' : `$${carrito.envio.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">${carrito.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Información de pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección de envío</Label>
                  <Input
                    id="direccion"
                    type="text"
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ingresa tu dirección completa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tarjeta">Número de tarjeta</Label>
                  <Input
                    id="tarjeta"
                    type="text"
                    required
                    value={tarjeta}
                    onChange={(e) => setTarjeta(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                  />
                </div>
                <div className="space-y-3 pt-4">
                  <Button type="submit" className="w-full">
                    Confirmar compra
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}