"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useCarrito } from '../hooks/useCarrito';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Carrito() {
  const router = useRouter();
  const { token } = useAuth();
  const { obtenerCarrito, quitarDelCarrito, cancelarCompra, agregarAlCarrito } = useCarrito();
  const [carrito, setCarrito] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setCarrito(null);
      setError('');
      setSuccess('');
      return;
    }
    cargarCarrito();
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      if (!token) return;
      cargarCarrito();
    };
    window.addEventListener('carrito-actualizado', handler);
    return () => window.removeEventListener('carrito-actualizado', handler);
  }, [token]);

  async function cargarCarrito() {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await obtenerCarrito();
      setCarrito(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSumar(item: any) {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await agregarAlCarrito({ id: item.id, existencia: 1 });
      setSuccess('Cantidad aumentada');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuitar(producto_id: number) {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await quitarDelCarrito(producto_id);
      setSuccess('Producto quitado del carrito');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFinalizar() {
    router.push('/finalizar');
  }

  async function handleCancelar() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await cancelarCompra();
      setSuccess('Carrito cancelado');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full lg:w-[400px] border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Carrito de compras</h2>
      {loading && (!carrito || !carrito.carrito?.length) && (
        <div className="text-gray-700">Cargando carrito...</div>
      )}
      {success && <div className="bg-green-100 text-green-800 p-2 rounded mb-3 text-sm font-medium">{success}</div>}
      {error && (!carrito || !carrito.carrito?.length) && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm font-medium">{error}</div>
      )}
      {!carrito || !carrito.carrito?.length ? (
        <div className="text-gray-600">El carrito está vacío.</div>
      ) : (
        <>
          <ul className="mb-6 flex flex-col gap-4">
            {carrito.carrito.map((item: any) => (
              <li key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                  <Image
                    src={`${API_URL}/${item.imagen}`}
                    alt={item.titulo}
                    fill
                    className="object-contain"
                    loading="eager"
                    unoptimized
                  />
                </div>
                <div className="flex-1 text-gray-900">
                  <p className="font-semibold leading-tight">{item.titulo}</p>
                  <p className="text-sm text-gray-500">${item.precio_unitario.toFixed(2)} c/u</p>
                  <p className="text-sm text-gray-500">IVA: ${item.iva.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 rounded-md bg-red-200 text-red-800 text-sm font-semibold hover:bg-red-300 transition-colors"
                      onClick={() => handleQuitar(item.id)}
                    >
                      -
                    </button>
                    <span className="text-sm text-gray-700">{item.cantidad}</span>
                    <button
                      className="px-2 py-1 rounded-md bg-green-200 text-green-800 text-sm font-semibold hover:bg-green-300 transition-colors"
                      onClick={() => handleSumar(item)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 pt-4 mt-2 space-y-2 text-sm text-gray-900">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal</span>
              <span>${carrito.resumen.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">IVA</span>
              <span>${carrito.resumen.iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Envío</span>
              <span>${carrito.resumen.envio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span>${carrito.resumen.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors"
              onClick={handleCancelar}
            >
              Cancelar
            </button>
            <button
              className="flex-1 bg-blue-900 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-800 transition-colors"
              onClick={handleFinalizar}
            >
              Continuar compra
            </button>
          </div>
        </>
      )}
    </div>
  );
}
