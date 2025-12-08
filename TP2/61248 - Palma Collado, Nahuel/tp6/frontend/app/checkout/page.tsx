'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import AppHeader from '../components/AppHeader';
import CartItemsList from '../components/CartItemsList';
import { useAuth } from '../providers/AuthProvider';
import { useCart } from '../providers/CartProvider';
import { finalizarCarrito } from '../services/cart';

export default function CheckoutPage() {
  const router = useRouter();
  const { usuario, token } = useAuth();
  const { carrito, refrescar } = useCart();
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!usuario || !token) {
    router.push('/login');
    return null;
  }

  if (!carrito || carrito.total_items === 0) {
    return (
      <div className="min-h-screen bg-slate-100">
        <AppHeader />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Carrito vacío</h1>
            <p className="mt-2 text-sm text-slate-500">
              No tenés productos en el carrito para finalizar la compra.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Ir al catálogo
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      await finalizarCarrito(token, { direccion, tarjeta });
      await refrescar();
      router.push('/orders');
    } catch (err) {
      console.error(err);
      const mensaje = err instanceof Error ? err.message : 'No se pudo finalizar la compra. Intente nuevamente.';
      setError(mensaje);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 lg:flex-row">
        <section className="w-full space-y-6 lg:w-2/3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Finalizar compra</h1>
            <p className="mt-1 text-sm text-slate-500">
              Completá los datos de envío y pago para confirmar tu pedido.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Dirección de envío
                <input
                  type="text"
                  value={direccion}
                  onChange={(event) => setDireccion(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Calle, número, ciudad, provincia"
                  required
                  minLength={6}
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Número de tarjeta
                <input
                  type="text"
                  value={tarjeta}
                  onChange={(event) => setTarjeta(event.target.value.replace(/\D/g, ''))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="1234 5678 9012 3456"
                  required
                  minLength={12}
                  maxLength={19}
                />
              </label>

              <button
                type="submit"
                disabled={pending}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {pending ? 'Procesando...' : 'Confirmar compra'}
              </button>
            </form>
          </div>
        </section>

        <aside className="w-full space-y-6 lg:w-1/3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Resumen del pedido</h2>
            <div className="mt-4">
              <CartItemsList />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>${carrito.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>IVA</span>
                <span>${carrito.iva.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Envío</span>
                <span>{carrito.envio === 0 ? 'Gratis' : `$${carrito.envio.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-semibold text-slate-800">
              <span>Total</span>
              <span>${carrito.total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
