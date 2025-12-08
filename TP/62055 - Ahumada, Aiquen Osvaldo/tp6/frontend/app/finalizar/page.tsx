"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../hooks/useAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function FinalizarCompraPage() {
  const router = useRouter();
  const { isAuthenticated, error: authError, loading: authLoading } = useAuth();
  const { obtenerCarrito, finalizarCompra } = useCarrito();

  const [carrito, setCarrito] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ direccion: '', tarjeta: '' });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      if (authError) {
        setError(authError);
      }
      router.push('/login');
      return;
    }

    if (authError) {
      setError(authError);
      return;
    }
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await obtenerCarrito();
        if (!data || !data.carrito?.length) {
          setError('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
        }
        setCarrito(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [isAuthenticated, authError, authLoading, router, obtenerCarrito]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'tarjeta') {
      nextValue = value.replace(/\D/g, '').slice(0, 16);
    }
    setForm(prev => ({ ...prev, [name]: nextValue }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.direccion.trim() || !form.tarjeta.trim()) {
      setError('Completa todos los datos para el envío.');
      return;
    }
    if (form.tarjeta.length !== 16) {
      setError('La tarjeta debe tener exactamente 16 dígitos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await finalizarCompra();
      setSuccess('Compra confirmada. ¡Gracias por tu pedido!');
      setForm({ direccion: '', tarjeta: '' });
      const data = await obtenerCarrito();
      setCarrito(data);
      setTimeout(() => router.push('/productos'), 1600);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const items = carrito?.carrito ?? [];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <button
          className="text-sm text-blue-900 font-semibold mb-6 hover:underline"
          onClick={() => router.push('/productos')}
        >
          ← Volver a productos
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar compra</h1>
        {authError && <p className="text-red-600 text-sm mb-3">{authError}</p>}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del carrito</h2>
            {loading && !items.length && <p className="text-gray-600">Cargando carrito...</p>}
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            {!loading && !items.length && !error && (
              <p className="text-gray-600">Tu carrito está vacío.</p>
            )}
            <div className="space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={`${API_URL}/${item.imagen}`}
                      alt={item.titulo}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 text-gray-900">
                    <p className="font-semibold leading-tight">{item.titulo}</p>
                    <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                    <p className="text-sm text-gray-500">IVA: ${item.iva.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">${item.precio_unitario.toFixed(2)} c/u</p>
                  </div>
                </div>
              ))}
            </div>
            {carrito?.resumen && (
              <div className="border-t border-gray-200 mt-6 pt-4 space-y-2 text-gray-900 text-sm">
                <div className="flex justify-between">
                  <span>Total productos:</span>
                  <span>${carrito.resumen.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA:</span>
                  <span>${carrito.resumen.iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>${carrito.resumen.envio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total a pagar:</span>
                  <span>${carrito.resumen.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos de envío</h2>
            {success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm font-medium">{success}</div>}
            {error && items.length > 0 && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-medium">{error}</div>}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="direccion">Dirección</label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-gray-900"
                  placeholder="Ej. Av. Siempre Viva 742"
                  value={form.direccion}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tarjeta">Tarjeta</label>
                <input
                  id="tarjeta"
                  name="tarjeta"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-gray-900"
                  placeholder="XXXXXXXXXXXXXXXX"
                  value={form.tarjeta}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="\d{16}"
                  maxLength={16}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-900 text-white py-2 rounded-md font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
                disabled={loading || !items.length}
              >
                {loading ? 'Procesando...' : 'Confirmar compra'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
