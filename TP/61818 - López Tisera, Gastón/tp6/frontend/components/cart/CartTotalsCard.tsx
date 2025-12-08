import type { CartTotals } from "@/types/cart";

interface CartTotalsCardProps {
  totals: CartTotals | null;
  isLoading: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);

export function CartTotalsCard({
  totals,
  isLoading,
}: CartTotalsCardProps): JSX.Element {
  return (
    <aside className="sticky top-24 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
        <p className="mt-1 text-xs text-slate-500">
          Los montos incluyen IVA según corresponda y costos de envío.
        </p>
      </div>

      <dl className="space-y-3 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <dt>Subtotal</dt>
          <dd className="font-medium text-slate-900">
            {totals ? formatCurrency(totals.subtotal) : "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>IVA</dt>
          <dd className="font-medium text-slate-900">
            {totals ? formatCurrency(totals.iva) : "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Envío</dt>
          <dd className="font-medium text-slate-900">
            {totals ? formatCurrency(totals.envio) : "—"}
          </dd>
        </div>
        <div className="border-t border-dashed border-slate-200 pt-3">
          <div className="flex items-center justify-between text-base font-semibold text-slate-900">
            <dt>Total</dt>
            <dd className="text-xl text-blue-600">
              {totals ? formatCurrency(totals.total) : "—"}
            </dd>
          </div>
        </div>
      </dl>

      <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <p>
          <strong>IVA general:</strong> 21%. <strong>IVA electrónica:</strong> 10%.
        </p>
        <p className="mt-1">
          <strong>Envío gratis</strong> desde $1.000. Caso contrario tiene un costo
          fijo de $50.
        </p>
      </div>

      <p className="text-center text-xs text-slate-500">
        {isLoading
          ? "Actualizando totales..."
          : totals
            ? "Los totales se actualizan automáticamente al modificar el carrito."
            : "El carrito está vacío."}
      </p>
    </aside>
  );
}

