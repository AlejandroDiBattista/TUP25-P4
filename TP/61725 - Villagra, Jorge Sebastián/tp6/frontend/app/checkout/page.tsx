'use client';

import { useEffect, useState } from 'react';
import { getCart } from '@/app/services/carrito'; // quitado 'checkout' que no se usa
import { confirmarCompra } from '@/app/services/compras';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type CartItem = {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio?: number;
  imagen?: string | null;
  imagen_url?: string | null;
};

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

function formatCard(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function extractDigits(raw: string) {
  return raw.replace(/\D/g, '');
}

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState(''); // formateado
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // NUEVO: datos requeridos por el backend
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  // const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'efectivo' | 'transferencia'>('tarjeta'); // <-- eliminado (solo tarjeta)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    (async () => {
      const data = await getCart();
      setItems(Array.isArray(data.items) ? data.items : []);
      setLoading(false);
    })();
  }, [token, router]);

  const base = items.reduce((a, it) => a + (Number(it.precio || 0) * it.cantidad), 0);
  const iva = base * 0.21;
  const envio = base > 1000 ? 0 : (items.length ? 50 : 0);
  const total = base + iva + envio;

  const tarjetaDigits = extractDigits(tarjeta);
  const tarjetaValida = tarjetaDigits.length === 16;
  const direccionValida = direccion.trim().length >= 5;
  const nombreValido = nombre.trim().length >= 3;
  const telefonoDigits = extractDigits(telefono);
  const telefonoValido = telefonoDigits.length >= 8;
  const formOk = tarjetaValida && direccionValida && nombreValido && telefonoValido;

  async function onConfirmar(e?: React.MouseEvent) {
    e?.preventDefault();
    if (!formOk || saving) return;
    setSaving(true);
    try {
      const res = await confirmarCompra({
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefonoDigits,
        tarjeta: tarjetaDigits
      });
      toast.success('Compra confirmada');
      router.push('/compras');
    } catch (err: any) {
      toast.error(err.message || 'Error al confirmar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Cargando...</div>;
  if (items.length === 0) return <div className="p-6">Carrito vacío. <button onClick={()=>router.push('/')}>Volver</button></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Finalizar compra</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 space-y-4">
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-medium text-lg">Productos</h2>
            <ul className="space-y-3">
              {items.map(it => {
                const img = toImageUrl(it.imagen_url ?? it.imagen);
                const unit = Number(it.precio || 0);
                const line = unit * it.cantidad;
                const name = it.nombre || (it as any).titulo || `Producto ${it.producto_id}`;
                return (
                  <li key={it.producto_id} className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-muted/60 rounded overflow-hidden flex-shrink-0">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-[10px] text-muted-foreground">Sin imagen</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold whitespace-normal break-words">{name}</div>
                      <div className="text-xs text-muted-foreground">
                        Precio: ${unit.toFixed(2)} • Cantidad: {it.cantidad}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">${line.toFixed(2)}</div>
                  </li>
                );
              })}
            </ul>
            <div className="text-sm space-y-1 pt-2 border-t pt-3">
              <div>Subtotal: ${base.toFixed(2)}</div>
              <div>IVA (21%): ${iva.toFixed(2)}</div>
              <div>Envío: ${envio.toFixed(2)}</div>
              <div className="font-semibold">Total: ${total.toFixed(2)}</div>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-medium text-lg">Datos de envío</h2>
            <label className="text-sm flex flex-col gap-1">
              Nombre y apellido
              <input
                value={nombre}
                onChange={e=>setNombre(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
                placeholder="Juan Pérez"
                maxLength={80}
              />
              {!nombreValido && nombre.length > 0 && (
                <span className="text-xs text-red-600">Mínimo 3 caracteres</span>
              )}
            </label>
            <label className="text-sm flex flex-col gap-1">
              Teléfono
              <input
                value={telefono}
                onChange={e=>setTelefono(e.target.value)}
                inputMode="tel"
                className="border rounded px-3 py-2 text-sm"
                placeholder="381 555 1234"
                maxLength={20}
              />
              {!telefonoValido && telefono.length > 0 && (
                <span className="text-xs text-red-600">Debe tener al menos 8 dígitos</span>
              )}
            </label>
            <label className="text-sm flex flex-col gap-1">
              Dirección
              <input
                value={direccion}
                onChange={e=>setDireccion(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
                placeholder="Calle 123, Ciudad"
                maxLength={120}
              />
              {!direccionValida && direccion.length > 0 && (
                <span className="text-xs text-red-600">Mínimo 5 caracteres</span>
              )}
            </label>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-medium text-lg">Pago</h2>
            <label className="text-sm flex flex-col gap-1">
              Tarjeta (16 dígitos)
              <input
                value={tarjeta}
                onChange={e=>setTarjeta(formatCard(e.target.value))}
                inputMode="numeric"
                autoComplete="cc-number"
                className="border rounded px-3 py-2 text-sm tracking-wider"
                placeholder="XXXX XXXX XXXX XXXX"
              />
              {!tarjetaValida && tarjeta.length > 0 && (
                <span className="text-xs text-red-600">Debe tener 16 dígitos</span>
              )}
              {tarjetaValida && (
                <span className="text-xs text-green-600">Tarjeta válida</span>
              )}
            </label>
          </div>
        </section>

        <aside className="space-y-4 h-fit">
          <div className="border rounded-lg p-4 space-y-3">
            <h2 className="font-medium text-lg">Confirmación</h2>
            <p className="text-xs text-muted-foreground">
              Revisa los datos antes de confirmar la compra.
            </p>
            <button
              onClick={onConfirmar}
              disabled={saving || !formOk}
              className="w-full px-4 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Confirmando...' : 'Confirmar compra'}
            </button>
            <button
              onClick={()=>router.push('/')}
              disabled={confirming}
              className="w-full px-4 py-2 rounded text-sm border"
            >
              Volver
            </button>
            {msg && <div className="text-xs text-blue-600">{msg}</div>}
            {!formOk && (
              <div className="text-xs text-red-600">
                Completa nombre, teléfono, dirección y tarjeta válida para continuar.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}