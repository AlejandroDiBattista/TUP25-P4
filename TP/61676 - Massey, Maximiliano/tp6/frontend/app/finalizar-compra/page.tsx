'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useCartStore from '../store/cart';
import useAuthStore from '../store/auth';
import { API_URL } from '../config';

export default function FinalizarCompra() {
  const router = useRouter();
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { items, getTotals, clearCart } = useCartStore();
  const { token, user, logout } = useAuthStore();
  const totals = getTotals();

  const handleLogout = () => {
    clearCart();
    logout();
    router.push('/');
  };

  useEffect(() => {
    // Redirigir si no hay items
    if (items.length === 0 && !success) {
      router.push('/');
    }
    // Redirigir si no está autenticado
    if (!token && !user) {
      router.push('/login');
    }
  }, [items, token, user, success, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (!direccion.trim()) {
      setError('La dirección es requerida');
      setLoading(false);
      return;
    }

    if (!tarjeta.trim()) {
      setError('El número de tarjeta es requerido');
      setLoading(false);
      return;
    }

    if (tarjeta.replace(/\s/g, '').length < 13) {
      setError('Número de tarjeta inválido');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Iniciando compra...');
      console.log('Token:', token ? 'Presente' : 'Ausente');
      console.log('Items en carrito:', items.length);
      
      // Crear FormData para enviar al backend
      const formData = new FormData();
      formData.append('direccion', direccion);
      formData.append('tarjeta', tarjeta.replace(/\s/g, ''));

      console.log('📤 Enviando solicitud a:', `${API_URL}/carrito/finalizar`);

      const response = await fetch(`${API_URL}/carrito/finalizar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📥 Respuesta recibida:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.detail || 'Error al finalizar la compra');
      }

      const data = await response.json();
      console.log('✅ Compra finalizada:', data);
      
      setSuccess(true);
      clearCart();
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/mis-compras');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error al finalizar compra:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la compra. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Formato de tarjeta (#### #### #### ####)
  const handleTarjetaChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setTarjeta(formatted.slice(0, 19)); // Máximo 16 dígitos + 3 espacios
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">¡Compra Exitosa!</h2>
          <p className="text-gray-900 font-semibold mb-6">Tu pedido ha sido procesado correctamente</p>
          <p className="text-sm text-gray-900 font-semibold">Redirigiendo a tus compras...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Carrito Vacío</h2>
          <p className="text-gray-900 font-semibold mb-6">No tienes productos en tu carrito</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                TP6 Shop
              </h1>
            </Link>
            
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-gray-900 font-semibold hover:text-blue-600">
                Productos
              </Link>
              <Link href="/mis-compras" className="text-gray-900 font-semibold hover:text-blue-600">
                Mis compras
              </Link>
              <span className="text-gray-900 font-semibold">
                {user?.nombre}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-900 font-semibold hover:text-blue-600"
              >
                Salir
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finalizar compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Datos de Envío</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dirección */}
              <div>
                <label htmlFor="direccion" className="block text-sm font-bold text-gray-900 mb-2">
                  📍 Dirección de Envío *
                </label>
                <textarea
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle, número, piso, departamento, ciudad, código postal..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold placeholder:text-gray-400"
                  rows={3}
                  required
                />
              </div>

              {/* Tarjeta */}
              <div>
                <label htmlFor="tarjeta" className="block text-sm font-bold text-gray-900 mb-2">
                  💳 Número de Tarjeta *
                </label>
                <input
                  id="tarjeta"
                  type="text"
                  value={tarjeta}
                  onChange={(e) => handleTarjetaChange(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-gray-900 font-semibold placeholder:text-gray-400"
                  maxLength={19}
                  required
                />
                <p className="text-xs text-gray-900 font-semibold mt-1">
                  Solo se guardarán los últimos 4 dígitos
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  ❌ {error}
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? '⏳ Procesando...' : `💳 Pagar $${totals.total.toFixed(2)}`}
              </button>

              <p className="text-xs text-gray-900 font-semibold text-center">
                🔒 Pago seguro y encriptado
              </p>
            </form>
          </div>

          {/* Resumen del carrito */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b">
                    <img
                      src={item.imagen.startsWith('http') ? item.imagen : `${API_URL}/${item.imagen}`}
                      alt={item.nombre || item.titulo}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">
                        {item.nombre || item.titulo}
                      </p>
                      <p className="text-xs text-gray-900 font-semibold">
                        Cantidad: {item.cantidad}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm text-gray-900 font-semibold">
                  <span>Subtotal:</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-900 font-semibold">
                  <span>IVA:</span>
                  <span>${totals.iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-900 font-semibold">
                  <span>Envío:</span>
                  <span>
                    {totals.envio === 0 ? (
                      <span className="text-green-600 font-bold">¡Gratis!</span>
                    ) : (
                      `$${totals.envio.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900">
                  <span>Total:</span>
                  <span className="text-blue-600">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Info adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📦 Información de Envío</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Envío gratis en compras superiores a $1000</li>
                <li>✓ Entrega estimada: 3-5 días hábiles</li>
                <li>✓ Podrás hacer seguimiento de tu pedido</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}