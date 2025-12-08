"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "../../app/services/productos";

export default function RegistroPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegistro = async () => {
    if (!nombre || !email || !password) {
      alert("Completá todos los campos.");
      return;
    }
    try {
      await Auth.registrar(nombre, email, password);
      alert("Cuenta creada. Iniciá sesión.");
      router.push("/login");
    } catch (err) {
      alert("Error al registrarte.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Crear cuenta</h2>

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border rounded-md p-2"
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md p-2"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md p-2"
        />

        <button
          onClick={handleRegistro}
          className="w-full bg-[#0a1d37] text-white py-2 rounded-md hover:bg-blue-900"
        >
          Registrarme
        </button>

        <p className="text-sm text-center text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </main>
  );
}
