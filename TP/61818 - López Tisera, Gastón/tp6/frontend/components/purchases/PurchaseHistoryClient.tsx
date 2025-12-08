"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { fetchPurchases, fetchPurchaseDetail } from "@/lib/api/cart";
import type { Purchase } from "@/types/purchase";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleString("es-AR", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function PurchaseHistoryClient(): JSX.Element {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalGastado = useMemo(
    () => purchases.reduce((acc, purchase) => acc + purchase.total, 0),
    [purchases],
  );

  const subtotalPurchase = useMemo(() => {
    if (!selectedPurchase) return 0;
    return selectedPurchase.items.reduce(
      (acc, item) => acc + item.precio_unitario * item.cantidad,
      0,
    );
  }, [selectedPurchase]);

  const ivaPurchase = useMemo(() => {
    if (!selectedPurchase) return 0;
    return selectedPurchase.total - subtotalPurchase - selectedPurchase.envio;
  }, [selectedPurchase, subtotalPurchase]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      setError("Necesitás iniciar sesión para ver tus compras.");
      setLoading(false);
      return;
    }

    let ignore = false;
    const loadPurchases = async () => {
      try {
        const data = await fetchPurchases(token);
        if (!ignore) {
          setPurchases(data);
          setError(null);
          // Seleccionar la primera compra por defecto
          if (data.length > 0) {
            await loadPurchaseDetail(data[0].id);
          }
        }
      } catch (err) {
        if (!ignore) {
          const message =
            err instanceof Error
              ? err.message
              : "No pudimos obtener tu historial.";
          setError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadPurchases();
    return () => {
      ignore = true;
    };
  }, [authLoading, token, user]);

  useEffect(() => {
    if (!authLoading && !user) {
      const timeout = setTimeout(() => {
        router.replace("/auth/login");
      }, 1500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [authLoading, user, router]);

  const loadPurchaseDetail = async (purchaseId: number) => {
    if (!token) return;
    setLoadingDetail(true);
    try {
      const detail = await fetchPurchaseDetail(token, purchaseId);
      setSelectedPurchase(detail);
    } catch (err) {
      console.error("Error al cargar detalle:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelectPurchase = (purchaseId: number) => {
    void loadPurchaseDetail(purchaseId);
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="flex w-full flex-col gap-3 px-8 py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-600">
            Historial de compras
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Tus pedidos anteriores
          </h1>
          <p className="text-sm text-slate-600">
            Revisá el detalle de cada compra realizada, incluyendo costos y productos
            adquiridos.
          </p>
          {purchases.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Total gastado:{" "}
              <span className="font-semibold text-slate-900">
                {formatCurrency(totalGastado)}
              </span>{" "}
              en {purchases.length} compra
              {purchases.length === 1 ? "" : "s"}.
            </div>
          )}
        </div>
      </header>

      <main className="flex w-full flex-1">
        {loading ? (
          <div className="flex w-full flex-col items-center justify-center text-sm text-slate-500">
            Cargando tus compras...
          </div>
        ) : error ? (
          <div className="w-full p-8">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center p-12 text-center">
            <span className="text-4xl" aria-hidden="true">
              📦
            </span>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              Aún no registramos compras
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Cuando finalices tu primera compra vas a poder verla acá con todos los
              detalles.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {/* Lista de compras - 35% izquierda */}
            <section className="w-[35%] border-r border-slate-200 bg-white p-6">
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <button
                    key={purchase.id}
                    onClick={() => handleSelectPurchase(purchase.id)}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      selectedPurchase?.id === purchase.id
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <h2 className="text-base font-semibold text-slate-900">
                      Compra #{purchase.id}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(purchase.fecha)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Total: {formatCurrency(purchase.total)}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Detalle de compra - 65% derecha */}
            <section className="w-[65%] bg-slate-50 p-8">
              {loadingDetail ? (
                <div className="flex h-full flex-col items-center justify-center text-sm text-slate-500">
                  Cargando detalle...
                </div>
              ) : !selectedPurchase ? (
                <div className="flex h-full flex-col items-center justify-center text-sm text-slate-500">
                  Seleccioná una compra para ver el detalle
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      Detalle de la compra
                    </h1>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          Compra #: {selectedPurchase.id}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                          Fecha: {formatDate(selectedPurchase.fecha)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-200 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Dirección:</span>
                        <span className="font-medium text-slate-900">
                          {selectedPurchase.direccion}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tarjeta:</span>
                        <span className="font-medium text-slate-900">
                          {selectedPurchase.tarjeta}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">
                      Productos
                    </h3>
                    <div className="space-y-3">
                      {selectedPurchase.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{item.nombre}</p>
                            <p className="text-sm text-slate-500">
                              Cantidad: {item.cantidad}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              {formatCurrency(item.precio_unitario * item.cantidad)}
                            </p>
                            <p className="text-xs text-slate-500">
                              IVA: {formatCurrency(item.precio_unitario * item.cantidad * 0.21)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-2 border-t border-slate-200 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(subtotalPurchase)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">IVA:</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(ivaPurchase)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Envío:</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(selectedPurchase.envio)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
                        <span className="text-slate-900">Total pagado:</span>
                        <span className="text-slate-900">
                          {formatCurrency(selectedPurchase.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

