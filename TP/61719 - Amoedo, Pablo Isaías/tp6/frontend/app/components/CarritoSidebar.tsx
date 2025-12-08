'use client';

import { useCarrito } from '@/app/context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { eliminarDelCarrito, cancelarCarrito } from '../services/carrito';

export default function CarritoSidebar({ mostrar, setMostrar }: { readonly mostrar: boolean; readonly setMostrar: (value: boolean) => void }) {
  const { carrito, refreshCarrito } = useCarrito();
  const router = useRouter();

  const handleEliminar = async (producto_id: number) => {
    try {
      await eliminarDelCarrito(producto_id);
      await refreshCarrito();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleCancelar = async () => {
    try {
      await cancelarCarrito();
      await refreshCarrito();
    } catch (error) {
      console.error('Error al cancelar:', error);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="w-1/3 bg-white p-6 shadow-lg overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Carrito</h2>
        <button onClick={() => setMostrar(false)} className="text-gray-600">✕</button>
      </div>

      {!carrito || carrito.carrito.length === 0 ? (
        <p className="text-gray-600">Tu carrito está vacío</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {carrito.carrito.map(item => (
              <div key={item.producto_id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{item.nombre}</p>
                    <p className="text-sm text-gray-600">
                      ${item.precio_unitario.toFixed(2)} x {item.cantidad}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEliminar(item.producto_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-right font-semibold">${item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${carrito.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA:</span>
              <span>${carrito.iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío:</span>
              <span>${carrito.envio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${carrito.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => router.push('/checkout')}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Continuar compra
            </Button>
            <Button
              onClick={handleCancelar}
              className="w-full bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              Cancelar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
