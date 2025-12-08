"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import AppHeader from './components/AppHeader';
import CartItemsList from './components/CartItemsList';
import CartSummary from './components/CartSummary';
import ProductoCard from './components/ProductoCard';
import { useAuth } from './providers/AuthProvider';
import { useCart } from './providers/CartProvider';
import { obtenerProductos } from './services/productos';
import type { Producto } from './types';

const categoriasDestacadas = ['Ropa de hombre', 'Ropa de mujer', 'Joyería', 'Electrónica'];

export default function HomePage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { carrito, refrescar, agregar, cargando, cancelar } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      setLoadingProductos(true);
      try {
        const data = await obtenerProductos({ buscar: busqueda || undefined, categoria: categoria || undefined });
        setProductos(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los productos. Intente nuevamente.');
      } finally {
        setLoadingProductos(false);
      }
    };

    void cargarProductos();
  }, [busqueda, categoria]);

  useEffect(() => {
    if (usuario) {
      void refrescar();
    }
  }, [usuario, refrescar]);

  const categoriasDisponibles = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((producto) => set.add(producto.categoria));
    return Array.from(set);
  }, [productos]);

  const handleAgregar = (productoId: number) => {
    if (!usuario) {
      setError('Necesitás iniciar sesión para agregar productos al carrito');
      return;
    }
    void agregar(productoId, 1);
  };

  const handleCancelar = () => {
    if (!usuario) {
      setError('Tenés que iniciar sesión para gestionar el carrito');
      return;
    }
    void cancelar();
  };

  const handleIrCheckout = () => {
    if (!usuario) {
      setError('Iniciá sesión para finalizar tu compra');
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row">
        <section className="w-full space-y-6 lg:w-2/3">
          <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Catálogo de productos</h1>
                <p className="text-sm text-slate-500">Explorá la selección y agregá tus favoritos al carrito.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  placeholder="Buscar productos"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:w-64"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(categoriasDisponibles.length > 0 ? categoriasDisponibles : categoriasDestacadas).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria((prev) => (prev === cat ? null : cat))}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    categoria === cat ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {categoria && (
                <button
                  onClick={() => setCategoria(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:border-slate-300"
                >
                  Limpiar filtro
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {loadingProductos
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-80 animate-pulse rounded-xl bg-slate-200" />
                ))
              : productos.map((producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                    onAgregar={handleAgregar}
                    disabled={cargando}
                  />
                ))}
          </div>
        </section>

        <aside className="w-full space-y-6 lg:w-1/3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Carrito de compras</h2>
            <p className="text-sm text-slate-500">
              {usuario
                ? `Actualmente tenés ${carrito?.total_items ?? 0} artículos en el carrito.`
                : 'Iniciá sesión para comenzar tu compra.'}
            </p>

            <div className="mt-4">
              <CartItemsList />
            </div>
          </div>

          <CartSummary
            onIrCheckout={handleIrCheckout}
            onCancelar={handleCancelar}
          />
        </aside>
      </main>
    </div>
  );
}
