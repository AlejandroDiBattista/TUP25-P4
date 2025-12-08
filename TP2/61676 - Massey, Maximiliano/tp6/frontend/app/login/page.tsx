'use client';

import { FormEvent, useState } from 'react'
import useAuthStore from '../store/auth'
import useCartStore from '../store/cart'
import { useRouter } from 'next/navigation'
import { API_URL } from '../config'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const setAuth = useAuthStore(state => state.setAuth)
    const syncWithBackend = useCartStore(state => state.syncWithBackend)
    const router = useRouter()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const formData = new FormData()
            formData.append('username', email)
            formData.append('password', password)

            const response = await fetch(`${API_URL}/token`, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || 'Credenciales incorrectas')
            }

            const data = await response.json()
            setAuth(data.access_token, data.user)
            
            // Mostrar mensaje de éxito
            console.log('✅ Login exitoso:', data.user.nombre)
            
            // Sincronizar carrito con backend después del login
            await syncWithBackend()
            
            router.push('/')
        } catch (err: any) {
            console.error('❌ Error en login:', err)
            if (err.name === 'TimeoutError' || err.message.includes('fetch')) {
                setError('Servidor no disponible. Intenta más tarde.')
            } else {
                setError(err.message || 'Error al iniciar sesión')
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/">
                            <h1 className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                                TP6 Shop
                            </h1>
                        </Link>
                        
                        <nav className="flex items-center gap-4">
                            <Link href="/" className="text-gray-900 font-semibold hover:text-blue-600">
                                Productos
                            </Link>
                            <Link href="/login" className="text-gray-900 font-semibold hover:text-blue-600">
                                Ingresar
                            </Link>
                            <Link href="/registro" className="text-gray-900 font-semibold hover:text-blue-600">
                                Crear cuenta
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Contenido */}
            <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-8">
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Iniciar sesión</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-900">
                                Correo
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded text-gray-900 font-semibold placeholder:text-gray-400"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-900">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded text-gray-900 font-semibold placeholder:text-gray-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800"
                        >
                            Entrar
                        </button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <span className="text-gray-900 font-semibold">¿No tienes cuenta? </span>
                        <Link href="/registro" className="text-blue-600 font-bold hover:underline">
                            Regístrate
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
