"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CartItemsList } from "@/components/cart/CartItemsList";
import { CartTotalsCard } from "@/components/cart/CartTotalsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import type { CheckoutPayload } from "@/types/cart";
import type { Producto } from "@/types/product";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);

export function CartPageClient({
  productos,
}: {
  productos: Producto[];
}): JSX.Element {
  const router = useRouter();
  const { cart, totals, loading, error, removeItem, addItem, cancel, checkout } =
    useCart();

  const productosMap = useMemo(
    () => new Map(productos.map((producto) => [producto.id, producto])),
    [productos],
  );

  const [itemProcessingId, setItemProcessingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<CheckoutPayload>({
    direccion: "",
    tarjeta: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = cart?.items ?? [];
  const hasItems = cartItems.length > 0;

  const handleIncrease = async (productoId: number) => {
    setItemProcessingId(productoId);
    try {
      const producto = productosMap.get(productoId);
      const cartItem = cartItems.find((i) => i.producto_id === productoId);
      if (producto && cartItem && cartItem.cantidad >= producto.existencia) {
        setFormError("No hay stock suficiente para la cantidad total solicitada.");
        setFormSuccess(null);
        return;
      }
      await addItem({ producto_id: productoId, cantidad: 1 });
      setFormSuccess("Se agregó otra unidad al carrito.");
      setFormError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar el carrito.";
      setFormError(message);
      setFormSuccess(null);
    } finally {
      setItemProcessingId(null);
    }
  };

  const handleRemove = async (productoId: number) => {
    setItemProcessingId(productoId);
    try {
      await removeItem(productoId);
      setFormSuccess("Producto eliminado del carrito.");
      setFormError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo quitar el producto.";
      setFormError(message);
      setFormSuccess(null);
    } finally {
      setItemProcessingId(null);
    }
  };

  const handleCancelCart = async () => {
    setItemProcessingId(-1);
    try {
      await cancel();
      setFormSuccess("Se vació el carrito correctamente.");
      setFormError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cancelar el carrito.";
      setFormError(message);
      setFormSuccess(null);
    } finally {
      setItemProcessingId(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!hasItems) {
      setFormError("Agregá productos al carrito para continuar con la compra.");
      return;
    }

    setIsSubmitting(true);

    try {
      const purchase = await checkout(formState);
      setFormSuccess(
        `${purchase.message} Total abonado: ${formatCurrency(
          totals?.total ?? 0,
        )}.`,
      );
      setFormState({ direccion: "", tarjeta: "" });

      setTimeout(() => {
        router.push("/compras");
      }, 1200);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo finalizar la compra. Revisá los datos e intentá de nuevo.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-600">
            Paso 1 de 2
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Tu carrito de compras</h1>
          <p className="text-sm text-slate-600">
            Revisá los productos seleccionados, modificá cantidades o eliminá lo que
            no necesites antes de finalizar tu pedido.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>
              Items en carrito:{" "}
              <strong className="text-slate-900">{cartItems.length}</strong>
            </span>
            <span>•</span>
            <span>
              Actualizado por última vez:{" "}
              {cart
                ? new Date(cart.updated_at).toLocaleString("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "—"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 lg:flex-row">
        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              ← Seguir comprando
            </Link>
            {hasItems && (
              <button
                type="button"
                onClick={handleCancelCart}
                className="text-sm font-medium text-red-600 transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                disabled={itemProcessingId === -1 || loading}
              >
                Cancelar compra (vaciar carrito)
              </button>
            )}
          </div>

          {(formError || error) && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError ?? error}
            </div>
          )}

          {formSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {formSuccess}
            </div>
          )}

          <CartItemsList
            items={cartItems}
            productosMap={productosMap}
            onRemove={handleRemove}
            onIncrease={handleIncrease}
            loadingId={itemProcessingId}
          />
        </section>

        <aside className="w-full max-w-lg space-y-6">
          <CartTotalsCard totals={totals} isLoading={loading} />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Finalizar compra
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Completá tus datos para cerrar la compra. Los campos son obligatorios.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección de entrega</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  placeholder="Ej: Av. Siempre Viva 742, Springfield"
                  value={formState.direccion}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      direccion: event.target.value,
                    }))
                  }
                  required
                  disabled={isSubmitting || !hasItems}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tarjeta">Datos de la tarjeta</Label>
                <Input
                  id="tarjeta"
                  name="tarjeta"
                  placeholder="Visa terminado en 1234"
                  value={formState.tarjeta}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      tarjeta: event.target.value,
                    }))
                  }
                  required
                  disabled={isSubmitting || !hasItems}
                />
                <p className="text-xs text-slate-500">
                  No se guardan datos financieros. Se utiliza solo para confirmar la
                  orden.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !hasItems || loading}
                className="w-full"
              >
                {isSubmitting ? "Procesando compra..." : "Confirmar pago"}
              </Button>
            </form>
          </div>
        </aside>
      </main>
    </div>
  );
}

