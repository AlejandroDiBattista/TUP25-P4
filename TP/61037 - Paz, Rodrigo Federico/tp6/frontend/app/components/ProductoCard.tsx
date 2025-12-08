"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { agregarAlCarrito } from "../services/productos";
import { useCarrito } from "../../context/CarritoContext";
import Toast from "./Toast";

export default function ProductoCard({ producto }: any) {
  const { actualizarCarrito } = useCarrito();
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const imgSrc = `${API_URL}/imagenes/${producto.id.toString().padStart(4, "0")}.png`;

  const sinStock = producto.existencia <= 0;

  async function handleAdd() {
    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) {
      setToast({ message: "Debe iniciar sesión para agregar al carrito", type: "info" });
      setTimeout(() => {
        router.push("/ingresar");
      }, 1500);
      return;
    }
    try {
      await agregarAlCarrito(Number(usuarioId), producto.id);
      actualizarCarrito(); 
    } catch (e: any) {
      setToast({ message: e.message || "No se pudo agregar al carrito", type: "error" });
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition flex gap-4">
      
      {/* Imagen (izquierda) */}
      <img 
        src={imgSrc} 
        alt={producto.nombre} 
        className="w-40 h-40 object-cover rounded-md flex-shrink-0"
      />

      {/* Información central */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {producto.nombre}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2">
            {producto.descripcion}
          </p>

          <p className="text-xs text-gray-500">
            Categoría: {producto.categoria}
          </p>
        </div>
      </div>

      {/* Precio y botón (derecha) */}
      <div className="flex flex-col items-end justify-between min-w-[140px]">
        <p className="text-xl font-bold text-gray-900">
          ${producto.precio}
        </p>

        <p className="text-sm text-gray-600 mb-2">
          {sinStock ? "Agotado" : `Disponible: ${producto.existencia}`}
        </p>

        <button
          disabled={sinStock}
          onClick={handleAdd}
          className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
            sinStock
              ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
              : "bg-[#0A2540] hover:bg-[#0D3158] text-white border-gray-300"
          }`}
        >
          Agregar al carrito
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
