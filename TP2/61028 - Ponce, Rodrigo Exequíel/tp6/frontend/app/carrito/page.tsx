// frontend/app/carrito/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { CarritoResponse, ItemCarritoResponse } from '../types';
import { obtenerCarrito } from '../services/carrito';
import { finalizarCompra } from '../services/compra'; // <-- ¡Esta ruta ahora funcionará!

// --- ¡ESTE ES EL BLOQUE CORREGIDO! ---
// Todas las rutas de 'shadcn' deben apuntar a 'components/ui/'
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/card';
import { Separator } from '../../components/ui/separator'; // <-- ¡Esta ruta ahora funcionará!
// --- FIN DE LA CORRECCIÓN ---

export default function CarritoPage() {
  const { token, isLoggedIn } = useAuth();
  const router = useRouter();
  
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      alert("Debes iniciar sesión para ver tu carrito.");
      router.push('/login');
      return;
    }

    const fetchCarrito = async () => {
      if (token) {
        try {
          setIsLoading(true);
          const data = await obtenerCarrito(token);
          setCarrito(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar el carrito');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isLoggedIn && token) {
      fetchCarrito();
    }
  }, [token, isLoggedIn, router]);

  const handleFinalizarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !carrito || carrito.items.length === 0) {
      setError("El carrito está vacío o no se pudo procesar.");
      return;
    }
    
    if (direccion.length < 5 || tarjeta.length < 10) {
      setError("Por favor, completa la dirección y los datos de la tarjeta.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await finalizarCompra({ direccion, tarjeta }, token);
      
      setCarrito(null);
      // Lo mandamos al historial (Commit 10)
      router.push('/compras'); 

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la compra');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-8">Cargando carrito...</div>;
  }

  if (error && !carrito) {
    return <div className="max-w-4xl mx-auto p-8 text-red-500">{error}</div>;
  }

  if (!carrito || carrito.items.length === 0) {
    return <div className="max-w-4xl mx-auto p-8">Tu carrito está vacío.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Tu Carrito</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        
        <div className="md:col-span-2 space-y-4">
          {carrito.items.map((item) => (
            <Card key={item.id} className="flex items-center p-4">
              <div className="flex-grow">
                <h3 className="font-semibold">{item.nombre_producto}</h3>
                <p className="text-sm text-gray-500">
                  {item.cantidad} x ${item.precio_unitario.toFixed(2)}
                </p>
              </div>
              <div className="font-semibold">
                ${item.subtotal.toFixed(2)}
              </div>
            </Card>
          ))}
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Compra</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleFinalizarCompra}>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({carrito.cantidad_items} items):</span>
                    <span className="font-semibold">${carrito.total.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    (IVA y envío se calcularán en el backend)
                  </p>
                  
                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección de Envío</Label>
                    <Input
                      id="direccion"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Calle Falsa 123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tarjeta">Datos de Pago (Tarjeta)</Label>
                    <Input
                      id="tarjeta"
                      value={tarjeta}
                      onChange={(e) => setTarjeta(e.target.value)}
                      placeholder="1234-5678-9012-3456"
                      required
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <Button
                type="submit"
                form="checkout-form"
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? "Procesando..." : `Finalizar Compra ($${carrito.total.toFixed(2)})`}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
      </div>
    </div>
  );
}