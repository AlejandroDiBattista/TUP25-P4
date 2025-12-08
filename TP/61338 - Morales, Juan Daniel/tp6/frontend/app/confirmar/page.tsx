// confirmar/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Carrito } from "../services/productos";

interface CarritoItem {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export default function ConfirmarCompraPage() {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCarrito = async () => {
      try {
        const data = await Carrito.ver();
        setCarrito(data.items || []);
      } catch (error) {
        alert("Error al cargar el carrito");
      }
    };
    fetchCarrito();
  }, []);

  const ivaItem = (item: CarritoItem) =>
    (item.precio_unitario * item.cantidad) *
    (item.nombre.toLowerCase().includes("electro") ? 0.1 : 0.21);

  const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const ivaTotal = carrito.reduce((acc, item) => acc + ivaItem(item), 0);
  const envio = carrito.length > 0 ? 50 : 0;
  const total = subtotal + ivaTotal + envio;

  const handleConfirmar = async () => {
    if (!direccion || !tarjeta) {
      alert("Completá los campos para continuar.");
      return;
    }

    try {
      await Carrito.finalizar(direccion, tarjeta);
      alert("Compra confirmada con éxito.");
      router.push("/compras"); // 👈 redirigir al historial
    } catch (err) {
      alert("Error al confirmar la compra.");
    }
  };

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6">Finalizar compra</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h3 className="text-lg font-semibold">Resumen del carrito</h3>
          {carrito.map((item) => (
            <div key={item.producto_id} className="flex justify-between items-center">
              <div>
                <p className="text-gray-900 font-medium">{item.nombre}</p>
                <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-900 font-semibold">${item.subtotal.toFixed(2)}</p>
                <p className="text-sm text-gray-500">IVA: ${ivaItem(item).toFixed(2)}</p>
              </div>
            </div>
          ))}

          <hr className="my-2" />

          <div className="text-sm text-gray-700 space-y-1">
            <p>Total productos: ${subtotal.toFixed(2)}</p>
            <p>IVA: ${ivaTotal.toFixed(2)}</p>
            <p>Envío: ${envio.toFixed(2)}</p>
            <p className="font-bold text-lg">Total a pagar: ${total.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h3 className="text-lg font-semibold">Datos de envío</h3>
          <input
            type="text"
            placeholder="Dirección"
            className="w-full border rounded-md p-2"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tarjeta (16 dígitos)"
            className="w-full border rounded-md p-2"
            value={tarjeta}
            onChange={(e) => setTarjeta(e.target.value)}
          />
          <button
            onClick={handleConfirmar}
            className="bg-[#0a1d37] text-white w-full py-2 rounded-md hover:bg-blue-900"
          >
            Confirmar compra
          </button>
        </div>
      </div>
    </main>
  );
}
