"use client";
import { AuthForm } from "../components/AuthForm";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const handleAuthSuccess = (token: string, user: { nombre?: string; email?: string }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    setSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Iniciar sesión</h2>
        {success && (
          <div className="mb-4 rounded bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 text-center">
            ¡Inicio de sesión exitoso! Redirigiendo...
          </div>
        )}
        {!success && (
          <AuthForm
            onAuthSuccess={handleAuthSuccess}
            initialMode="login"
            onRequestRegister={() => {
              router.push("/register");
            }}
          />
        )}
      </div>
    </div>
  );
}
