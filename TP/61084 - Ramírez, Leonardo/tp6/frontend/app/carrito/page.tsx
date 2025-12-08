'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { useRouter } from 'next/navigation';
import { Producto } from '../types';

export default function CarritoPage() {
  const { token } = useAuth();
  const { items, quitarDelCarrito, actualizarCantidad, agregarAlCarrito } = useCarrito();
  const [productos, setProductos] = useState<{ [key: number]: Producto }>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }

    // Obtener detalles de productos en el carrito
    const loadProductos = async () => {
      try {
        const productosMap: { [key: number]: Producto } = {};
        for (const item of items) {
          const response = await fetch(`${API_URL}/productos/${item.producto_id}`);
          if (response.ok) {
            const producto = await response.json();
            productosMap[item.producto_id] = producto;
          }
        }
        setProductos(productosMap);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductos();
  }, [items, token, router, API_URL]);

  const subtotal = items.reduce((sum: number, item: any) => {
    const producto = productos[item.producto_id];
    return sum + (producto?.precio || 0) * item.cantidad;
  }, 0);

  // Calcular IVA diferenciado: 10% para electrónicos, 21% para otros
  const calcularIVATotal = () => {
    return items.reduce((sum: number, item: any) => {
      const producto = productos[item.producto_id];
      if (!producto) return sum;
      const itemSubtotal = producto.precio * item.cantidad;
      const categoria = producto.categoria?.toLowerCase() || '';
      const tasaIVA = categoria.includes('electr') ? 0.10 : 0.21;
      return sum + (itemSubtotal * tasaIVA);
    }, 0);
  };

  const ivaTotal = calcularIVATotal();
  const envio = (subtotal + ivaTotal) > 1000 ? 0 : 50;
  const total = subtotal + ivaTotal + envio;

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-light tracking-tight">Carrito de compras</h1>
          <a
            href="/"
            className="border border-black hover:bg-black hover:text-white text-black px-6 py-2 transition-colors text-sm uppercase tracking-wider"
          >
            Seguir comprando
          </a>
        </div>

        {items.length === 0 ? (
          <div className="border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-6">Tu carrito está vacío</p>
            <a href="/" className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 transition-colors inline-block text-sm uppercase tracking-wider">
              Continuar comprando
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="border border-gray-200">
                {items.map((item: any) => {
                  const producto = productos[item.producto_id];
                  if (!producto) return null;
                  return (
                    <div
                      key={item.producto_id}
                      className="flex items-center justify-between p-6 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-normal text-black mb-1">{producto.titulo}</h3>
                        <p className="text-gray-500 text-sm">${producto.precio}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                            disabled={item.cantidad <= 1}
                            className="border border-gray-400 px-2 py-1 text-sm disabled:opacity-40"
                          >-
                          </button>
                          <span className="text-base text-gray-700 w-6 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                            disabled={producto.existencia !== undefined && item.cantidad >= producto.existencia}
                            title={producto.existencia !== undefined && item.cantidad >= producto.existencia ? 'Stock máximo disponible alcanzado' : ''}
                            className="border border-gray-400 px-2 py-1 text-sm disabled:opacity-40"
                          >+
                          </button>
                        </div>
                        <p className="text-base font-normal text-black min-w-[80px] text-right">${(producto.precio * item.cantidad).toFixed(2)}</p>
                        <button
                          onClick={() => quitarDelCarrito(item.producto_id)}
                          className="border border-black hover:bg-black hover:text-white text-black px-4 py-1.5 transition-colors text-sm"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-gray-200 p-6 h-fit">
              <h2 className="text-lg font-normal mb-6 tracking-tight">Resumen</h2>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="text-black">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">IVA (10% electrónicos, 21% otros):</span>
                  <span className="text-black">${ivaTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Envío { (subtotal + ivaTotal) > 1000 ? '(gratis)' : '' }:</span>
                  <span className="text-black">${envio.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-black">Total:</span>
                  <span className="text-black font-normal">${total.toFixed(2)}</span>
                </div>
              </div>
              <a
                href="/checkout"
                className="w-full bg-black hover:bg-gray-800 text-white font-normal py-2.5 px-4 block text-center transition-colors text-sm uppercase tracking-wider"
              >
                Ir al checkout
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
