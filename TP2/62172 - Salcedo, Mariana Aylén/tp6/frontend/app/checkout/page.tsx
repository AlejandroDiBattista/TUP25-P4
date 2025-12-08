'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CreditCard, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrecio, vaciarCarrito } = useCart();
  const [procesando, setProcesando] = useState(false);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [cargando, setCargando] = useState(true);
  
  // Estados para datos de envío
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // Estados para datos de tarjeta
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [errorFecha, setErrorFecha] = useState('');

  // Verificar si hay items al cargar
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    } else {
      setCargando(false);
    }
  }, [items, router]);

  // Formatear número de tarjeta con espacios cada 4 dígitos
  const formatearNumeroTarjeta = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, '');
    const grupos = soloNumeros.match(/.{1,4}/g);
    return grupos ? grupos.join(' ') : soloNumeros;
  };

  const handleNumeroTarjetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const formateado = formatearNumeroTarjeta(valor);
    if (formateado.replace(/\s/g, '').length <= 16) {
      setNumeroTarjeta(formateado);
    }
  };

  // Formatear fecha de vencimiento con /
  const handleFechaVencimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const valorAnterior = fechaVencimiento;
    
    // Si está borrando (el nuevo valor es más corto que el anterior)
    const estaBorrando = input.length < valorAnterior.length;
    
    if (estaBorrando) {
      // Si borra y queda "12/", remover también la /
      if (input === valorAnterior.slice(0, -1) && input.endsWith('/')) {
        setFechaVencimiento(input.slice(0, -1));
        setErrorFecha('');
        return;
      }
      setFechaVencimiento(input);
      setErrorFecha('');
      return;
    }
    
    // Remover todo excepto números
    let valor = input.replace(/\D/g, '');
    
    // Formatear con /
    if (valor.length >= 2) {
      valor = valor.slice(0, 2) + '/' + valor.slice(2, 4);
    }
    
    setFechaVencimiento(valor);
    
    // Validar en tiempo real cuando tenga formato completo MM/AA
    if (valor.length === 5) {
      const [mes, anio] = valor.split('/');
      const mesNum = parseInt(mes, 10);
      const anioNum = parseInt('20' + anio, 10);
      
      if (mesNum < 1 || mesNum > 12) {
        setErrorFecha('Mes inválido');
        return;
      }
      
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1;
      const anioActual = fechaActual.getFullYear();
      
      if (anioNum < anioActual || (anioNum === anioActual && mesNum < mesActual)) {
        setErrorFecha('Tarjeta vencida');
      } else {
        setErrorFecha('');
      }
    } else {
      setErrorFecha('');
    }
  };

  // Formatear CVV solo números
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 4) {
      setCvv(valor);
    }
  };

  const handleConfirmarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que haya items
    if (items.length === 0) {
      alert('El carrito está vacío');
      router.push('/cart');
      return;
    }

    // Validar campos obligatorios
    if (!direccion || !ciudad || !codigoPostal || !telefono) {
      alert('Por favor completa todos los datos de envío');
      return;
    }

    if (!numeroTarjeta || !nombreTitular || !fechaVencimiento || !cvv) {
      alert('Por favor completa todos los datos de pago');
      return;
    }

    // Validar fecha de vencimiento
    const [mes, anio] = fechaVencimiento.split('/');
    if (mes && anio) {
      const mesNum = parseInt(mes, 10);
      const anioNum = parseInt('20' + anio, 10);
      
      // Validar que el mes sea válido
      if (mesNum < 1 || mesNum > 12) {
        alert('El mes debe estar entre 01 y 12');
        return;
      }
      
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1;
      const anioActual = fechaActual.getFullYear();
      
      // Validar que la fecha sea posterior a la actual
      if (anioNum < anioActual || (anioNum === anioActual && mesNum < mesActual)) {
        alert('La tarjeta está vencida. Por favor ingresa una fecha válida');
        return;
      }
    } else {
      alert('Formato de fecha inválido. Usa MM/AA');
      return;
    }

    setProcesando(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Preparar datos de la compra
      const compraData = {
        items: items.map(item => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad
        })),
        direccion,
        ciudad,
        codigo_postal: codigoPostal,
        telefono
      };

      const response = await fetch('http://localhost:8000/carrito/finalizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(compraData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al procesar la compra');
      }

      const compra = await response.json();
      
      // Limpiar carrito
      vaciarCarrito();
      
      // Mostrar mensaje de éxito y redirigir
      setMostrarToast(true);
      
      setTimeout(() => {
        router.push(`/purchases/${compra.id}`);
      }, 1500);
      
    } catch (error: any) {
      alert(error.message || 'Error al finalizar la compra');
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Cargando...</p>
      </div>
    );
  }

  const IVA = totalPrecio * 0.21;
  const ENVIO = 50;
  const TOTAL = totalPrecio + IVA + ENVIO;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {mostrarToast && (
        <Toast
          mensaje="¡Compra realizada con éxito!"
          onClose={() => setMostrarToast(false)}
        />
      )}

      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/cart')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al carrito
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Finalizar compra
      </h1>

      <form onSubmit={handleConfirmarCompra}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formularios */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos de envío */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Datos de envío
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <Input
                    type="text"
                    placeholder="Calle y número"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <Input
                      type="text"
                      placeholder="Ciudad"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <Input
                      type="text"
                      placeholder="CP"
                      value={codigoPostal}
                      onChange={(e) => setCodigoPostal(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    placeholder="Teléfono de contacto"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Datos de pago */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Tarjeta
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de tarjeta
                  </label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={numeroTarjeta}
                    onChange={handleNumeroTarjetaChange}
                    maxLength={19}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del titular
                  </label>
                  <Input
                    type="text"
                    placeholder="Como aparece en la tarjeta"
                    value={nombreTitular}
                    onChange={(e) => setNombreTitular(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de vencimiento
                    </label>
                    <Input
                      type="text"
                      placeholder="MM/AA"
                      value={fechaVencimiento}
                      onChange={handleFechaVencimientoChange}
                      maxLength={5}
                      required
                      className={errorFecha ? 'border-red-500' : ''}
                    />
                    {errorFecha && (
                      <p className="text-red-500 text-xs mt-1">{errorFecha}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={handleCvvChange}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Resumen del carrito */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resumen del carrito
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.producto.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.producto.titulo}
                      </p>
                      <p className="text-gray-600">
                        Cantidad: {item.cantidad}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(item.producto.precio * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Total productos:</span>
                  <span className="font-medium">${totalPrecio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (21%):</span>
                  <span className="font-medium">${IVA.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío:</span>
                  <span className="font-medium">${ENVIO.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total a pagar:</span>
                  <span className="text-blue-600">${TOTAL.toFixed(2)}</span>
                </div>
              </div>

              {/* Botón */}
              <Button
                type="submit"
                className="w-full mt-6"
                size="lg"
                disabled={procesando}
              >
                {procesando ? 'Procesando...' : 'Confirmar compra'}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al confirmar aceptas nuestros términos y condiciones
              </p>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
