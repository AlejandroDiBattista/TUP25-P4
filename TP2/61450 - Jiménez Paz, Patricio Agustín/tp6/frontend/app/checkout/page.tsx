'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { obtenerCarrito } from '../services/carrito';
import { finalizarCompra } from '../services/compras';
import { Carrito } from '../types';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [loading, setLoading] = useState(false);
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
      const data = await obtenerCarrito();
      if (data.items.length === 0) {
        router.push('/carrito');
      }
      setCarrito(data);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar el carrito');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const compra = await finalizarCompra({ direccion, tarjeta });
      toast.success('¡Compra realizada exitosamente!');
      router.push(`/compras/${compra.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Información de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección de Envío</Label>
                    <Input
                      id="direccion"
                      type="text"
                      placeholder="Ej: Av. Corrientes 1234, CABA"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tarjeta">Número de Tarjeta</Label>
                    <Input
                      id="tarjeta"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={tarjeta}
                      onChange={(e) => setTarjeta(e.target.value)}
                      required
                      minLength={16}
                      maxLength={19}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">
                      Solo se almacenarán los últimos 4 dígitos
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Procesando...' : 'Confirmar Compra'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {carrito.items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b">
                      <div className="relative w-16 h-16 bg-gray-100 rounded">
                        <Image
                          src={`${API_URL}/${item.imagen}`}
                          alt={item.titulo}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.titulo}</h4>
                        <p className="text-xs text-gray-600">Cantidad: {item.cantidad}</p>
                        <p className="text-sm font-semibold">${item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${carrito.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA</span>
                      <span className="font-medium">${carrito.iva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-blue-600">${carrito.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
