"use client";
import { AuthForm } from "../components/AuthForm";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Crear cuenta</h2>
        {done && (
          <div className="mb-4 rounded bg-blue-50 border border-blue-200 text-blue-700 text-sm px-3 py-2 text-center">
            Cuenta creada. Ahora inicia sesión.
          </div>
        )}
        <AuthForm
          onAuthSuccess={() => {}}
          initialMode="register"
          onRegisterSuccess={() => {
            setDone(true);
            setTimeout(() => {
              router.push("/login");
            }, 1200);
          }}
          onRequestLogin={() => router.push("/login")}
        />
      </div>
    </div>
  );
}
