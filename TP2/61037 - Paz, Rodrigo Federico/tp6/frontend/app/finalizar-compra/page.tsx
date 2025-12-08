"use client";

import { useEffect, useState } from "react";
import { finalizarCompra, obtenerCarrito } from "../services/productos";
import Toast from "../components/Toast";

export default function FinalizarCompraPage() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const id = Number(localStorage.getItem("usuario_id"));
    if (!id) window.location.href = "/ingresar";
    setUsuarioId(id || null);

    async function cargarCarrito() {
      if (!id) return;
      const data = await obtenerCarrito(id);
      setItems(data);
    }
    cargarCarrito();
  }, []);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  async function handlePagar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioId) return;
    
    try {
      const r = await finalizarCompra(usuarioId, direccion, tarjeta);
      setToast({ message: `Compra realizada con éxito. Total pagado: $${r.total_pagado}`, type: "success" });
      setTimeout(() => {
        window.location.href = "/mis-compras";
      }, 2000);
    } catch (error: any) {
      setToast({ message: error.message || "Error al finalizar la compra", type: "error" });
    }
  }

  // Cálculos
  const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
  const ivaTotal = items.reduce((acc, it) => {
    const rate = (it.categoria || "").toLowerCase() === "electrónica" ? 0.10 : 0.21;
    return acc + it.subtotal * rate;
  }, 0);
  const envio = subtotal > 1000 ? 0 : 50;
  const total = subtotal + ivaTotal + envio;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Título */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Resumen del carrito (izquierda) */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen del carrito</h2>

          {/* Lista de productos */}
          <div className="space-y-4 mb-6">
            {items.map((item) => {
              const ivaRate = (item.categoria || "").toLowerCase() === "electrónica" ? 0.10 : 0.21;
              const ivaItem = item.subtotal * ivaRate;
              
              return (
                <div key={item.producto_id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900">{item.nombre}</span>
                    <span className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Cantidad: {item.cantidad}</p>
                    <p>IVA: ${ivaItem.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totales */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-gray-700">
              <span>Total productos: ${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>IVA: ${ivaTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Envío: ${envio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-900 pt-2 border-t">
              <span>Total a pagar:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Datos de envío (derecha) */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Datos de envío</h2>

          <form onSubmit={handlePagar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                className="border border-gray-300 w-full rounded-md px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarjeta
              </label>
              <input
                type="text"
                className="border border-gray-300 w-full rounded-md px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={tarjeta}
                onChange={(e) => setTarjeta(e.target.value)}
                inputMode="numeric"
                placeholder="16 dígitos"
                minLength={16}
                maxLength={16}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0A2540] hover:bg-[#0D3158] text-white py-3 rounded-md font-medium mt-6"
            >
              Confirmar compra
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
