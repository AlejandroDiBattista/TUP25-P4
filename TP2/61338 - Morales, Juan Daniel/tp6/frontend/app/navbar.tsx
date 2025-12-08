"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Auth } from "../app/services/productos";

interface Usuario {
  nombre: string;
  email: string;
}

export default function Navbar() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("usuario");
    if (raw) {
      try {
        const user: Usuario = JSON.parse(raw);
        setUsuario(user);
      } catch (e) {
        console.error("Error al parsear usuario:", e);
      }
    }
    setCargando(false);
  }, []);

  const handleLogout = () => {
    Auth.logout();
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  if (cargando) return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#0a1d37] text-white px-6 py-3 flex justify-between items-center shadow-md z-50">
      <Link href="/" className="font-bold flex items-center gap-2">
        🛍️ TP6 Shop
      </Link>

      <div className="space-x-2">
        <Link href="/">
          <button className="bg-white text-[#0a1d37] px-3 py-1 rounded hover:bg-gray-200">
            Productos
          </button>
        </Link>

        {usuario ? (
          <>
            <Link href="/carrito">
              <button className="bg-white text-[#0a1d37] px-3 py-1 rounded hover:bg-gray-200">
                Carrito
              </button>
            </Link>
            <Link href="/compras">
              <button className="bg-white text-[#0a1d37] px-3 py-1 rounded hover:bg-gray-200">
                Mis compras
              </button>
            </Link>
            <span className="text-sm px-2">{usuario.nombre}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link href="/login">
              <button className="bg-white text-[#0a1d37] px-3 py-1 rounded hover:bg-gray-200">
                Iniciar sesión
              </button>
            </Link>
            <Link href="/registro">
              <button className="bg-white text-[#0a1d37] px-3 py-1 rounded hover:bg-gray-200">
                Registrarme
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
