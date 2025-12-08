"use client";

import { useState } from "react";
import { login, saveToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      saveToken(res.access_token);
      router.push("/productos");
    } catch (err) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 shadow"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Iniciar sesión</h2>

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
        Entrar
      </Button>

      <p className="text-sm text-gray-500 mt-4 text-center">
        ¿No tienes cuenta?{" "}
        <a href="/Registro" className="text-blue-600 hover:underline">
          Regístrate
        </a>
      </p>
    </form>
  );
}
