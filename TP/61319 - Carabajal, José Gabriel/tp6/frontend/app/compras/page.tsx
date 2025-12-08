'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { getCompras, getCompraById } from '../services/compras';
import type { CompraDetalle, CompraResumen } from '../types';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function maskCard(num: string) {
    if (!num) return '';
    const last4 = num.slice(-4);
    return `****-****-****-${last4}`;
}

function fmtDate(iso: string) {
    try {
        const d = new Date(iso);
        return d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return iso;
    }
}

export default function MisComprasPage() {
    const router = useRouter();
    const { session } = useAuth();
    const userId = session?.user.id ?? null;

    const [list, setList] = useState<CompraResumen[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detail, setDetail] = useState<CompraDetalle | null>(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
        router.push('/ingresar');
        return;
        }
        (async () => {
        try {
            setLoadingList(true);
            setErr(null);
            const compras = await getCompras(userId);
            setList(compras);
            // seleccionar la más reciente por defecto
            if (compras.length > 0) setSelectedId(compras[0].id);
        } catch (e: any) {
            setErr(e?.message ?? 'No se pudieron cargar las compras');
        } finally {
            setLoadingList(false);
        }
        })();
    }, [userId, router]);

    useEffect(() => {
        if (!userId || !selectedId) {
        setDetail(null);
        return;
        }
        (async () => {
        try {
            setLoadingDetail(true);
            const d = await getCompraById(userId, selectedId);
            setDetail(d);
        } catch (e: any) {
            setDetail(null);
        } finally {
            setLoadingDetail(false);
        }
        })();
    }, [userId, selectedId]);

    const rightTitle = useMemo(
        () => (detail ? `Compra #${detail.id}` : 'Detalle de la compra'),
        [detail]
    );

    return (
        <div className="mx-auto max-w-screen-2xl px-4 pt-12 pb-8">
        <h1 className="text-3xl font-semibold mb-6">Mis compras</h1>

        {err && <p className="text-red-600 mb-4">{err}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda: lista */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
            {loadingList ? (
                <p className="text-gray-500">Cargando…</p>
            ) : list.length === 0 ? (
                <p className="text-gray-600">Aún no tenés compras.</p>
            ) : (
                <div className="space-y-3">
                {list.map((c) => (
                    <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left rounded-lg border px-4 py-3 transition ${
                        selectedId === c.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    >
                    <p className="font-medium">Compra #{c.id}</p>
                    <p className="text-xs text-gray-500">{fmtDate(c.fecha)}</p>
                    <p className="text-sm font-semibold mt-1">Total: {money.format(c.total)}</p>
                    </button>
                ))}
                </div>
            )}
            </div>

            {/* Columna derecha: detalle */}
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="text-xl font-semibold mb-3">Detalle de la compra</h2>

            {!selectedId ? (
                <p className="text-gray-500">Seleccioná una compra para ver el detalle.</p>
            ) : loadingDetail ? (
                <p className="text-gray-500">Cargando detalle…</p>
            ) : !detail ? (
                <p className="text-gray-500">No se pudo cargar el detalle.</p>
            ) : (
                <div>
                {/* Cabecera */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                    <p className="font-semibold">Compra #: {detail.id}</p>
                    <p className="text-gray-700">Dirección: {detail.direccion}</p>
                    </div>
                    <div className="text-right">
                    <p className="text-gray-700">Fecha: {fmtDate(detail.fecha)}</p>
                    <p className="text-gray-700">
                        Tarjeta: {maskCard(detail.tarjeta)}
                    </p>
                    </div>
                </div>

                {/* Items */}
                <div className="divide-y">
                    {detail.items.map((it) => (
                    <div key={it.producto_id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                        <p className="font-medium">{it.nombre}</p>
                        <p className="text-xs text-gray-500">Cantidad: {it.cantidad}</p>
                        </div>
                        <div className="text-right">
                        <p className="font-semibold">
                            {money.format(it.precio_unitario)}
                        </p>
                        {typeof it.iva === 'number' && (
                            <p className="text-xs text-gray-500">IVA: {money.format(it.iva)}</p>
                        )}
                        </div>
                    </div>
                    ))}
                </div>

                {/* Totales */}
                <div className="mt-4 border-t pt-3 text-sm space-y-1">
                    <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{money.format(detail.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                    <span>IVA:</span>
                    <span>{money.format(detail.iva)}</span>
                    </div>
                    <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>{money.format(detail.envio)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base mt-1">
                    <span>Total pagado:</span>
                    <span>{money.format(detail.total)}</span>
                    </div>
                </div>
                </div>
            )}
            </div>
        </div>
        </div>
    );
}
