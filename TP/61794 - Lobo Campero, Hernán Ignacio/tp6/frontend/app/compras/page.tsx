"use client";

import { useState, useEffect } from "react";
import { Compra, Producto } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";
import { obtenerCompras } from "@/app/services/compras";
import { obtenerProductos } from "@/app/services/productos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function ComprasPage() {
  const { token, isAutenticado } = useAuth();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [productos, setProductos] = useState<{ [key: number]: Producto }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompra, setSelectedCompra] = useState<number | null>(null);

  useEffect(() => {
    if (!isAutenticado || !token) return;

    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        const comprasData = await obtenerCompras(token);
        setCompras(comprasData);

        // Cargar info de productos
        const productosData = await obtenerProductos();
        const productosMap: { [key: number]: Producto } = {};
        productosData.forEach((p) => {
          productosMap[p.id] = p;
        });
        setProductos(productosMap);
      } catch (err: any) {
        setError(err.message || "Error al cargar compras");
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [isAutenticado, token]);

  if (!isAutenticado) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTitle>No autenticado</AlertTitle>
          <AlertDescription>
            Debes <Link href="/auth" className="underline font-bold">iniciar sesión</Link> para ver tus compras.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">Cargando compras...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (compras.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>No hay compras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Aún no tienes compras registradas.</p>
            <Link href="/">
              <Button>Ir a la tienda</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const compraSeleccionada = selectedCompra
    ? compras.find((c) => c.id === selectedCompra)
    : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8 text-black">Mis compras</h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Lista de compras - IZQUIERDA */}
          <div>
            <div className="space-y-3">
              {compras.map((compra) => (
                <div
                  key={compra.id}
                  onClick={() => setSelectedCompra(compra.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedCompra === compra.id
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <h3 className="font-bold text-gray-900">Compra #{compra.id}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(compra.fecha).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    Total: ${compra.total.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Detalles de compra - DERECHA */}
          {compraSeleccionada ? (
            <div>
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-black">Detalle de la compra</h2>

                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-300">
                  <div>
                    <p className="text-sm text-gray-600">Compra #:</p>
                    <p className="font-semibold text-gray-900">{compraSeleccionada.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha:</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(compraSeleccionada.fecha).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dirección:</p>
                    <p className="font-semibold text-gray-900">{compraSeleccionada.direccion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tarjeta:</p>
                    <p className="font-semibold text-gray-900">
                      •••• •••• •••• {compraSeleccionada.tarjeta_ultimos_digitos}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Productos</h3>
                  <div className="space-y-4">
                    {compraSeleccionada.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start border-b border-gray-200 pb-3 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.nombre}</p>
                          <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${(item.cantidad * item.precio_unitario).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">
                            IVA: ${(
                              (item.precio_unitario * item.cantidad * 0.21)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-900">
                      ${(
                        compraSeleccionada.total -
                        compraSeleccionada.iva -
                        compraSeleccionada.envio
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>IVA:</span>
                    <span className="font-semibold text-gray-900">
                      ${compraSeleccionada.iva.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Envío:</span>
                    <span className="font-semibold text-gray-900">
                      ${compraSeleccionada.envio.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-3 text-black">
                    <span>Total pagado:</span>
                    <span>${compraSeleccionada.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-gray-500 text-center">
                Selecciona una compra para ver los detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
