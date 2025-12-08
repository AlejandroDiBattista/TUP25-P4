'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  estaAutenticado,
  getAuthHeaders,
  obtenerNombreAlmacenado,
  obtenerUsuarioActual,
} from '../services/auth';

interface ItemCarrito {
  producto_id: number;
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

interface CarritoResponse {
  items: ItemCarrito[];
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

interface CompraResponse {
  compra_id: number;
  subtotal: number;
  iva: number;
  envio: number;
  total: number;
}

interface ErroresFormulario {
  direccion?: string;
  tarjeta?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const formatearTarjeta = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();

const enmascararTarjeta = (value: string) => {
  const digits = value.replace(/\s+/g, '');
  if (digits.length < 4) return '**** **** **** ****';
  return `**** **** **** ${digits.slice(-4)}`;
};

export default function FinalizarCompraPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [formErrors, setFormErrors] = useState<ErroresFormulario>({});
  const [mensaje, setMensaje] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<CompraResponse | null>(null);
  const [resumenPrevio, setResumenPrevio] = useState<CarritoResponse | null>(null);
  const [direccionConfirmada, setDireccionConfirmada] = useState('');
  const [tarjetaConfirmada, setTarjetaConfirmada] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');

  const cargarCarrito = async () => {
    setCargando(true);
    setErrorGeneral('');
    try {
      const response = await fetch(`${API_URL}/carrito`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener el carrito');
      }

      const data: CarritoResponse = await response.json();
      setCarrito(data);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
      setErrorGeneral(err instanceof Error ? err.message : 'Error al obtener el carrito');
      setCarrito(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!estaAutenticado()) {
      router.push('/auth');
      return;
    }

    void cargarCarrito();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!estaAutenticado()) {
      setNombreUsuario('');
      return;
    }

    const almacenado = obtenerNombreAlmacenado();
    if (almacenado) {
      setNombreUsuario(almacenado);
      return;
    }

    obtenerUsuarioActual()
      .then((usuario) => setNombreUsuario(usuario.nombre))
      .catch((err) => console.error('Error al obtener usuario actual:', err));
  }, []);

  const validarFormulario = (): string | null => {
    const errores: ErroresFormulario = {};
    const direccionLimpia = direccion.trim();
    const tarjetaDigits = tarjeta.replace(/\s+/g, '');

    if (direccionLimpia.length < 8) {
      errores.direccion = 'Ingresa una dirección válida (mínimo 8 caracteres)';
    }

    if (!/^\d{16}$/.test(tarjetaDigits)) {
      errores.tarjeta = 'La tarjeta debe tener 16 dígitos sin letras';
    }

    setFormErrors(errores);

    if (Object.keys(errores).length > 0) {
      return null;
    }

    return tarjetaDigits;
  };

  const realizarCompra = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensaje('');
    setErrorGeneral('');

    if (!carrito || carrito.items.length === 0) {
      setErrorGeneral('No hay productos en el carrito para finalizar la compra');
      return;
    }

    const tarjetaDigits = validarFormulario();
    if (!tarjetaDigits) {
      return;
    }

    try {
      setProcesando(true);
      setResumenPrevio(carrito);

      const response = await fetch(`${API_URL}/carrito/finalizar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          direccion: direccion.trim(),
          tarjeta: tarjetaDigits,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || 'No se pudo completar la compra');
      }

      const data: CompraResponse = await response.json();
      setResultado(data);
      setDireccionConfirmada(direccion.trim());
      setTarjetaConfirmada(tarjetaDigits);
      setMensaje('Compra realizada con éxito');
      setCarrito(null);
      setDireccion('');
      setTarjeta('');
      setFormErrors({});
    } catch (err) {
      console.error('Error al finalizar compra:', err);
      setErrorGeneral(err instanceof Error ? err.message : 'Error al finalizar la compra');
    } finally {
      setProcesando(false);
    }
  };

  const resumenActual = resultado ? resumenPrevio : carrito;

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Preparando checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finalizar compra</h1>
              <p className="text-gray-600 mt-2">Revisa tu carrito y completa los datos para confirmar.</p>
            </div>
            <div className="flex items-center gap-4">
              {nombreUsuario && (
                <span className="nav-username">Hola, {nombreUsuario}</span>
              )}
              <button
                onClick={() => router.push('/')}
                className="btn-link"
              >
                ← Volver al catálogo
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {mensaje && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {mensaje}
          </div>
        )}

        {errorGeneral && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errorGeneral}
          </div>
        )}

        {!resumenActual || resumenActual.items.length === 0 ? (
          <div className="card-surface p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Agrega productos desde el catálogo antes de finalizar la compra.</p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Volver al catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="card-surface p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Productos en tu compra</h2>
                <p className="text-sm text-gray-500">{resumenActual.items.length} artículo{resumenActual.items.length !== 1 ? 's' : ''}</p>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {resumenActual.items.map((item) => (
                  <div key={item.producto_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.nombre}</p>
                        <p className="text-xs text-gray-500">{item.categoria}</p>
                      </div>
                      <span className="text-sm text-gray-500">x{item.cantidad}</span>
                    </div>
                    <div className="flex justify-between mt-3 text-sm text-gray-700">
                      <span>${item.precio.toFixed(2)} c/u</span>
                      <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between"><span>Subtotal</span><span>${resumenActual.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>IVA</span><span>${resumenActual.iva.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Envío</span><span>{resumenActual.envio === 0 ? 'GRATIS' : `$${resumenActual.envio.toFixed(2)}`}</span></div>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">${resumenActual.total.toFixed(2)}</span>
              </div>

              {resultado && (
                <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-lg mt-4">
                  Compra #{resultado.compra_id} confirmada.
                </div>
              )}
            </section>

            <section className="card-surface p-6">
              {resultado ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Datos de la compra</h2>
                    <p className="text-sm text-gray-500">Revisa la información asociada a tu orden.</p>
                  </div>
                  <div className="space-y-4 text-sm text-gray-700">
                    <div>
                      <p className="font-medium text-gray-900">Dirección de envío</p>
                      <p>{direccionConfirmada}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tarjeta utilizada</p>
                      <p>{enmascararTarjeta(tarjetaConfirmada)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Comprobante</p>
                      <p>ID de compra: {resultado.compra_id}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => router.push('/compras')}
                      className="btn-primary w-full"
                    >
                      Ver historial de compras
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="btn-primary w-full"
                    >
                      Seguir comprando
                    </button>
                  </div>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={realizarCompra}>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Datos de envío y pago</h2>
                    <p className="text-sm text-gray-500">Completá los datos para confirmar la compra.</p>
                  </div>

                  <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección completa
                    </label>
                    <input
                      id="direccion"
                      name="direccion"
                      type="text"
                      value={direccion}
                      onChange={(event) => setDireccion(event.target.value)}
                      placeholder="Ej: Av. Siempre Viva 742, Springfield"
                      className={`input-field ${formErrors.direccion ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                    {formErrors.direccion && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.direccion}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="tarjeta" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de tarjeta
                    </label>
                    <input
                      id="tarjeta"
                      name="tarjeta"
                      inputMode="numeric"
                      maxLength={19}
                      value={tarjeta}
                      onChange={(event) => setTarjeta(formatearTarjeta(event.target.value))}
                      placeholder="1234 5678 9012 3456"
                      className={`input-field ${formErrors.tarjeta ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                    {formErrors.tarjeta && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.tarjeta}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-lg text-sm">
                    <p>Verifica que la dirección y la tarjeta sean correctas. El total a abonar es <span className="font-semibold">${resumenActual.total.toFixed(2)}</span>.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={procesando}
                    className="btn-primary w-full disabled:opacity-60"
                  >
                    {procesando ? 'Procesando compra...' : 'Confirmar compra'}
                  </button>
                </form>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
