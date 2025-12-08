"use client";

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("Por favor, completa todos los campos.");
            return;
        }

        try {
            await login(email, password);
            router.push('/'); // Redirige al inicio después del login exitoso
        } catch (err: any) {
            // Mostrar el mensaje de error que viene del backend
            // o uno genérico si no hay mensaje específico.
            const errorMessage = err.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.';
            setError(errorMessage);
        }
    };

    return (
        <div className="flex justify-center items-center mt-10">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-black">Iniciar sesión</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div>
                        <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Entrar
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-600">
                    ¿No tienes cuenta? <Link href="/register" className="font-medium text-blue-600 hover:underline">Regístrate</Link>
                </p>
            </div>
        </div>
    );
}