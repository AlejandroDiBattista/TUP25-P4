"use client";

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const { register, login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setNotification(null);

        if (!nombre || !email || !password) {
            setNotification({ message: "Por favor, completa todos los campos.", type: 'error' });
            return;
        }

        try {
            await register(nombre, email, password);
            setNotification({ message: '¡Creación de usuario fue exitosa! Serás redirigido al login.', type: 'success' });
            
            // Esperar unos segundos para que el usuario lea el mensaje antes de redirigir
            setTimeout(() => {
                router.push('/login');
            }, 2000); // 2 segundos de espera

        } catch (err: any) {
            // Mostrar el mensaje de error específico del backend
            const errorMessage = err.response?.data?.detail || 'Error durante el registro. Inténtalo de nuevo.';
            setNotification({ message: errorMessage, type: 'error' });
        }
    };

    return (
        <div className="flex justify-center items-center mt-10">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-black">Crear cuenta</h1>
                {notification && (
                    <div className={`p-3 rounded-md text-center text-sm ${
                        notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {notification.message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            id="nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                        />
                    </div>
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
                    <div>
                        <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Registrarme
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-gray-600">
                    ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-blue-600 hover:underline">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}