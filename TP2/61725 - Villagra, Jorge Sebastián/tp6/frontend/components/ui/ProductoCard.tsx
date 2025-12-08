'use client';

import { useState, useEffect } from 'react'; // Agregado useEffect
import { ShoppingCart } from 'lucide-react';
import type { Producto } from '@/app/types';
import { addToCart } from '@/app/services/carrito';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function toImageUrl(raw?: string | null): string {
  const r = (raw ?? '').toString();
  if (!r) return '';
  if (/^https?:\/\//.test(r) || r.startsWith('//')) return r;
  const path = r.startsWith('/imagenes')
    ? r
    : (r.startsWith('imagenes/') ? `/${r}` : `/imagenes/${r.replace(/^\//, '')}`);
  return `${API}${path}`;
}

type Props = { producto: Producto };

export default function ProductoCard({ producto }: Props) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [cantidadAgregada, setCantidadAgregada] = useState(0);
  const existencia = producto.existencia ?? 0;
  const agotado = existencia <= 0;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const img = toImageUrl((producto as any).imagen_url ?? (producto as any).imagen);

  const title = String((producto as any).nombre ?? (producto as any).titulo ?? `Producto ${producto.id}`);

  // Nuevo: Escuchar evento de cancelación y resetear contador
  useEffect(() => {
    const handleCancel = () => setCantidadAgregada(0);
    window.addEventListener('cart:cancelled', handleCancel);
    return () => window.removeEventListener('cart:cancelled', handleCancel);
  }, []);

  async function handleAdd() {
    if (loading || agotado) return;
    setMsg(null);
    if (!token) {
      toast.info('Inicia sesión para agregar al carrito');
      window.location.href = '/auth/login';
      return;
    }
    if (cantidadAgregada + 1 > existencia) {
      const mensaje = `No puedes agregar más. Stock disponible: ${existencia - cantidadAgregada}`;
      setMsg(mensaje);
      toast.error(mensaje);
      return;
    }
    setLoading(true);
    try {
      const ok = await addToCart(producto.id, 1);
      if (!ok) {
        setMsg('No se pudo agregar (re‑login)');
        toast.error('No se pudo agregar al carrito');
        return;
      }
      setCantidadAgregada(cantidadAgregada + 1);
      window.dispatchEvent(new CustomEvent('cart:updated'));
      setMsg('Agregado');
      toast.success('Agregado al carrito');
      setTimeout(() => setMsg(null), 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-lg p-3 flex flex-col gap-2">
      <div className="relative w-full aspect-square bg-muted/60">
        {img ? (
          <img src={img} alt={producto.nombre || ''} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">Sin imagen</div>
        )}
      </div>
      <h3 className="text-sm font-bold leading-snug line-clamp-1">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2">{producto.descripcion ?? ''}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold">${producto.precio}</span>
        <span className={`text-xs ${agotado ? 'text-red-600' : 'text-green-600'}`}>
          {agotado ? 'Agotado' : `Stock: ${existencia}`}
        </span>
      </div>
      <button
        onClick={handleAdd}
        disabled={loading || agotado || cantidadAgregada >= existencia}
        className="mt-auto inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded border bg-white hover:bg-muted disabled:opacity-50"
      >
        <ShoppingCart size={16} />
        {loading ? '...' : cantidadAgregada >= existencia ? 'Límite alcanzado' : 'Agregar al carrito'}
      </button>
      {msg && <div className="text-[11px] text-gray-600 mt-1">{msg}</div>}
    </div>
  );
}