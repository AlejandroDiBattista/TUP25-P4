'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../config';
import Link from 'next/link';

export default function RegistroPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            console.log('📝 Intentando registrar usuario...');
            console.log('🔗 URL:', `${API_URL}/registrar`);
            
            const response = await fetch(`${API_URL}/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    email,
                    password
                }),
                signal: AbortSignal.timeout(15000) // Aumentar timeout a 15 segundos
            });
            
            console.log('📡 Respuesta recibida, status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Error al registrar usuario');
            }

            const data = await response.json();
            console.log('✅ Registro exitoso:', data);
            
            setSuccess(true);
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: any) {
            console.error('❌ Error en registro:', err);
            if (err.name === 'TimeoutError' || err.message.includes('fetch')) {
                setError('Servidor no disponible. Intenta más tarde.');
            } else {
                setError(err.message || 'Error al registrar usuario');
            }
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <Link href="/">
                            <h1 className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                                TP6 Shop
                            </h1>
                        </Link>
                    </div>
                </header>

                <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-8">
                    <div className="w-full max-w-md text-center">
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            <h2 className="text-2xl font-bold mb-2">¡Registro Exitoso!</h2>
                            <p>Tu cuenta ha sido creada correctamente.</p>
                            <p className="text-sm mt-2">Serás redirigido al login en unos segundos...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Crear cuenta</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-900">
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full p-2 border rounded text-gray-900 font-semibold placeholder:text-gray-400"
                            placeholder="Juan Perez"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-900">
                            Correo
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded text-gray-900 font-semibold placeholder:text-gray-400"
                            placeholder="jperez@mail.com"
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
                            minLength={6}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-900">
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded text-gray-900 font-semibold placeholder:text-gray-400"
                            placeholder="••••••••"
                            minLength={6}
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition-colors"
                    >
                        Registrarme
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    <span className="text-gray-900 font-semibold">¿Ya tienes cuenta? </span>
                    <Link href="/login" className="text-blue-600 font-bold hover:underline">
                        Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
        </div>
    );
}