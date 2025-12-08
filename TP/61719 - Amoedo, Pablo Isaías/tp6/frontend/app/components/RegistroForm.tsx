"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registrar } from "@/lib/auth";

export default function RegistroForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrar(nombre, email, password);
      router.push("/Login");
    } catch (err) {
      alert("Error al registrar usuario");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 shadow"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Crear cuenta</h2>

      <label className="text-sm text-gray-700 mb-1 block">Nombre</label>
      <Input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Juan Pérez"
        className="mb-4"
      />

      <label className="text-sm text-gray-700 mb-1 block">Correo</label>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="correo@ejemplo.com"
        className="mb-4"
      />

      <label className="text-sm text-gray-700 mb-1 block">Contraseña</label>
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
        className="mb-6"
      />

      <Button type="submit" className="w-full bg-blue-600 text-white">
        Registrarme
      </Button>

      <p className="text-sm text-gray-500 mt-4 text-center">
        ¿Ya tienes cuenta?{" "}
        <a href="/Login" className="text-blue-600 hover:underline">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}