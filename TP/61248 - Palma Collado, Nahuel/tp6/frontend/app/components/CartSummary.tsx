'use client';

import { useCart } from '../providers/CartProvider';

interface CartSummaryProps {
  onIrCheckout?: () => void;
  onCancelar?: () => void;
}

export default function CartSummary({ onIrCheckout, onCancelar }: CartSummaryProps) {
  const { carrito, cargando, cancelar } = useCart();

  if (!carrito) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        El carrito está vacío.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
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

      <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-semibold text-slate-800">
        <span>Total</span>
        <span>${carrito.total.toFixed(2)}</span>
      </div>

      <button
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        disabled={carrito.total_items === 0 || cargando}
        onClick={onIrCheckout}
      >
        Finalizar compra
      </button>

      <button
        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={carrito.total_items === 0 || cargando}
        onClick={() => {
          if (onCancelar) {
            onCancelar();
          } else {
            void cancelar();
          }
        }}
      >
        Cancelar carrito
      </button>
    </div>
  );
}
