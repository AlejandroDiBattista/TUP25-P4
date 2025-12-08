'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { obtenerCarrito, finalizarCompra, vaciarCarrito } from '../services/carrito';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatearPrecio } from '../utils/format';

interface CartItem {
  id: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
    categoria: string;
  };
  cantidad: number;
  subtotal: number;
}

interface CarritoResponse {
  items: CartItem[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const cargarCarrito = async () => {
      try {
        setIsLoading(true);
        const carritoData = await obtenerCarrito();
        setCarrito(carritoData);
      } catch (error) {
        console.error('Error cargando carrito:', error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarCarrito();
  }, [user, router]);

  const handleConfirmarCompra = async () => {
    if (!direccion.trim() || !tarjeta.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await finalizarCompra({ direccion, tarjeta });
      await vaciarCarrito();
      router.push(`/compras?success=true&total=${result.total}`);
    } catch (error) {
      console.error('Error procesando compra:', error);
      alert('Error al procesar la compra');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
            <Button onClick={() => router.push('/')}>
              Volver a la tienda
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen del carrito */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del carrito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {carrito.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.producto.nombre}</h3>
                    <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${formatearPrecio(item.subtotal)}</p>
                    <p className="text-xs text-gray-500">IVA: ${formatearPrecio(item.subtotal * 0.21)}</p>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total productos:</span>
                  <span>${formatearPrecio(carrito.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA:</span>
                  <span>${formatearPrecio(carrito.iva)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span>
                    {carrito.envio === 0 ? (
                      <span className="text-green-600 font-bold">GRATIS!!!</span>
                    ) : (
                      `$${formatearPrecio(carrito.envio)}`
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total a pagar:</span>
                  <span>${formatearPrecio(carrito.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos de envío */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <Input
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ingresa tu dirección completa"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="tarjeta" className="block text-sm font-medium text-gray-700 mb-2">
                  Tarjeta
                </label>
                <Input
                  id="tarjeta"
                  value={tarjeta}
                  onChange={(e) => setTarjeta(e.target.value)}
                  placeholder="Número de tarjeta"
                  className="w-full"
                />
              </div>
              
              <Button
                onClick={handleConfirmarCompra}
                disabled={!direccion.trim() || !tarjeta.trim() || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Procesando...' : 'Confirmar compra'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}