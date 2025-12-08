"use client";

import { useState, useEffect } from "react";
import { Carrito as CarritoType, Producto } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";
import {
  obtenerCarrito,
  eliminarDelCarrito,
  finalizarCompra,
  cancelarCarrito,
} from "@/app/services/carrito";
import { obtenerProductos } from "@/app/services/productos";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import Link from "next/link";

export default function CarritoPage() {
  const { token, isAutenticado } = useAuth();
  const [carrito, setCarrito] = useState<CarritoType | null>(null);
  const [productos, setProductos] = useState<{ [key: number]: Producto }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [isFinalizando, setIsFinalizando] = useState(false);

  useEffect(() => {
    if (!isAutenticado || !token) return;

    const cargarCarrito = async () => {
      try {
        setIsLoading(true);
        const carritoData = await obtenerCarrito(token);
        setCarrito(carritoData);

        // Cargar info de productos
        const productosData = await obtenerProductos();
        const productosMap: { [key: number]: Producto } = {};
        productosData.forEach((p) => {
          productosMap[p.id] = p;
        });
        setProductos(productosMap);
      } catch (err: any) {
        setError(err.message || "Error al cargar el carrito");
      } finally {
        setIsLoading(false);
      }
    };

    cargarCarrito();
  }, [isAutenticado, token]);

  const eliminarItem = async (itemId: number) => {
    if (!token) {
      setError("Sesión expirada. Por favor inicia sesión nuevamente.");
      return;
    }

    try {
      setError(null);
      const nuevoCarrito = await eliminarDelCarrito(token, itemId);
      setCarrito(nuevoCarrito);
    } catch (err: any) {
      const mensajeError = err.message || "Error al eliminar el producto";
      setError(mensajeError);
      console.error("Error al eliminar:", err);
    }
  };

  const calcularTotales = () => {
    if (!carrito || !carrito.items) return { subtotal: 0, iva: 0, envio: 0, total: 0 };

    let subtotal = 0;
    let iva = 0;

    carrito.items.forEach((item) => {
      const producto = productos[item.producto_id];
      subtotal += item.cantidad * item.precio_unitario;

      // Calcular IVA según categoría
      if (producto && producto.categoria.toLowerCase() === "electrónica") {
        iva += item.cantidad * item.precio_unitario * 0.1;
      } else {
        iva += item.cantidad * item.precio_unitario * 0.21;
      }
    });

    const envio = subtotal > 1000 ? 0 : 50;
    const total = subtotal + iva + envio;

    return { subtotal, iva, envio, total };
  };

  const handleCheckout = async () => {
    if (!token || !carrito) {
      setError("Sesión expirada. Por favor inicia sesión nuevamente.");
      return;
    }

    if (!direccion.trim()) {
      setError("Por favor ingresa una dirección de envío");
      return;
    }

    if (!tarjeta.trim()) {
      setError("Por favor ingresa el número de tarjeta");
      return;
    }

    if (tarjeta.length < 4) {
      setError("Por favor ingresa al menos los últimos 4 dígitos de la tarjeta");
      return;
    }

    try {
      setIsFinalizando(true);
      setError(null);
      await finalizarCompra(token, direccion, tarjeta);
      // Redirigir a compras o mostrar confirmación
      window.location.href = "/compras";
    } catch (err: any) {
      const mensajeError = err.message || "Error al finalizar la compra";
      setError(mensajeError);
      console.error("Error al finalizar compra:", err);
    } finally {
      setIsFinalizando(false);
    }
  };

  if (!isAutenticado) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTitle>No autenticado</AlertTitle>
          <AlertDescription>
            Debes <Link href="/auth" className="underline font-bold">iniciar sesión</Link> para ver tu carrito.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">Cargando carrito...</div>;
  }

  if (error && !carrito) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Carrito vacío</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Tu carrito está vacío. Vuelve a la tienda para agregar productos.</p>
            <Link href="/">
              <Button>Volver a la tienda</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { subtotal, iva, envio, total } = calcularTotales();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8 text-black">Finalizar compra</h1>

        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {/* Resumen del carrito - IZQUIERDA */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 text-black">Resumen del carrito</h2>
              
              <div className="space-y-6">
                {carrito.items.map((item) => {
                  const producto = productos[item.producto_id];
                  if (!producto) return null;

                  return (
                    <div key={item.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{producto.titulo}</h3>
                          <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${(item.cantidad * item.precio_unitario).toFixed(2)}</p>
                          <p className="text-xs text-gray-600">
                            IVA: ${((producto && producto.categoria && producto.categoria.toLowerCase() === "electrónica" ? 0.1 : 0.21) * item.cantidad * item.precio_unitario).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarItem(item.id)}
                        className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 p-0 h-auto"
                      >
                        Eliminar
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Total productos:</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>IVA:</span>
                  <span className="font-semibold text-gray-900">${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Envío:</span>
                  <span className="font-semibold text-gray-900">${envio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 text-black">
                  <span>Total a pagar:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Datos de envío - DERECHA */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 text-black">Datos de envío</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Dirección
                  </label>
                  <Input
                    placeholder="Ingresa tu dirección de entrega"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tarjeta
                  </label>
                  <Input
                    placeholder="Últimos 4 dígitos"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={tarjeta}
                    onChange={(e) => {
                      // Solo permitir números y máximo 4 caracteres
                      const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setTarjeta(valor);
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition"
                  onClick={handleCheckout}
                  disabled={isFinalizando}
                >
                  {isFinalizando ? "Procesando..." : "Confirmar compra"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold py-3 rounded-lg transition"
                  onClick={async () => {
                    try {
                      if (token) {
                        await cancelarCarrito(token);
                        window.location.href = "/";
                      }
                    } catch (err: any) {
                      setError(err.message || "Error al cancelar carrito");
                    }
                  }}
                >
                  Cancelar compra
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
