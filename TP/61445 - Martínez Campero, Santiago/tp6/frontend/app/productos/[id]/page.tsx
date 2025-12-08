'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { obtenerProducto } from '@/app/services/productos';
import { agregarAlCarrito } from '@/app/services/carrito';
import { Producto } from '@/app/types';
import Link from 'next/link';
import { useToast } from '@/app/hooks/useToast';

export default function ProductoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { agregarToast } = useToast();
  const id = params.id as string;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setLoading(true);
        setError(null);
        const datos = await obtenerProducto(parseInt(id));
        setProducto(datos);
      } catch (err) {
        setError('No se pudo cargar el producto');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id]);

  const handleAgregarAlCarrito = async () => {
    if (!producto) return;

    try {
      setAgregando(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      await agregarAlCarrito(producto.id, cantidad);
      agregarToast('Producto agregado al carrito', 'success', 2000);
      router.push('/carrito');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al agregar al carrito';
      setError(mensaje);
      agregarToast(mensaje, 'error', 3000);
      console.error('Error:', err);
    } finally {
      setAgregando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Cargando producto...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl text-red-600 mb-4">{error || 'Producto no encontrado'}</p>
            <Link href="/productos">
              <Button>Volver a Productos</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/productos" className="text-primary hover:underline mb-6 inline-block">
          ← Volver a Productos
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Imagen */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 min-h-96">
              <div className="text-center">
                <p className="text-gray-500">Imagen no disponible</p>
                <p className="text-6xl mt-4">📦</p>
              </div>
            </div>

            {/* Detalles */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {producto.nombre}
                </h1>
                <p className="text-gray-600 text-sm">
                  Categoría: <span className="font-semibold">{producto.categoria}</span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {producto.descripcion}
                </p>
              </div>

              {/* Precio y Stock */}
              <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Precio</p>
                  <p className="text-4xl font-bold text-primary">
                    ${producto.precio.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Existencia Disponible</p>
                  <p className={`text-2xl font-semibold ${
                    producto.existencia > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {producto.existencia} unidades
                  </p>
                </div>
              </div>

              {/* Cantidad y Agregar al Carrito */}
              {producto.existencia > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={producto.existencia}
                        value={cantidad}
                        onChange={(e) => setCantidad(Math.min(producto.existencia, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <button
                        onClick={() => setCantidad(Math.min(producto.existencia, cantidad + 1))}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAgregarAlCarrito}
                    disabled={agregando}
                    className="w-full h-12 text-lg"
                  >
                    {agregando ? 'Agregando...' : 'Agregar al Carrito'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    disabled
                    className="w-full h-16 text-2xl font-bold bg-red-500 text-white rounded-lg cursor-not-allowed opacity-90"
                  >
                    AGOTADO
                  </button>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium text-center">
                      Este producto no tiene stock disponible
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
