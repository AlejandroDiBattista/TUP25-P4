"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [usuario, setUsuario] = useState<{ nombre?: string; email?: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Lazy read user; avoid immediate setState cascade by scheduling
    const u = localStorage.getItem("user");
    if (u) {
      // microtask para no disparar render extra antes de finalizar efecto
      queueMicrotask(() => setUsuario(JSON.parse(u)));
    }
    const handler = () => {
      const u2 = localStorage.getItem("user");
      setUsuario(u2 ? JSON.parse(u2) : null);
    };
    window.addEventListener("storage", handler);
    window.addEventListener("carrito:changed", handler as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("carrito:changed", handler as EventListener);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">TP6 Shop</h1>
        <nav className="flex gap-3 items-center">
          <Link href="/" className="text-gray-900 hover:text-blue-600 font-medium">Productos</Link>
          <Link href="/compras" className="text-gray-900 hover:text-blue-600">Mis compras</Link>
          {usuario ? (
            <>
              <span className="text-gray-900 font-medium">{usuario.nombre || usuario.email}</span>
              <button
                className="bg-gray-900 text-white px-3 py-1 rounded hover:bg-black"
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  try {
                    if (token) {
                      await fetch("http://localhost:8000/carrito/cancelar", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      await fetch("http://localhost:8000/cerrar-sesion", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                    }
                  } catch {
                    // ignorar errores de red al cerrar sesión
                  }
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  localStorage.removeItem("carrito");
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("carrito:changed"));
                  }
                  location.reload();
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Ingresar</Link>
              <Link href="/register" className="bg-white text-gray-900 px-4 py-2 rounded font-semibold hover:bg-gray-100 border border-gray-300">Crear cuenta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
