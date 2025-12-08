"use client";

import { useEffect, useState } from "react";
import { obtenerCompras, obtenerDetalleCompra } from "../services/productos";

export default function MisComprasPage() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [compras, setCompras] = useState<any[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<any | null>(null);
  const [detalleCompra, setDetalleCompra] = useState<any | null>(null);

  useEffect(() => {
    const id = Number(localStorage.getItem("usuario_id"));
    if (!id) window.location.href = "/ingresar";
    setUsuarioId(id || null);

    async function load() {
      if (!id) return;
      const data = await obtenerCompras(id);
      setCompras(data);
      
      // Seleccionar la primera compra por defecto
      if (data.length > 0) {
        seleccionarCompra(data[0].id);
      }
    }
    load();
  }, []);

  async function seleccionarCompra(compraId: number) {
    const compra = compras.find(c => c.id === compraId);
    setCompraSeleccionada(compra);
    
    const detalle = await obtenerDetalleCompra(compraId);
    setDetalleCompra(detalle);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Título */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis compras</h1>

      {compras.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="text-gray-600">No tenés compras todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Lista de compras (izquierda) */}
          <div className="lg:col-span-1 space-y-3">
            {compras.map((compra) => (
              <div
                key={compra.id}
                onClick={() => seleccionarCompra(compra.id)}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition hover:shadow-md ${
                  compraSeleccionada?.id === compra.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                <p className="font-semibold text-gray-900 mb-1">Compra #{compra.id}</p>
                <p className="text-sm text-gray-600 mb-2">{compra.fecha}</p>
                <p className="text-lg font-bold text-gray-900">Total: ${compra.total.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Detalle de la compra (derecha) */}
          <div className="lg:col-span-2">
            {detalleCompra && compraSeleccionada ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalle de la compra</h2>

                {/* Información general */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Compra #:</p>
                    <p className="font-semibold text-gray-900">{compraSeleccionada.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha:</p>
                    <p className="font-semibold text-gray-900">{compraSeleccionada.fecha}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dirección:</p>
                    <p className="font-semibold text-gray-900">{compraSeleccionada.direccion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tarjeta:</p>
                    <p className="font-semibold text-gray-900">{compraSeleccionada.tarjeta}</p>
                  </div>
                </div>

                {/* Productos */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Productos</h3>
                  <div className="space-y-3">
                    {detalleCompra.items?.map((item: any, index: number) => {
                      const ivaRate = 0.21; // Ajustar según categoría si está disponible
                      const subtotalItem = item.precio_unitario * item.cantidad;
                      const ivaItem = subtotalItem * ivaRate;
                      
                      return (
                        <div key={index} className="border-b pb-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-900">{item.nombre}</span>
                            <span className="font-semibold text-gray-900">${subtotalItem.toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Cantidad: {item.cantidad}</p>
                            <p>IVA: ${ivaItem.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Totales */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${compraSeleccionada.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>IVA:</span>
                    <span className="font-semibold">${compraSeleccionada.iva.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Envío:</span>
                    <span className="font-semibold">${compraSeleccionada.envio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-gray-900 pt-3 border-t">
                    <span>Total pagado:</span>
                    <span>${compraSeleccionada.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border rounded-lg p-8 text-center">
                <p className="text-gray-600">Selecciona una compra para ver el detalle</p>
              </div>
            )}
          </div>

        </div>
      )}
    </main>
  );
}
