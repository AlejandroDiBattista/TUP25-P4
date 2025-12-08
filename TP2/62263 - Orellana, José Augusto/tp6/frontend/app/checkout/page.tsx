import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { obtenerCarrito, obtenerPerfil } from '../services/usuarios';
import { calcularEnvio, IVA_TASA } from '../lib/precios';
import { formatCurrency } from '../lib/format';
import CheckoutForm from '@/app/checkout/CheckoutForm';

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  }

  const usuario = await obtenerPerfil(token.value);

  if (!usuario) {
    redirect('/login');
  }

  const carrito = await obtenerCarrito(token.value);

  if (!carrito || carrito.items.length === 0) {
    redirect('/');
  }

  const subtotal = carrito.items.reduce((acum, item) => acum + item.producto.precio * item.cantidad, 0);
  const iva = subtotal * IVA_TASA;
  const envio = calcularEnvio(subtotal);
  const total = subtotal + iva + envio;

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Finalizar compra</h1>
        <p className="text-sm text-slate-500">Revisa los detalles antes de confirmar tu pedido.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Resumen del carrito</h2>
            <span className="text-sm text-slate-500">{usuario.nombre}</span>
          </div>

          <div className="space-y-4">
            {carrito.items.map((item) => {
              const itemTotal = item.producto.precio * item.cantidad;
              const itemIva = itemTotal * IVA_TASA;

              return (
                <article key={item.id} className="space-y-1 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.producto.titulo}</p>
                      <p className="text-xs text-slate-500">Cantidad: {item.cantidad}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(itemTotal)}</span>
                  </div>
                  <p className="text-xs text-slate-400">IVA: {formatCurrency(itemIva)}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-6 space-y-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Total productos</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA</span>
              <span>{formatCurrency(iva)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>{formatCurrency(envio)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-slate-900">
              <span>Total a pagar</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Datos de envío</h2>
          <CheckoutForm />
        </div>
      </div>
    </section>
  );
}
