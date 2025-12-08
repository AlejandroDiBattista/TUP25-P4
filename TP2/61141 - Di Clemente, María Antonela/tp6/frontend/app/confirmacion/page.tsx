"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCarrito } from "@/app/components/CarritoContext";
import { Producto } from "../types";

export default function ConfirmarCompra() {
  const router = useRouter(); 
  const { cartItems, cargarCarritoDesdeLocalStorage, vaciarCarrito } = useCarrito();

  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIVA] = useState(0);
  const [envio, setEnvio] = useState(0);
  const [total, setTotal] = useState(0);
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");

      const handleSalir = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    router.push("/iniciar-sesion");
  };

  // Cargar carrito y calcular totales
  useEffect(() => {
    cargarCarritoDesdeLocalStorage();
  }, []);

  useEffect(() => {
    calcularTotales(cartItems);
  }, [cartItems]);

  const calcularTotales = (items: Producto[]) => {
    let sub = 0;
    let ivaTotal = 0;
    items.forEach((item) => {
      const precioItem = item.precio * item.existencia;
      sub += precioItem;
      const iva = item.categoria?.toLowerCase() === "electrónica" ? 0.1 : 0.21;
      ivaTotal += precioItem * iva;
    });

    const envioCosto = sub + ivaTotal > 1000 ? 0 : 50;
    setSubtotal(sub);
    setIVA(ivaTotal);
    setEnvio(envioCosto);
    setTotal(sub + ivaTotal + envioCosto);
  };

  //Guarda la compra en LocalStorage
    const guardarHistorial = () => {
    const nuevaCompra = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      direccion,
      tarjeta: `****-****-****-${tarjeta.slice(-4)}`,
      productos: cartItems,
      subtotal,
      iva,
      envio,
      total,
    };

    const historialPrevio = JSON.parse(localStorage.getItem("historialCompras") || "[]");
    historialPrevio.unshift(nuevaCompra);
    localStorage.setItem("historialCompras", JSON.stringify(historialPrevio));
  };

  const finalizarCompra = () => {
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (!direccion || !tarjeta) {
      alert("Por favor, completá dirección y tarjeta.");
      return;
    }

    guardarHistorial();
    vaciarCarrito();
    alert("!Compra finalizada con exito!");
    router.push("/mis-compras")
  };

return (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900 font-serif tracking-tight">
          TP6 Shop
        </h1>
        <nav className="flex items-center gap-5 ml-[-40px]">
          <button
            onClick={() => router.push("/")}
            className="text-gray-700 hover:text-blue-600"
          >
            Productos
          </button>

          <button
            onClick={() => router.push("/mis-compras")}
            className="text-gray-700 hover:text-blue-600"
          >
            Mis compras
          </button>

          <button
            onClick={handleSalir}
            className="text-red-600 hover:text-red-800 transition"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>

    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">Resumen del carrito</h2>

          {cartItems.length === 0 ? (
            <p className="text-gray-500">Tu carrito está vacío.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="mb-4 border-b pb-2">
                <p className="font-medium">{item.titulo}</p>
                <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                <div className="flex justify-between text-gray-700 text-sm mt-1">
                  <span>IVA: ${(item.precio * 0.21).toFixed(2)}</span>
                  <span className="font-medium">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}

          <div className="border-t pt-4 mt-2 text-sm">
            <p className="flex justify-between">
              <span>Total productos:</span> <span>${subtotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span>IVA:</span> <span>${iva.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span>Envío:</span> <span>${envio.toFixed(2)}</span>
            </p>
            <p className="flex justify-between font-semibold text-lg mt-2">
              <span>Total a pagar:</span> <span>${total.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="border rounded-xl p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">Datos de envío</h2>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)} 
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Tarjeta"
              maxLength={16}
              value={tarjeta}
              onChange={(e) => setTarjeta(e.target.value)} 
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={finalizarCompra}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-lg"
            >
              Confirmar compra
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}