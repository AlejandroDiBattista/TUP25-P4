"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Compra = {
  id: string;
  fecha: string;
  items: Array<{
    id: number;
    titulo: string;
    cantidad: number;
    subtotal: number;
    iva: number;
  }>;
  resumen: {
    subtotal?: number;
    iva?: number;
    envio?: number;
    total?: number;
  };
};

export default function ComprasPage() {
  const router = useRouter();
  const { token, isAuthenticated, loading, error: authError } = useAuth();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const cargarCompras = useCallback(async () => {
    if (!token) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/compras`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || 'No se pudieron obtener las compras');
      }
      const data = await response.json();
      setCompras(data.compras || []);
    } catch (err: any) {
      setError(err.message || 'Error inesperado al cargar las compras');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (authError) {
      setError(authError);
      return;
    }
    cargarCompras();
  }, [isAuthenticated, loading, authError, router, cargarCompras]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handler = () => cargarCompras();
    window.addEventListener('compras-actualizadas', handler);
    return () => {
      window.removeEventListener('compras-actualizadas', handler);
    };
  }, [cargarCompras]);

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-black">Mis compras</h1>
      {isLoading && <p className="text-gray-600">Cargando tus compras...</p>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {!isLoading && !error && compras.length === 0 && (
        <p className="text-black">Todavía no registramos compras. Cuando finalices una, aparecerá aquí.</p>
      )}
      <div className="space-y-4">
        {compras.map((compra) => (
          <div key={compra.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Compra #{compra.id.split('-')[0]}</span>
              <span className="text-sm text-gray-500">
                {new Date(compra.fecha).toLocaleString('es-AR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <div className="space-y-2">
              {compra.items.map((item) => (
                <div key={`${compra.id}-${item.id}`} className="flex justify-between text-sm text-gray-700">
                  <span>{item.titulo} x{item.cantidad}</span>
                  <span>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {compra.resumen && (
              <div className="border-t border-gray-200 mt-3 pt-3 text-sm text-gray-700 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>${(compra.resumen.subtotal ?? 0).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>IVA</span><span>${(compra.resumen.iva ?? 0).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Envío</span><span>${(compra.resumen.envio ?? 0).toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-gray-900"><span>Total</span><span>${(compra.resumen.total ?? 0).toFixed(2)}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
