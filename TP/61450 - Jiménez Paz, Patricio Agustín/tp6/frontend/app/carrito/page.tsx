'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { obtenerCarrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito } from '../services/carrito';
import { Carrito as CarritoType } from '../types';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CarritoPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [carrito, setCarrito] = useState<CarritoType | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    cargarCarrito();
  }, [isAuthenticated]);

  const cargarCarrito = async () => {
    try {
      setLoading(true);
      const data = await obtenerCarrito();
      setCarrito(data);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarCantidad = async (producto_id: number, cantidad: number) => {
    if (cantidad < 1) return;
    
    try {
      await actualizarCantidad(producto_id, cantidad);
      await cargarCarrito();
      toast.success('Cantidad actualizada correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar la cantidad');
    }
  };

  const handleEliminar = async (producto_id: number) => {
    try {
      await eliminarDelCarrito(producto_id);
      await cargarCarrito();
      toast.success('Producto eliminado del carrito');
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el producto');
    }
  };

  const handleVaciarCarrito = async () => {
    if (!confirm('¿Estás seguro de vaciar el carrito?')) return;
    
    try {
      await vaciarCarrito();
      await cargarCarrito();
      toast.success('Carrito vaciado correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al vaciar el carrito');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Cargando carrito...</p>
      </div>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Carrito Vacío</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">No tienes productos en tu carrito</p>
            <Link href="/">
              <Button className="w-full">Ir a Comprar</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
          <Button variant="destructive" size="sm" onClick={handleVaciarCarrito}>
            <Trash2 className="h-4 w-4 mr-2" />
            Vaciar Carrito
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {carrito.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 bg-gray-100 rounded">
                      <Image
                        src={`${API_URL}/${item.imagen}`}
                        alt={item.titulo}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.titulo}</h3>
                      <p className="text-gray-600">${item.precio.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActualizarCantidad(item.producto_id, item.cantidad - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => handleActualizarCantidad(item.producto_id, parseInt(e.target.value))}
                          className="w-20 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActualizarCantidad(item.producto_id, item.cantidad + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEliminar(item.producto_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-xl font-bold">${item.subtotal.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">IVA: ${item.iva.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumen de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${carrito.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA</span>
                  <span className="font-semibold">${carrito.iva.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${carrito.total.toFixed(2)}</span>
                  </div>
                </div>
                <Link href="/checkout">
                  <Button className="w-full" size="lg">
                    Finalizar Compra
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full mt-4">
                    Seguir Comprando
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
