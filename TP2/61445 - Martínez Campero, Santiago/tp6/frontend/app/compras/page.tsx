'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { obtenerCompras } from '@/app/services/compras';
import { Compra } from '@/app/types';
import Link from 'next/link';
import Image from 'next/image';

function ComprasContent({ success }: { success: boolean }) {
  const router = useRouter();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => {
    const cargarCompras = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        const datos = await obtenerCompras();
        setCompras(datos);
      } catch (err) {
        setError('No se pudieron cargar las compras');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarCompras();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Cargando compras...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/productos" className="text-primary hover:underline inline-block mb-4">
          ← Volver
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Mis Compras</h1>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">¡Compra realizada exitosamente!</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {compras.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-2xl text-gray-600 mb-6">No tienes compras aún</p>
            <Link href="/productos">
              <Button>Empezar a Comprar</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Total de Compras</p>
                <p className="text-3xl font-bold text-primary">{compras.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Monto Total</p>
                <p className="text-3xl font-bold text-primary">
                  ${compras.reduce((sum, c) => sum + c.total, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Completadas</p>
                <p className="text-3xl font-bold text-primary">
                  {compras.filter((c) => c.estado === 'completada').length}
                </p>
              </div>
            </div>

            {compras.map((compra) => (
              <div key={compra.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div
                  onClick={() =>
                    setExpandido(expandido === compra.id ? null : compra.id)
                  }
                  className="p-6 cursor-pointer hover:bg-gray-50 transition flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-900">Compra #{compra.id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(compra.fecha).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${compra.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {expandido === compra.id && (
                  <div className="border-t bg-gray-50 p-6 space-y-4">
                    {compra.items.map((item) => (
                      <div key={item.id} className="flex gap-4 bg-white p-4 rounded">
                        <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${item.imagen}`}
                            alt={item.nombre}
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.nombre}</p>
                          <p className="text-sm text-gray-600">
                            {item.cantidad} x ${item.precio_unitario.toFixed(2)}
                          </p>
                        </div>
                        <div className="font-semibold">
                          ${item.precio_total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                    <Link href={`/compras/${compra.id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        Ver Detalle
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ComprasPage() {
  const success = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('success') === 'true'
    : false;

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ComprasContent success={success} />
    </Suspense>
  );
}
