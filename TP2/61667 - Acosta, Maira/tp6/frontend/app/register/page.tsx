"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthProvider"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const success = await register(nombre, email, password)
      if (success) {
        router.push("/")
      } else {
        setError("Error al crear la cuenta")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-lg font-semibold text-gray-900">TP6 Shop</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="text-gray-600">Productos</Link>
            <Link href="/login" className="text-blue-600">Ingresar</Link>
            <Link href="/register" className="text-blue-600">Crear cuenta</Link>
          </nav>
        </div>
      </header>

      {/* Formulario de registro */}
      <div className="max-w-md mx-auto mt-16 px-6">
        <div className="bg-white">
          <h1 className="text-2xl font-medium text-center text-gray-900 mb-8">
            Crear cuenta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="jperez@mail.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrarme"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}