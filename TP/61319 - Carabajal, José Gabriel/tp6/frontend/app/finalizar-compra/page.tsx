'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { getCart, finalizarCompra } from '../services/carrito';
import type { CartView } from '../types';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function FinalizarCompraPage() {
    const router = useRouter();
    const { session } = useAuth();
    const [cart, setCart] = useState<CartView | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [direccion, setDireccion] = useState('');
    const [tarjeta, setTarjeta] = useState(''); // solo dígitos
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState(false);

    const usuarioId = session?.user.id ?? null;

    useEffect(() => {
        if (!usuarioId) {
            router.push('/ingresar');
            return;
        }
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const data = await getCart(usuarioId);
                setCart(data);
            } catch (e: any) {
                setErr(e?.message ?? 'No se pudo cargar el carrito');
            } finally {
                setLoading(false);
            }
        })();
    }, [usuarioId, router]);

    // aceptar solo números y limitar a 16
    function onChangeTarjeta(e: React.ChangeEvent<HTMLInputElement>) {
        const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 16);
        setTarjeta(onlyDigits);
    }

    const tarjetaInvalida = useMemo(() => tarjeta.length > 0 && tarjeta.length !== 16, [tarjeta]);
    const canSubmit = useMemo(
        () => direccion.trim().length > 4 && tarjeta.length === 16 && !submitting,
        [direccion, tarjeta, submitting]
    );

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setTouched(true);

        if (!usuarioId || !cart || cart.items.length === 0) return;
        if (tarjeta.length !== 16) return; // validación mínima

        try {
            setSubmitting(true);
            const compra = await finalizarCompra(usuarioId, { direccion, tarjeta });

            // Redirige primero para que el alert no interrumpa la navegación
            router.push('/compras');
            setTimeout(() => {
                alert(`Compra #${compra.id} confirmada. Total: ${money.format(compra.total)}`);
            }, 400);
        } catch (e: any) {
            const msg =
                e?.message?.includes('Failed to fetch')
                    ? 'No se pudo conectar con el servidor. Verificá que esté levantado.'
                    : e?.message ?? 'Error al confirmar la compra.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    }

    if (!usuarioId) return null;

    return (
        <div className="mx-auto max-w-screen-2xl px-4 pt-12 pb-8">
            <h1 className="text-3xl font-semibold mb-6">Finalizar compra</h1>

            {loading ? (
                <p className="text-gray-500">Cargando...</p>
            ) : err ? (
                <p className="text-red-600">{err}</p>
            ) : !cart || cart.items.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    Tu carrito está vacío.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Resumen */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="text-xl font-semibold mb-4">Resumen del carrito</h2>

                        <div className="divide-y">
                            {cart.items.map((it) => (
                                <div key={it.producto_id} className="py-3 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-medium">{it.nombre}</p>
                                        <p className="text-xs text-gray-500">Cantidad: {it.cantidad}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {money.format(it.precio_unitario * it.cantidad)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {money.format(it.precio_unitario)} c/u
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 border-t pt-3 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span>Total productos:</span>
                                <span>{money.format(cart.totals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>IVA:</span>
                                <span>{money.format(cart.totals.iva)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Envío:</span>
                                <span>{money.format(cart.totals.envio)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-base mt-1">
                                <span>Total a pagar:</span>
                                <span>{money.format(cart.totals.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="text-xl font-semibold mb-4">Datos de envío</h2>

                        <label className="block text-sm text-gray-700 mb-1">Dirección</label>
                        <input
                            required
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 mb-4"
                        />

                        <label className="block text-sm text-gray-700 mb-1">Tarjeta</label>
                        <input
                            inputMode="numeric"
                            autoComplete="cc-number"
                            placeholder="Número de tarjeta (16 dígitos)"
                            value={tarjeta}
                            onChange={onChangeTarjeta}
                            onBlur={() => setTouched(true)}
                            maxLength={16}
                            pattern="\d{16}"
                            required
                            className={`w-full rounded-md border bg-white px-3 py-2 outline-none focus:ring-2 ${
                                tarjetaInvalida && touched
                                    ? 'border-red-400 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-gray-900'
                            }`}
                        />
                        {tarjetaInvalida && touched && (
                            <p className="text-xs text-red-600 mt-1">
                                La tarjeta debe tener exactamente 16 dígitos.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="mt-6 w-full rounded-md bg-gray-900 text-white py-2 disabled:opacity-60"
                        >
                            {submitting ? 'Confirmando…' : 'Confirmar compra'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
