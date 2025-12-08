'use client';

import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-bold text-gray-800">TP6 Shop</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <a href="/productos">Productos</a>
          <a href="/login" className="font-semibold">Ingresar</a>
          <a href="/registro">Crear cuenta</a>
        </div>
      </nav>
      <section className="flex justify-center items-center py-12">
        <LoginForm />
      </section>
    </main>
  );
}
