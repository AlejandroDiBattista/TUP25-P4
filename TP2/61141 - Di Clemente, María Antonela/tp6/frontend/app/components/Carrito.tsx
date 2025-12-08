"use client";

import Image from "next/image";
import { useCarrito } from "./CarritoContext";

export default function Carrito() {
  const { cartItems: productos, vaciarCarrito, agregarAlCarrito, eliminarDelCarrito } = useCarrito();

  const subtotal = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const iva = subtotal * 0.21;
  const envio = subtotal > 0 ? 50 : 0;
  const total = subtotal + iva + envio;

  return (
    <div className="w-80 bg-white border rounded-xl p-4 shadow-sm">
      {/* Lista de productos */}
      <div className="space-y-4">
        {productos.map((producto) => {
          const imagenUrl = `http://localhost:8000/${producto.imagen}`;

          return (
            <div key={producto.id} className="flex items-center gap-3">
              <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imagenUrl}
                  alt={producto.titulo}
                  className="w-16 h-16 object-contain rounded-lg"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {producto.titulo}
                </p>
                <p className="text-xs text-gray-500">
                  ${producto.precio.toFixed(2)} c/u
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Cantidad:</span>
                  <button
                    className="px-2 py-1 border rounded text-gray-700 hover:bg-gray-100"
                     onClick={() => eliminarDelCarrito(producto.id)}
                  >
                    −
                  </button>

                  <span className="text-sm">{producto.cantidad}</span>

                  <button
                    className="px-2 py-1 border rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => agregarAlCarrito(producto)} // aumenta 1 unidad
                    disabled={producto.cantidad >= producto.existencia} // no puede superar stock
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                ${(producto.precio * producto.cantidad).toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Totales */}
      <div className="border-t mt-4 pt-4 space-y-1 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA</span>
          <span>${iva.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Envío</span>
          <span>${envio.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 pt-1 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between mt-5">
        <button
          onClick={() => {
            vaciarCarrito(); // vacía el carrito al cancelar
          }}
          className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
        >
          ✕ Cancelar
        </button>
        <button
          onClick={() => {
            window.location.href = "/confirmacion";
          }}
          className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
        >
          Continuar compra
        </button>
      </div>
    </div>
  );
}
