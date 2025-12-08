'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { iniciarSesion } from '../services/auth';
import { useAuth } from '../components/AuthProvider';

export default function IngresarPage() {
    const router = useRouter();
    const { loginFromResponse } = useAuth();

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
        const data = await iniciarSesion({ email, password: pass });
        loginFromResponse(data);           // guarda en contexto + localStorage
        router.push('/');                  // vuelve al listado; el Navbar ya reacciona
        } catch (err: any) {
        setError(err?.message ?? 'Error al iniciar sesión');
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h1 className="text-2xl font-semibold mb-6">Iniciar sesión</h1>

            <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-gray-700 mb-1">Correo</label>
                <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
                <input
                type="password"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
                />
            </div>

            {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {error}
                </p>
            )}

            <button
                disabled={loading}
                className="w-full rounded-md bg-gray-900 text-white py-2 disabled:opacity-60"
            >
                {loading ? 'Entrando…' : 'Entrar'}
            </button>
            </form>

            <p className="text-sm text-gray-600 mt-4">
            ¿No tienes cuenta?{' '}
            <Link className="text-gray-900 underline" href="/crear-cuenta">
                Regístrate
            </Link>
            </p>
        </div>
        </div>
    );
}
