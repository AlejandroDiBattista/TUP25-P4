'use client';

import RegistroForm from "../components/RegistroForm";

export default function RegistroPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-bold text-gray-800">TP6 Shop</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <a href="/productos">Productos</a>
          <a href="/login">Ingresar</a>
          <a href="/registro" className="font-semibold">Crear cuenta</a>
        </div>
      </nav>
      <section className="flex justify-center items-center py-12">
        <RegistroForm />
      </section>
    </main>
  );
}