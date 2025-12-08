'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { obtenerHistorialCompras } from '../services/compras';
import { Compra } from '../types';

export default function MisComprasPage() {
  const router = useRouter();
  const { estaLogueado, cargando: cargandoAuth } = useAuth();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirigir si no está logueado
  useEffect(() => {
    if (!cargandoAuth && !estaLogueado) {
      router.push('/login');
    }
  }, [estaLogueado, cargandoAuth, router]);

  // Cargar compras
  useEffect(() => {
    const cargarCompras = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await obtenerHistorialCompras();
        setCompras(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar compras');
      } finally {
        setLoading(false);
      }
    };

    if (estaLogueado) {
      cargarCompras();
    }
  }, [estaLogueado]);

  if (cargandoAuth) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!estaLogueado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">📦 Mis Compras</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-800">Cargando compras...</p>
          </div>
        ) : compras.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-3xl mb-4">🛍️</p>
            <h2 className="text-2xl font-semibold mb-4">Sin compras aún</h2>
            <p className="text-gray-800 mb-6">No tienes compras registradas</p>
            <Link
              href="/productos"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Comenzar a Comprar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {compras.map((compra) => (
              <Link
                key={compra.id}
                href={`/compra/${compra.id}`}
              >
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Número de Compra */}
                    <div>
                      <p className="text-sm text-gray-800">Número de Compra</p>
                      <p className="text-2xl font-bold text-blue-600">#{compra.id}</p>
                    </div>

                    {/* Fecha */}
                    <div>
                      <p className="text-sm text-gray-800">Fecha</p>
                      <p className="font-semibold">
                        {new Date(compra.fecha).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Cantidad de Items */}
                    <div>
                      <p className="text-sm text-gray-800">Items</p>
                      <p className="font-semibold">
                        {compra.items.length} producto{compra.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <p className="text-sm text-gray-800">Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${compra.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Dirección (oculta en mobile) */}
                  <div className="mt-4 pt-4 border-t hidden md:block">
                    <p className="text-sm text-gray-800">📍 {compra.direccion}</p>
                  </div>


                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
