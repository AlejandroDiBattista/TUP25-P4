'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Producto } from '../types';

export default function CheckoutPage() {
  const { token } = useAuth();
  const { items, vaciarCarrito } = useCarrito();
  const router = useRouter();
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [productos, setProductos] = useState<{ [key: number]: Producto }>({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!token) {
      router.push('/auth');
      return;
    }
    
    // Solo redirigir si después de 300ms sigue sin items
    const timer = setTimeout(() => {
      if (items.length === 0) {
        router.push('/carrito');
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [mounted, token, items.length, router]);

  // Cargar detalles de productos para calcular IVA y totales
  useEffect(() => {
    if (!mounted || !token) return;
    const loadProductos = async () => {
      try {
        const productosMap: { [key: number]: Producto } = {};
        for (const item of items) {
          const resp = await fetch(`${API_URL}/productos/${item.producto_id}`);
          if (resp.ok) {
            const prod = await resp.json();
            productosMap[item.producto_id] = prod;
          }
        }
        setProductos(productosMap);
      } catch (e) {
        console.error('Error al cargar productos en checkout:', e);
      }
    };
    loadProductos();
  }, [mounted, token, items, API_URL]);

  const subtotal = items.reduce((sum: number, it) => {
    const p = productos[it.producto_id];
    return sum + (p?.precio || 0) * it.cantidad;
  }, 0);

  const calcularIVAItem = (p: Producto | undefined, cantidad: number) => {
    if (!p) return 0;
    const base = p.precio * cantidad;
    const categoria = p.categoria?.toLowerCase() || '';
    const tasa = categoria.includes('electr') ? 0.10 : 0.21;
    return base * tasa;
  };

  const ivaTotal = items.reduce((sum: number, it) => sum + calcularIVAItem(productos[it.producto_id], it.cantidad), 0);
  const envio = (subtotal + ivaTotal) > 1000 ? 0 : 50;
  const total = subtotal + ivaTotal + envio;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Sincronizar carrito local -> backend para evitar "Carrito vacío"
      // Vaciar carrito del backend primero (idempotente)
      await fetch(`${API_URL}/carrito/cancelar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      // Volver a cargar los items desde el estado local al backend
      for (const it of items) {
        await fetch(`${API_URL}/carrito`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ producto_id: it.producto_id, cantidad: it.cantidad }),
        });
      }

      const response = await fetch(`${API_URL}/carrito/finalizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ direccion, tarjeta }),
      });

      if (!response.ok) {
        // intentar mostrar detalle del backend
        try {
          const errJson = await response.json();
          throw new Error(errJson.detail || 'Error al finalizar compra');
        } catch {
          throw new Error('Error al finalizar compra');
        }
      }

      const data = await response.json();
      vaciarCarrito();
      router.push(`/compras/${data.compra_id}`);
    } catch (err: any) {
      setError(err.message || 'Error en el proceso de compra');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !mounted) return null;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-light tracking-tight">Finalizar compra</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen del carrito */}
          <div className="border border-gray-200 p-8">
            <h2 className="text-lg font-normal mb-6 tracking-tight">Resumen del carrito</h2>

            <div className="space-y-4 mb-6">
              {items.map((it) => {
                const p = productos[it.producto_id];
                if (!p) return null;
                const ivaItem = calcularIVAItem(p, it.cantidad);
                const totalItem = p.precio * it.cantidad + ivaItem;
                return (
                  <div key={it.producto_id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm text-black mb-1">{p.titulo}</p>
                      <p className="text-xs text-gray-500">Cantidad: {it.cantidad}</p>
                      <p className="text-xs text-gray-500">IVA: ${ivaItem.toFixed(2)}</p>
                    </div>
                    <div className="text-sm text-black">${totalItem.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Total productos</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">IVA</span><span>${ivaTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Envío{envio === 0 ? ' (gratis)' : ''}</span><span>${envio.toFixed(2)}</span></div>
            </div>

            <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
              <span className="font-normal">Total a pagar</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Formulario de pago/envío */}
          <form onSubmit={handleSubmit} className="border border-gray-200 p-8 space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2 uppercase tracking-wider">Dirección de envío</label>
              <textarea
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
                placeholder="Calle, número, apartamento, ciudad..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2 uppercase tracking-wider">Número de tarjeta</label>
              <input
                type="text"
                value={tarjeta}
                onChange={(e) => setTarjeta(e.target.value.replace(/\s/g, ''))}
                required
                maxLength={16}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
                placeholder="1234 5678 9012 3456"
              />
              <p className="text-xs text-gray-400 mt-2">Se aceptan tarjetas de prueba como 4111111111111111</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white font-normal py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm uppercase tracking-wider"
            >
              {isLoading ? 'Procesando...' : 'Confirmar compra'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
