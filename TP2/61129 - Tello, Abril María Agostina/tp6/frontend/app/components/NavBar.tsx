"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Usuario = {
  nombre: string;
  email: string;
};

export default function NavBar() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const getUsuario = () => {
      const user = typeof window !== "undefined" ? localStorage.getItem("usuario") : null;
      if (user) {
        setUsuario(JSON.parse(user));
      } else {
        setUsuario(null);
      }
    };
    getUsuario();
    window.addEventListener("storage", getUsuario);
    return () => {
      window.removeEventListener("storage", getUsuario);
    };
  }, []);

  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("usuario");
    setUsuario(null);
    router.push("/login");
  }

  return (
    <nav className="bg-gray-100 border-b border-gray-300 shadow-sm px-8 py-4 flex items-center justify-between">
      <div className="font-bold text-xl">TP6 Shop</div>
      <div className="flex gap-4 items-center">
        <a href="/" className="font-bold text-gray-700 hover:text-blue-600 hover:underline transition">Productos</a>
        {usuario ? (
          <>
            <a href="/compras" className="font-bold text-gray-700 hover:text-blue-600 hover:underline transition">Mis compras</a>
            <span className="font-bold text-blue-700">{usuario.nombre}</span>
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded font-bold text-white shadow hover:bg-transparent hover:text-red-600 border border-red-600 transition active:scale-95">Salir</button>
          </>
        ) : (
          <>
            <a href="/login" className="font-bold text-gray-700 hover:text-blue-600 hover:underline transition">Ingresar</a>
            <a href="/register" className="bg-blue-600 px-4 py-2 rounded font-bold text-white shadow hover:bg-transparent hover:text-blue-600 border border-blue-600 transition">Crear cuenta</a>
          </>
        )}
      </div>
    </nav>
  );
}
