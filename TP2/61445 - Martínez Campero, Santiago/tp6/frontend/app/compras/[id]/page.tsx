'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { obtenerCompraDetalle } from '@/app/services/compras';
import { Compra } from '@/app/types';
import Link from 'next/link';
import Image from 'next/image';

export default function CompraDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [compra, setCompra] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarCompra = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const datos = await obtenerCompraDetalle(parseInt(id));
        setCompra(datos);
      } catch (err) {
        setError('No se pudo cargar la compra');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarCompra();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Cargando compra...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !compra) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl text-red-600 mb-4">{error || 'Compra no encontrada'}</p>
            <Link href="/compras">
              <Button>Volver a Mis Compras</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/compras" className="text-primary hover:underline mb-6 inline-block">
          ← Volver a Mis Compras
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Compra #{compra.id}
                </h1>
                <p className="text-gray-600">
                  {new Date(compra.fecha).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  compra.estado === 'completada'
                    ? 'bg-green-100 text-green-800'
                    : compra.estado === 'pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {compra.estado === 'completada'
                    ? 'Completada'
                    : compra.estado === 'pendiente'
                    ? 'Pendiente'
                    : 'Cancelada'}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos</h2>
            <div className="space-y-4">
              {compra.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-6 p-6 bg-gray-50 rounded-lg"
                >
                  <div className="relative w-24 h-24 shrink-0 bg-white rounded-lg border">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${item.imagen}`}
                      alt={item.nombre}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.nombre}
                    </h3>
                    <div className="space-y-1 text-gray-600">
                      <p>Cantidad: <span className="font-medium">{item.cantidad}</span></p>
                      <p>Precio unitario: <span className="font-medium">${item.precio_unitario.toFixed(2)}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${item.precio_total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen financiero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Información de Envío</h2>
              <div className="space-y-3 text-gray-700">
                <p><span className="font-medium">Estado:</span> Pendiente de envío</p>
                <p><span className="font-medium">Método:</span> Envío a domicilio</p>
                <p><span className="font-medium">Costo:</span> ${compra.envio.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen de Pago</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">${compra.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">IVA (21%):</span>
                  <span className="font-medium">${compra.iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-700">Envío:</span>
                  <span className="font-medium">${compra.envio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total:</span>
                  <span>${compra.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-4">
            <Button className="flex-1">Descargar Factura</Button>
            <Link href="/productos" className="flex-1">
              <Button variant="outline" className="w-full">
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
