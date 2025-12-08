'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';
import { useAuth } from '../components/AuthProvider';
import { ProductCard, Producto } from '../components/ProductCard';
import { CartData, CartPanel } from '../components/CartPanel';

const CatalogPage: React.FC = () => {
	const { token } = useAuth();
	const router = useRouter();

	const [productos, setProductos] = useState<Producto[]>([]);
	const [busqueda, setBusqueda] = useState('');
	const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
	const [cart, setCart] = useState<CartData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [cargando, setCargando] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const data = await apiFetch('/productos');
				setProductos(data);
			} catch (e: any) {
				setError(e.message ?? 'No se pudieron cargar los productos');
			} finally {
				setCargando(false);
			}
		})();
	}, []);

	useEffect(() => {
		if (!token) {
			setCart(null);
			return;
		}
		(async () => {
			try {
				const data = await apiFetch('/carrito', {}, token);
				setCart(data);
			} catch {
				// ignore
			}
		})();
	}, [token]);

	const categorias = useMemo(() => {
		const set = new Set<string>();
		productos.forEach((p) => set.add(p.categoria));
		return Array.from(set);
	}, [productos]);

	const productosFiltrados = useMemo(() => {
		return productos.filter((p) => {
			const coincideCategoria = !categoriaFiltro || p.categoria === categoriaFiltro;
			const coincideBusqueda =
				!busqueda ||
				p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
				p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
			return coincideCategoria && coincideBusqueda;
		});
	}, [productos, categoriaFiltro, busqueda]);

	const recargarCarrito = async () => {
		if (!token) return;
		const data = await apiFetch('/carrito', {}, token);
		setCart(data);
	};

	const handleAdd = async (id: number) => {
		if (!token) {
			setError('Debes iniciar sesión para usar el carrito');
			return;
		}
		try {
			setError(null);
			await apiFetch(
				'/carrito',
				{ method: 'POST', body: JSON.stringify({ articulo_id: id, cantidad: 1 }) },
				token
			);
			await recargarCarrito();
		} catch (e: any) {
			setError(e.message ?? 'No se pudo agregar el producto');
		}
	};

	const handleRemove = async (id: number) => {
		if (!token) return;
		try {
			await apiFetch(`/carrito/${id}`, { method: 'DELETE' }, token);
			await recargarCarrito();
		} catch {
			// ignore
		}
	};

	const handleClear = async () => {
		if (!token) return;
		await apiFetch('/carrito/cancelar', { method: 'POST' }, token);
		await recargarCarrito();
	};

	const handleCheckout = () => {
		if (!token) {
			setError('Inicia sesión para continuar la compra');
			return;
		}
		router.push('/checkout');
	};

	return (
		<div className="flex w-full gap-6">
			<section className="hidden w-52 flex-shrink-0 flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm md:flex">
				<h2 className="text-sm font-semibold">Filtros</h2>
				<label className="text-xs font-medium text-slate-500">
					Buscar
					<input
						className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
						placeholder="Nombre o descripción"
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
					/>
				</label>
				<div className="mt-2 space-y-1">
					<p className="text-xs font-medium text-slate-500">Categorías</p>
					<button
						className={`w-full rounded-md px-2 py-1 text-left text-xs ${
							!categoriaFiltro ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'
						}`}
						onClick={() => setCategoriaFiltro(null)}
					>
						Todas
					</button>
					{categorias.map((cat) => (
						<button
							key={cat}
							className={`w-full rounded-md px-2 py-1 text-left text-xs ${
								categoriaFiltro === cat
									? 'bg-indigo-50 text-indigo-700'
									: 'hover:bg-slate-50'
							}`}
							onClick={() => setCategoriaFiltro(cat)}
						>
							{cat}
						</button>
					))}
				</div>
			</section>

			<section className="flex-1 space-y-4">
				<div className="mb-2 flex md:hidden">
					<input
						className="w-full rounded-md border px-2 py-1 text-sm"
						placeholder="Buscar productos..."
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
					/>
				</div>
				{error && (
					<p className="mb-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
						{error}
					</p>
				)}
				{cargando ? (
					<p className="text-sm text-slate-500">Cargando productos...</p>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{productosFiltrados.map((p) => (
							<ProductCard key={p.id} producto={p} onAdd={handleAdd} />
						))}
					</div>
				)}
			</section>

			<div className="hidden w-80 flex-shrink-0 md:block">
				<CartPanel
					cart={cart}
					onRemove={handleRemove}
					onClear={handleClear}
					onGoCheckout={handleCheckout}
					disabledActions={!token}
				/>
			</div>
		</div>
	);
};

export default CatalogPage;
