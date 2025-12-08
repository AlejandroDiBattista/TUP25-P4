'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrders, getOrderById } from '@/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Calendar, MapPin, CreditCard, ShoppingBag } from 'lucide-react';

interface ItemCompra {
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio_unitario: number;
}

interface Compra {
  id: number;
  numero_compra?: number;  // Número relativo al usuario
  fecha: string;
  direccion: string;
  tarjeta: string;
  total: number;
  envio: number;
  items: ItemCompra[];
}

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);
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
    cargarCompras();
  }, [router]);

  const cargarCompras = async () => {
    try {
      const data = await getOrders();
      setCompras(data);
      // Seleccionar la primera compra automáticamente si existe
      if (data.length > 0) {
        await verDetalle(data[0].id);
      }
      setLoading(false);
    } catch (error) {
      setError('Error al cargar las compras');
      setLoading(false);
    }
  };

  const verDetalle = async (compraId: number) => {
    try {
      const data = await getOrderById(compraId);
      setCompraSeleccionada(data);
    } catch (error) {
      console.error('Error al cargar el detalle de la compra:', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-muted-foreground">Cargando compras...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-destructive">{error}</div>
    </div>
  );

  if (compras.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No tienes compras realizadas</CardTitle>
            <CardDescription>
              Explora nuestro catálogo y realiza tu primera compra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/productos')}>
              Ver productos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mis Compras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de compras - 1 columna */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Historial</h2>
          {compras.map((compra) => (
            <Card
              key={compra.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                compraSeleccionada?.id === compra.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => verDetalle(compra.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Compra #{compra.numero_compra || compra.id}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(compra.fecha).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{compra.items?.length || 0} items</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-xl font-bold">${compra.total.toFixed(2)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detalle de la compra - 2 columnas */}
        {compraSeleccionada && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Detalle de la Compra #{compraSeleccionada.numero_compra || compraSeleccionada.id}
                </CardTitle>
                <CardDescription>
                  {new Date(compraSeleccionada.fecha).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Información de envío y pago */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Dirección de envío</p>
                        <p className="text-sm text-muted-foreground">{compraSeleccionada.direccion}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Tarjeta</p>
                        <p className="text-sm text-muted-foreground">
                          **** **** **** {compraSeleccionada.tarjeta.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h4 className="font-semibold mb-3">Productos</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Precio Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compraSeleccionada.items.map((item) => (
                        <TableRow key={item.producto_id}>
                          <TableCell className="font-medium">{item.nombre}</TableCell>
                          <TableCell className="text-center">{item.cantidad}</TableCell>
                          <TableCell className="text-right">${item.precio_unitario.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${(item.cantidad * item.precio_unitario).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Resumen de costos */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ${(compraSeleccionada.total - compraSeleccionada.envio).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium">
                      {compraSeleccionada.envio === 0 ? (
                        <Badge variant="secondary">Gratis</Badge>
                      ) : (
                        `$${compraSeleccionada.envio.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total pagado</span>
                    <span>${compraSeleccionada.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}