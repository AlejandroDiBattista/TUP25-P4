'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ItemCarrito {
  id: number;
  producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface CarritoData {
  items: ItemCarrito[];
  total: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CheckoutPage() {
  const router = useRouter();
  const [carrito, setCarrito] = useState<CarritoData>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  
  // Formulario
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('tp6_token') : null;

  // Cargar carrito actual
  useEffect(() => {
    const fetchCarrito = async () => {
      if (!token) {
        setError('Debes iniciar sesión');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/carrito/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Error al obtener carrito');

        const data = await res.json();
        setCarrito(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar carrito');
      } finally {
        setLoading(false);
      }
    };

    fetchCarrito();
  }, [token]);

  // Calcular totales con IVA y envío
  const calcularTotales = () => {
  const subtotal = carrito.total;
    
    // IVA: 21% por defecto, 10% para electrónica
    let iva = 0;
    carrito.items.forEach((item) => {
      // Suponemos categoría en el nombre o usamos 21% por defecto
      const esElectronica = item.producto.toLowerCase().includes('electro');
      const tasaIva = esElectronica ? 0.10 : 0.21;
      iva += item.subtotal * tasaIva;
    });

    // Envío: gratis si > $1000, sino $50
    const envio = subtotal > 1000 ? 0 : 50;

    const total = subtotal + iva + envio;

    return { subtotal, iva, envio, total };
  };

  const { subtotal, iva, envio, total } = calcularTotales();

  const handleFinalizarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!direccion.trim() || !tarjeta.trim()) {
      setError('Completa todos los campos');
      return;
    }

    setProcesando(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/carrito/finalizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ direccion, tarjeta }),
      });

      if (!res.ok) throw new Error('Error al finalizar compra');

      const data = await res.json();
      // Redirigir a la pantalla de compras con el ID de la compra recién realizada
      router.push(`/compras?compra=${data.compra_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al finalizar compra');
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Debes iniciar sesión</h1>
          <Button onClick={() => router.push('/login')}>Ir a login</Button>
        </div>
      </div>
    );
  }

  if (carrito.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Tu carrito está vacío</h1>
          <Button onClick={() => router.push('/')}>Volver a productos</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2 text-sky-700">Confirmar Compra</h1>
        <p className="text-sm text-gray-600 mb-6">Revisa tu pedido y completa los datos de envío y pago para finalizar.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resumen del carrito */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6 border border-sky-200">
            <h2 className="text-xl font-semibold mb-4 text-sky-700">Resumen del pedido</h2>

            <div className="space-y-3 mb-4 pb-4 border-b border-sky-100">
              {carrito.items.map((item) => {
                const esElectronica = item.producto.toLowerCase().includes('electro');
                const tasaIva = esElectronica ? 0.10 : 0.21;
                const ivaItem = item.subtotal * tasaIva;
                return (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{item.producto}</div>
                      <div className="text-sm text-gray-600">Cantidad: {item.cantidad} • ${item.precio_unitario.toFixed(2)} c/u</div>
                      <div className="text-xs text-gray-500">IVA: ${ivaItem.toFixed(2)}</div>
                    </div>
                    <div className="text-right font-semibold text-sky-700">
                      ${item.subtotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 mb-4">💡 Para cambiar cantidades o eliminar productos, vuelve atrás y edita tu carrito.</p>

            {/* Detalles de pago */}
            <form onSubmit={handleFinalizarCompra} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Dirección de envío</label>
                <Input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle Falsa 123, Ciudad"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Número de tarjeta</label>
                <Input
                  type="text"
                  value={tarjeta}
                  onChange={(e) => setTarjeta(e.target.value)}
                  placeholder="4111 1111 1111 1111"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={procesando}>
                {procesando ? 'Procesando...' : 'Finalizar Compra'}
              </Button>
            </form>

            <button
              onClick={() => router.back()}
              className="text-sky-600 hover:text-sky-700 font-semibold mt-4"
            >
              ← Volver atrás
            </button>
          </div>

          {/* Resumen de totales (sidebar) */}
          <div className="bg-gradient-to-b from-white to-sky-50 rounded-lg shadow-lg p-6 border border-sky-200 h-fit">
            <h3 className="text-lg font-semibold mb-4 text-sky-700">Totales</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total productos:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA:</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-sky-200 pb-2">
                <span>Envío:</span>
                <span>${envio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 text-sky-700">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {envio === 0 && (
                <p className="text-xs text-green-600 mt-2">¡Envío gratis por compra mayor a $1000!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}