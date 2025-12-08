"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { isAuthenticated, user, logout, loading } = useAuth();

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-8 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                    TP6 S
                </Link>
                {!loading && (
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="text-gray-700 hover:text-blue-300">Productos</Link>
                        {isAuthenticated ? (
                            <>
                                <Link href="/compras" className="text-black-600 hover:text-blue-500">Mis Compras</Link>
                                <span className="text-gray-800 font-medium">Hola, {user?.nombre}</span>
                                <button onClick={logout} className="text-gray-600 hover:text-blue-500">Salir</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-gray-600 hover:text-blue-500">Ingresar</Link>
                                <Link href="/register" className="text-gray-600 hover:text-blue-700">Crear cuenta</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}