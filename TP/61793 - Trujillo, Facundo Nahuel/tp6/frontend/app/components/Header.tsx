"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function Header() {
  const { token, logout } = useAuth()
  const router = useRouter()

  const onLogout = async () => {
    await logout()
    try { router.replace('/') } catch (_) { window.location.href = '/' }
  }

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
      <h1 className="text-xl font-semibold">TP6 Shop</h1>
      <nav className="space-x-6">
        <a href="/" className="hover:text-blue-600">Productos</a>
        <a href="/carrito" className="hover:text-blue-600">Carrito</a>
        {token ? (
          <>
            <button onClick={onLogout} className="text-sm text-red-600">Cerrar sesión</button>
          </>
        ) : (
          <>
            <a href="/login" className="hover:text-blue-600">Ingresar</a>
            <a href="/register" className="hover:text-blue-600">Crear cuenta</a>
          </>
        )}
      </nav>
    </header>
  )
}
