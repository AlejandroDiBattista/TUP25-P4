'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { obtenerProductos } from '../services/productos';
import { Producto } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import ProductoCard from './ProductoCard';
import { CartSidebar, CartSidebarSkeleton } from './CartSidebar';

interface CatalogoContentProps {
  initialProducts: Producto[];
  categorias: string[];
  mostrarPanelInvitado?: boolean;
}

export function CatalogoContent({
  initialProducts,
  categorias,
  mostrarPanelInvitado = true,
}: CatalogoContentProps) {
  const { usuario, initialLoading } = useAuth();
  const [productos, setProductos] = useState<Producto[]>(initialProducts);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const categoriasOrdenadas = useMemo(() => {
    const unicas = Array.from(new Set(categorias.filter(Boolean)));
    return unicas.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [categorias]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => window.clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const filtros = {
      categoria: categoriaSeleccionada === 'todas' ? undefined : categoriaSeleccionada,
      buscar: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
    };

    async function fetchProductos() {
      setIsLoading(true);
      setError(null);
      try {
        const datos = await obtenerProductos(filtros, { signal: controller.signal });
        setProductos(datos);
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') {
          return;
        }
        setError('No pudimos cargar los productos. Intenta nuevamente.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchProductos();
    return () => controller.abort();
  }, [categoriaSeleccionada, debouncedSearch, refreshIndex]);

  const limpiarFiltros = () => {
    setCategoriaSeleccionada('todas');
    setSearchInput('');
    setDebouncedSearch('');
    setRefreshIndex((index) => index + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex w-full flex-1 items-center gap-3">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar..."
                className="pl-11 shadow-sm"
                aria-label="Buscar productos"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <Select
              value={categoriaSeleccionada}
              onValueChange={setCategoriaSeleccionada}
            >
              <SelectTrigger className="w-48 shadow-sm">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categoriasOrdenadas.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {isLoading ? (
            <CatalogoSkeleton />
          ) : error ? (
            <EstadoVacio
              mensaje={error}
              textoAccion="Reintentar"
              accion={() => setRefreshIndex((index) => index + 1)}
            />
          ) : productos.length === 0 ? (
            <EstadoVacio
              mensaje="No encontramos productos con esos filtros."
              textoAccion="Limpiar filtros"
              accion={limpiarFiltros}
            />
          ) : (
            productos.map((producto) => <ProductoCard key={producto.id} producto={producto} />)
          )}
        </div>
        {initialLoading ? (
          <CartSidebarSkeleton />
        ) : usuario ? (
          <CartSidebar />
        ) : mostrarPanelInvitado ? (
          <Card className="hidden h-min lg:block">
            <CardHeader>
              <CardTitle>Inicia sesión</CardTitle>
              <CardDescription>Ingresa para ver y editar tu carrito.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600">
                Gestiona tus compras, revisa el historial y continúa donde lo dejaste.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function CatalogoSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, indice) => (
        <div
          key={indice}
          className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100/60"
        />
      ))}
    </div>
  );
}

function EstadoVacio({
  mensaje,
  accion,
  textoAccion = 'Intentar nuevamente',
}: {
  mensaje: string;
  accion?: () => void;
  textoAccion?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">{mensaje}</CardTitle>
          <CardDescription className="text-sm">
            Ajusta la búsqueda o elige otra categoría para continuar explorando productos.
          </CardDescription>
        </div>
        {accion ? (
          <Button variant="outline" onClick={accion}>
            {textoAccion}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
