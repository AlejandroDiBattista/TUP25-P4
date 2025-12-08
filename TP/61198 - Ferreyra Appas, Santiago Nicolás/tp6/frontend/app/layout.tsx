'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../components/AuthProvider';
import React from 'react';

function Header() {
	const { token, nombre, logout } = useAuth();
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = () => {
		logout();
		router.push('/');
	};

	const linkClass = (path: string) =>
		`text-sm font-medium ${
			pathname === path ? 'text-indigo-600' : 'text-slate-600'
		} hover:text-indigo-700`;

	return (
		<header className="border-b bg-white">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<Link href="/" className="text-lg font-semibold text-slate-900">
					Campus Market
				</Link>
				<nav className="flex items-center gap-4">
					<Link href="/" className={linkClass('/')}>
						Catálogo
					</Link>
					{token && (
						<Link href="/orders" className={linkClass('/orders')}>
							Mis compras
						</Link>
					)}
					{!token && (
						<>
							<Link href="/login" className={linkClass('/login')}>
								Ingresar
							</Link>
							<Link href="/register" className={linkClass('/register')}>
								Crear cuenta
							</Link>
						</>
					)}
					{token && (
						<div className="flex items-center gap-3">
							<span className="text-sm text-slate-700">{nombre ?? 'Cuenta'}</span>
							<button
								className="text-xs font-medium text-red-600 hover:underline"
								onClick={handleLogout}
							>
								Salir
							</button>
						</div>
					)}
				</nav>
			</div>
		</header>
	);
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es">
			<body className="bg-slate-50 text-slate-900">
				<AuthProvider>
					<div className="flex min-h-screen flex-col">
						<Header />
						<main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6">
							{children}
						</main>
					</div>
				</AuthProvider>
			</body>
		</html>
	);
}
