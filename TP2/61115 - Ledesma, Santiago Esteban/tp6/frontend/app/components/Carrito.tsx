"use client";
import { useEffect, useState, useCallback } from "react";
import AuthModal from "./AuthModal";
import { useRouter } from 'next/navigation';

interface ItemCarrito {
  id: number;
  producto: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export const Carrito = () => {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [mensaje, setMensaje] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // Usar la misma clave que el resto de la app (tp6_token)
  const token = typeof window !== "undefined" ? localStorage.getItem("tp6_token") : null;

  // ✅ Cargar el carrito
  const fetchCarrito = useCallback(async () => {
    // No forzar el modal de autenticación al cargar la página.
    // Si no hay token, mostramos un carrito vacío en lugar de abrir el diálogo.
    if (!token) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/carrito/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener el carrito");

      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchCarrito();

    // Escuchar evento personalizado cuando se agrega un producto al carrito
    const handleAgregarAlCarrito = () => {
      fetchCarrito();
    };

    window.addEventListener('agregarAlCarrito', handleAgregarAlCarrito);
    return () => window.removeEventListener('agregarAlCarrito', handleAgregarAlCarrito);
  }, [fetchCarrito]);

  // ✅ Eliminar producto
  const eliminarItem = async (itemId: number) => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/carrito/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar el producto");
      setMensaje("Producto eliminado del carrito");
      fetchCarrito();
    } catch {
      setMensaje("No se pudo eliminar el producto");
    }
  };

  // ✅ Cambiar cantidad de un producto
  const cambiarCantidad = async (itemId: number, nuevaCantidad: number) => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    if (nuevaCantidad < 1) {
      await eliminarItem(itemId);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/carrito/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      });

      if (!res.ok) throw new Error("Error al actualizar cantidad");
      fetchCarrito();
    } catch (err) {
      console.error(err);
      setMensaje("No se pudo actualizar la cantidad");
    }
  };

  // ✅ Vaciar carrito
  const vaciarCarrito = async () => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/carrito/cancelar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al vaciar el carrito");
      setMensaje("Carrito vaciado correctamente");
      fetchCarrito();
    } catch {
      setMensaje("No se pudo vaciar el carrito");
    }
  };

  // ✅ Finalizar compra: navegar a la pantalla de confirmación (/checkout)
  const router = useRouter();

  const finalizarCompra = () => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    // Redirigir a la pantalla de checkout/confirmación donde el usuario
    // completará la dirección y confirmará la compra.
    router.push('/checkout');
  };

  return (
    <>
      {/* 🛒 Carrito lateral */}
      <aside className="w-80 bg-gradient-to-b from-white to-sky-50 rounded-2xl shadow-lg p-4 sticky top-20 h-fit border border-sky-200">
        <h2 className="text-lg font-semibold mb-3 text-sky-700 flex items-center gap-2">
          🛒 Carrito
        </h2>

        {loading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">
            Tu carrito está vacío
          </p>
        ) : (
          <>
            {items.map((item) => (
              <div key={item.id} className="border-b py-3 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.producto}</p>
                    <p className="text-xs text-gray-500">
                      ${item.precio_unitario.toFixed(2)} c/u
                    </p>
                  </div>
                  <button
                    onClick={() => eliminarItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold ml-2"
                  >
                    ✕
                  </button>
                </div>

                {/* Controles de cantidad (+/-) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold"
                    disabled={item.cantidad <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val >= 1) cambiarCantidad(item.id, val);
                    }}
                    className="w-12 text-center border border-gray-300 rounded text-xs py-1"
                    min="1"
                  />
                  <button
                    onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs font-semibold"
                  >
                    +
                  </button>
                </div>

                <p className="text-right text-sm font-semibold text-sky-700">
                  ${item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}

            <div className="mt-4 text-right font-semibold text-sky-700">
              Total: ${total.toFixed(2)}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={vaciarCarrito}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-semibold"
              >
                Vaciar
              </button>
              <button
                onClick={finalizarCompra}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg text-sm font-semibold"
              >
                Finalizar
              </button>
            </div>
          </>
        )}

        {mensaje && (
          <p className="mt-3 text-center text-sm text-green-600">{mensaje}</p>
        )}
      </aside>

      {/* 🔒 Modal de autenticación (componente reutilizable) */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};