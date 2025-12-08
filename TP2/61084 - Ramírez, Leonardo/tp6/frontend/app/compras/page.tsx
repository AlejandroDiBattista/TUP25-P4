'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Compra {
  id: number;
  usuario: string;
  items: any[];
  total: number;
  direccion: string;
  fecha: string;
}

export default function ComprasPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }

    const loadCompras = async () => {
      try {
        const response = await fetch(`${API_URL}/compras`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar compras');
        }

        const data = await response.json();
        setCompras(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar compras');
      } finally {
        setIsLoading(false);
      }
    };

    loadCompras();
  }, [token, router, API_URL]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-light tracking-tight">Mis compras</h1>
          <a
            href="/"
            className="border border-black hover:bg-black hover:text-white text-black px-6 py-2 transition-colors text-sm uppercase tracking-wider"
          >
            Volver al inicio
          </a>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-black text-black text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Cargando compras...</div>
        ) : compras.length === 0 ? (
          <div className="border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-6">No tienes compras realizadas</p>
            <a href="/" className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 transition-colors inline-block text-sm uppercase tracking-wider">
              Ir al catálogo
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {compras.map((compra) => (
              <div
                key={compra.id}
                className="border border-gray-200 p-6 hover:border-black transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Número de compra</p>
                    <p className="text-base font-normal">#{compra.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Fecha</p>
                    <p className="text-base font-normal">
                      {new Date(compra.fecha).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Artículos</p>
                    <p className="text-base font-normal">{compra.items.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Total</p>
                    <p className="text-base font-normal">${compra.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Envío a:</p>
                  <p className="text-gray-800 text-sm">{compra.direccion}</p>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => router.push(`/compras/${compra.id}`)}
                    className="border border-black hover:bg-black hover:text-white text-black px-6 py-2 transition-colors text-sm uppercase tracking-wider"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
