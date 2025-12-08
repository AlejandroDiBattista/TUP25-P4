'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { useCarrito } from '@/app/hooks/useCarrito'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ShoppingCart, CreditCard, MapPin, Loader2, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { usuario } = useAuth()
  const { carrito, loading, finalizar } = useCarrito()
  const [isProcessing, setIsProcessing] = useState(false)

  // Construir URL de la API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // Validaciones iniciales
  useEffect(() => {
    if (!loading) {
      if (!usuario) {
        toast.error('Debes iniciar sesión para continuar')
        router.push('/login')
        return
      }

      if (!carrito || carrito.items.length === 0) {
        toast.error('No hay productos para procesar')
        router.push('/')
        return
      }
    }
  }, [usuario, carrito, loading, router])

  // Datos del formulario
  const [datosEnvio, setDatosEnvio] = useState({
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    telefono: ''
  })

  const [datosPago, setDatosPago] = useState({
    nombreTitular: '',
    numeroTarjeta: '',
    vencimiento: '',
    cvv: ''
  })

  // Validaciones
  const [errores, setErrores] = useState({
    direccion: '',
    numeroTarjeta: ''
  })

  const validarFormulario = () => {
    const nuevosErrores = { direccion: '', numeroTarjeta: '' }
    let esValido = true

    // Validar dirección (mínimo 10 caracteres)
    if (datosEnvio.direccion.length < 10) {
      nuevosErrores.direccion = 'La dirección debe tener al menos 10 caracteres'
      esValido = false
    }

    // Validar número de tarjeta (16 dígitos)
    const soloDigitos = datosPago.numeroTarjeta.replace(/\s/g, '')
    if (soloDigitos.length !== 16) {
      nuevosErrores.numeroTarjeta = 'El número de tarjeta debe tener 16 dígitos'
      esValido = false
    }

    setErrores(nuevosErrores)
    return esValido
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) {
      toast.error('Por favor, revisa los campos marcados en rojo')
      return
    }

    setIsProcessing(true)

    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Preparar dirección completa
      const direccionCompleta = `${datosEnvio.direccion}, ${datosEnvio.ciudad}, CP: ${datosEnvio.codigoPostal}`

      // Finalizar compra (pasando dirección y número de tarjeta)
      await finalizar(direccionCompleta, datosPago.numeroTarjeta)

      toast.success('¡Compra exitosa! Tu pedido ha sido procesado correctamente')

      // Redireccionar después de 1 segundo
      setTimeout(() => {
        router.push('/compras')
      }, 1000)

    } catch (error) {
      toast.error('Error al procesar el pago. Intenta nuevamente.')
      setIsProcessing(false)
    }
  }

  // Función para formatear el número de tarjeta
  const formatearNumeroTarjeta = (valor: string) => {
    const soloDigitos = valor.replace(/\D/g, '')
    const conEspacios = soloDigitos.match(/.{1,4}/g)?.join(' ') || soloDigitos
    return conEspacios.substring(0, 19) // 16 dígitos + 3 espacios
  }

  // Usar los totales calculados por el backend
  // El backend ya aplica las reglas correctas:
  // - IVA: 10% para electrónicos, 21% para otros
  // - Envío: Gratis si subtotal > $1000, sino $50
  const subtotal = carrito?.subtotal || 0
  const iva = carrito?.iva || 0
  const envio = carrito?.envio || 0
  const total = carrito?.total || 0

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!carrito || carrito.items.length === 0) {
    return null // El useEffect ya maneja la redirección
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Finalizar Compra
        </h1>
        <p className="text-muted-foreground mt-2">
          Completa tus datos para procesar el pedido
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Columna izquierda: Formularios */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos de envío */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Datos de Envío
                </CardTitle>
                <CardDescription>
                  Dirección donde se entregará tu pedido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección completa *</Label>
                  <Input
                    id="direccion"
                    placeholder="Calle, número, piso, departamento"
                    value={datosEnvio.direccion}
                    onChange={(e) => {
                      setDatosEnvio({ ...datosEnvio, direccion: e.target.value })
                      if (errores.direccion) setErrores({ ...errores, direccion: '' })
                    }}
                    className={errores.direccion ? 'border-red-500' : ''}
                    required
                  />
                  {errores.direccion && (
                    <p className="text-sm text-red-500">{errores.direccion}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad *</Label>
                    <Input
                      id="ciudad"
                      placeholder="Ciudad"
                      value={datosEnvio.ciudad}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, ciudad: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigoPostal">Código Postal *</Label>
                    <Input
                      id="codigoPostal"
                      placeholder="1234"
                      value={datosEnvio.codigoPostal}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, codigoPostal: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono de contacto *</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+54 9 381 123-4567"
                    value={datosEnvio.telefono}
                    onChange={(e) => setDatosEnvio({ ...datosEnvio, telefono: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Datos de pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Datos de Pago
                </CardTitle>
                <CardDescription>
                  Información de tu tarjeta de crédito/débito
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreTitular">Nombre del titular *</Label>
                  <Input
                    id="nombreTitular"
                    placeholder="Como aparece en la tarjeta"
                    value={datosPago.nombreTitular}
                    onChange={(e) => setDatosPago({ ...datosPago, nombreTitular: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroTarjeta">Número de tarjeta *</Label>
                  <Input
                    id="numeroTarjeta"
                    placeholder="1234 5678 9012 3456"
                    value={datosPago.numeroTarjeta}
                    onChange={(e) => {
                      const formateado = formatearNumeroTarjeta(e.target.value)
                      setDatosPago({ ...datosPago, numeroTarjeta: formateado })
                      if (errores.numeroTarjeta) setErrores({ ...errores, numeroTarjeta: '' })
                    }}
                    className={errores.numeroTarjeta ? 'border-red-500' : ''}
                    required
                  />
                  {errores.numeroTarjeta && (
                    <p className="text-sm text-red-500">{errores.numeroTarjeta}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vencimiento">Vencimiento *</Label>
                    <Input
                      id="vencimiento"
                      placeholder="MM/AA"
                      value={datosPago.vencimiento}
                      onChange={(e) => {
                        let valor = e.target.value.replace(/\D/g, '')
                        if (valor.length >= 2) {
                          valor = valor.substring(0, 2) + '/' + valor.substring(2, 4)
                        }
                        setDatosPago({ ...datosPago, vencimiento: valor })
                      }}
                      maxLength={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      value={datosPago.cvv}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, '').substring(0, 3)
                        setDatosPago({ ...datosPago, cvv: valor })
                      }}
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                {/* Mensaje de seguridad - Reemplaza Alert con div estilizado */}
                <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
                  <ShieldCheck className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium">Pago seguro</p>
                    <p className="text-blue-800 dark:text-blue-200">
                      Tus datos están protegidos con encriptación de última generación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha: Resumen */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
                <CardDescription>
                  {carrito.items.length} {carrito.items.length === 1 ? 'producto' : 'productos'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de productos */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {carrito.items.map((item) => {
                    // Construir URL completa de la imagen (igual que en ProductCard)
                    const imagenUrl = item.imagen 
                      ? `${API_URL}/${item.imagen}` 
                      : '/placeholder.jpg'
                    
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          <Image
                            src={imagenUrl}
                            alt={item.titulo}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.cantidad} × {formatearMoneda(item.precio)}
                          </p>
                          <p className="text-sm font-medium">
                            {formatearMoneda(item.precio * item.cantidad)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatearMoneda(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (21%)</span>
                    <span>{formatearMoneda(iva)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>{formatearMoneda(envio)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{formatearMoneda(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Confirmar Pago
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/')}
                  disabled={isProcessing}
                >
                  Volver al catálogo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
