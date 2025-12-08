"use client";
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const ivaRateFor = (categoria?: string | null) => (categoria?.toLowerCase().startsWith('electr') ? 0.1 : 0.21);

export default function MisComprasPage() {
  const [list, setList] = useState<Array<any>>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const maskCard = (num?: string | null) => {
    if (!num) return 'No indicada';
    const s = String(num);
    // if backend already sent a masked value (contains '*'), return as-is
    if (s.includes('*')) return s;
    const digits = s.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    const last4 = digits.slice(-4);
    // Preferred format: '**** **** **** 1234'
    return `**** **** **** ${last4}`;
  };

  useEffect(() => {
    const fetchList = async () => {
      const token = localStorage.getItem('tp6_token');
      if (!token) return; // not logged
      try {
        const res = await fetch(`${API_URL}/compras/`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        setList(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (e) {
        console.error('Error fetching compras', e);
      }
    };
    fetchList();
  }, []);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    const fetchDetail = async () => {
      setLoading(true);
      const token = localStorage.getItem('tp6_token');
      try {
        const res = await fetch(`${API_URL}/compras/${selectedId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { setDetail(null); setLoading(false); return; }
        const d = await res.json();
        setDetail(d);
      } catch (e) {
        console.error('Error fetching detalle compra', e);
        setDetail(null);
      } finally { setLoading(false); }
    };
    fetchDetail();
  }, [selectedId]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Mis compras</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="space-y-3">
            {list.length === 0 && <div className="text-sm text-gray-600">No hay compras</div>}
            {list.map((c: any) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left p-4 rounded border ${selectedId === c.id ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-200'}`}>
                <div className="font-semibold">Compra #{c.id}</div>
                <div className="text-xs text-gray-500">{new Date(c.fecha).toLocaleString()}</div>
                <div className="mt-2">Total: ${c.total.toFixed(2)}</div>
                {typeof c.iva_total === 'number' ? (
                  <div className="text-xs text-gray-500">IVA: ${Number(c.iva_total).toFixed(2)}</div>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Detalle de la compra</h2>
            {!detail ? (
              <div className="text-sm text-gray-600">Seleccioná una compra para ver el detalle</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2"><span className="font-semibold">Compra #:</span> {detail.id}</div>
                  <div className="mb-2"><span className="font-semibold">Dirección:</span> {detail.direccion}</div>
                </div>
                <div className="text-right">
                  <div className="mb-2"><span className="font-semibold">Fecha:</span> {new Date(detail.fecha).toLocaleString()}</div>
                  <div className="mb-2"><span className="font-semibold">Tarjeta:</span> {maskCard(detail.tarjeta)}</div>
                  <div className="mb-2"><span className="font-semibold">Total:</span> ${detail.total.toFixed(2)}</div>
                </div>

                <div className="md:col-span-2">
                  <div className="mt-4">
                    <div className="font-medium mb-2">Productos</div>
                    <div className="divide-y">
                      {detail.items.map((it: any) => {
                        const rate = typeof it.iva_rate === 'number' ? it.iva_rate : ivaRateFor(it.categoria);
                        const linea = Number(it.precio_unitario ?? 0) * Number(it.cantidad ?? 0);
                        const ivaLinea = typeof it.iva === 'number' ? it.iva : linea * rate;
                        return (
                          <div key={it.producto_id} className="py-3 flex justify-between items-start">
                            <div>
                              <div className="font-medium">{it.nombre}</div>
                              <div className="text-sm text-gray-600">Cantidad: {it.cantidad}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${linea.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">IVA ({Math.round(rate * 100)}%): ${ivaLinea.toFixed(2)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-gray-700">
                    {(() => {
                      const subtotalCalc = typeof detail.subtotal === 'number'
                        ? detail.subtotal
                        : detail.items.reduce((s: number, it: any) => s + Number(it.precio_unitario ?? 0) * Number(it.cantidad ?? 0), 0);
                      const ivaTotal = typeof detail.iva_total === 'number'
                        ? detail.iva_total
                        : detail.items.reduce((s: number, it: any) => {
                            const rate = typeof it.iva_rate === 'number' ? it.iva_rate : ivaRateFor(it.categoria);
                            return s + Number(it.precio_unitario ?? 0) * Number(it.cantidad ?? 0) * rate;
                          }, 0);
                      return (
                        <>
                          <div>Subtotal: ${subtotalCalc.toFixed(2)}</div>
                          <div>IVA: ${ivaTotal.toFixed(2)}</div>
                          <div>Envío: ${Number(detail.envio ?? 0).toFixed(2)}</div>
                          <div className="mt-3 font-bold text-lg">Total pagado: ${Number(detail.total ?? 0).toFixed(2)}</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
