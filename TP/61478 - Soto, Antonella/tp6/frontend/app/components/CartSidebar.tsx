"use client";
import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CartSidebarProps {
  onCartChange?: () => void;
}

export default function CartSidebar({ onCartChange }: CartSidebarProps) {
  const { items, subtotal, iva, envio, total, decrementItem, addToCart, removeFromCart, highlightCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleDecrement = async (productId: number) => {
    await decrementItem(productId);
    if (onCartChange) onCartChange();
  };

  const handleIncrement = async (productId: number) => {
    await addToCart(productId, 1);
    if (onCartChange) onCartChange();
  };

  const handleRemove = async (productId: number) => {
    await removeFromCart(productId);
    if (onCartChange) onCartChange();
  };

  if (!isAuthenticated) {
    return (
      <div className={`bg-slate-800 border p-6 rounded-2xl shadow-xl transition-all duration-500 ${
        highlightCart 
          ? 'border-cyan-400 bg-cyan-400/5 shadow-cyan-400/20 scale-105' 
          : 'border-slate-700'
      }`}>
        <p className={`text-center transition-colors duration-500 ${
          highlightCart ? 'text-cyan-300' : 'text-slate-300'
        }`}>
          Inicia sesión para ver y editar tu carrito.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-slate-100">Carrito vacío</h2>
        <p className="text-slate-400">Agrega productos para comenzar tu compra.</p>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl space-y-4">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
        Tu Carrito
      </h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {items.map((item) => {
          const producto = item.producto;
          const titulo = producto.nombre || producto.titulo || 'Producto';
          const imagenUrl = producto.imagen ? `${API_URL}/${producto.imagen}` : '';
          return (
            <div key={producto.id} className="flex gap-3 border-b border-slate-700 pb-3 p-3 rounded-xl bg-slate-750 hover:bg-slate-700 transition-colors">
              <div className="relative w-16 h-16 bg-slate-700 rounded-lg flex-shrink-0 border border-slate-600">
                {producto.imagen ? (
                  <Image
                    src={imagenUrl}
                    alt={titulo}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-slate-100">{titulo}</h3>
                <p className="text-xs text-slate-400">${producto.precio} c/u</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">Cantidad:</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleDecrement(producto.id)}
                      className="w-7 h-7 bg-slate-700 text-cyan-400 rounded-lg flex items-center justify-center hover:bg-slate-600 border border-slate-600 transition-all font-bold"
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold w-8 text-center text-slate-100">{item.cantidad}</span>
                    <button 
                      onClick={() => handleIncrement(producto.id)}
                      className="w-7 h-7 bg-slate-700 text-cyan-400 rounded-lg flex items-center justify-center hover:bg-slate-600 border border-slate-600 transition-all font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(producto.id)}
                  className="text-xs text-red-400 hover:text-red-300 mt-1.5 transition-colors"
                >
                  Eliminar
                </button>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-100">${(producto.precio * item.cantidad).toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-slate-700 pt-4">
        <div className="flex justify-between text-slate-300">
          <span>Subtotal</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>IVA</span>
          <span className="font-semibold">${iva.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Envío</span>
          <span className="font-semibold">{envio === 0 ? "Gratis" : `$${envio.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-xl font-bold border-t border-slate-700 pt-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <button 
          onClick={() => router.push("/checkout")}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
        >
          Continuar compra
        </button>
        <button className="w-full border-2 border-slate-700 text-slate-300 py-3.5 rounded-xl hover:bg-slate-700 font-medium transition-all duration-300">
          Cancelar
        </button>
      </div>
    </div>
  );
}
