"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const { user, loading } = useAuth();
  const { items, subtotal, iva, envio, total, fetchCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!direccion || !tarjeta) {
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/carrito/finalizar", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user?.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ direccion, tarjeta })
      });

      if (res.ok) {
        const data = await res.json();
        // Recargar el carrito para vaciarlo
        await fetchCart();
        // Redirigir a la página de inicio (catálogo)
        router.push("/");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-300 text-lg">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Tu carrito está vacío
          </h2>
          <button 
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
          >
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          Finalizar compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen del carrito */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-slate-200">Resumen del carrito</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => {
                const producto = item.producto;
                const titulo = producto.nombre || producto.titulo || 'Producto';
                const precioTotal = producto.precio * item.cantidad;
                const ivaProducto = precioTotal * 0.21;
                
                return (
                  <div key={producto.id} className="border-b border-slate-700 pb-3">
                    <h3 className="font-semibold text-slate-200">{titulo}</h3>
                    <p className="text-sm text-slate-400">Cantidad: {item.cantidad}</p>
                    <p className="font-bold text-cyan-400">${precioTotal.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">IVA: ${ivaProducto.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 border-t border-slate-600 pt-4">
              <div className="flex justify-between text-slate-300">
                <span>Total productos:</span>
                <span className="font-semibold text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>IVA:</span>
                <span className="font-semibold text-slate-200">${iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Envío:</span>
                <span className="font-semibold text-slate-200">${envio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t border-slate-600 pt-3 mt-2">
                <span className="text-slate-200">Total a pagar:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Formulario de datos de envío */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-slate-200">Datos de envío</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium mb-2 text-slate-300">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                  placeholder="Ingresa tu dirección de envío"
                  required
                />
              </div>

              <div>
                <label htmlFor="tarjeta" className="block text-sm font-medium mb-2 text-slate-300">
                  Tarjeta
                </label>
                <input
                  type="text"
                  id="tarjeta"
                  value={tarjeta}
                  onChange={(e) => setTarjeta(e.target.value)}
                  className="w-full bg-slate-700 border-2 border-slate-600 text-slate-100 placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                  placeholder="Número de tarjeta"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
              >
                Confirmar compra
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full border-2 border-slate-600 text-slate-300 py-3.5 rounded-xl hover:bg-slate-700 hover:border-cyan-500 hover:text-cyan-400 font-medium transition-all duration-300"
              >
                Volver al carrito
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
