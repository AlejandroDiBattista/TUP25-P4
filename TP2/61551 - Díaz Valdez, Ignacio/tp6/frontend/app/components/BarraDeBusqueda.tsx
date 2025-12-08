"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ProductoCard from "./ProductoCard";
import type { Producto } from "@/app/types";

interface BarraDeBusquedaProps {
  productos: Producto[];
  titulo?: string;
  texto?: string; // valor controlado
  onCambiarTexto?: (valor: string) => void; // callback cambio texto
  modoServidor?: boolean; // filtra en backend
  categoria?: string; // categoría controlada
  onCambiarCategoria?: (valor: string) => void; // callback cambio categoría
  categoriasDisponibles?: string[]; // opciones del selector
}

export default function BarraDeBusqueda({ productos, titulo = "Catálogo de Productos", texto, onCambiarTexto, modoServidor = false, categoria, onCambiarCategoria, categoriasDisponibles }: BarraDeBusquedaProps) {
  const [textoLocal, setTextoLocal] = useState(texto ?? "");
  const [categoriaLocal, setCategoriaLocal] = useState(categoria ?? "");
  const [cargando, setCargando] = useState(false);
  const [remotos, setRemotos] = useState<Producto[] | null>(null);

  // Sync texto controlado
  useEffect(() => {
    if (texto !== undefined) {
      setTextoLocal(texto);
    }
  }, [texto]);
  // Sync categoría controlada
  useEffect(() => {
    if (categoria !== undefined) {
      setCategoriaLocal(categoria);
    }
  }, [categoria]);

  const textoActual = texto !== undefined ? texto : textoLocal;
  const categoriaActual = categoria !== undefined ? categoria : categoriaLocal;
  const handleChange = (valor: string) => {
    if (onCambiarTexto) onCambiarTexto(valor);
    else setTextoLocal(valor);
  };
  const handleChangeCategoria = (valor: string) => {
    if (onCambiarCategoria) onCambiarCategoria(valor);
    else setCategoriaLocal(valor);
  };

  // Debounce + fetch al backend
  useEffect(() => {
    if (!modoServidor) {
      setRemotos(null);
      return;
    }
    const controlador = new AbortController();
    const q = textoActual.trim();
    const cat = categoriaActual.trim();
    setCargando(true);
    const h = setTimeout(async () => {
      try {
        const usp = new URLSearchParams();
        if (q) usp.set('q', q);
        if (cat) usp.set('categoria', cat);
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/productos${usp.toString() ? `?${usp.toString()}` : ''}`;
        const resp = await fetch(url, { cache: 'no-store', signal: controlador.signal });
        if (!resp.ok) throw new Error('Error al filtrar productos');
        const data = await resp.json();
        let lista: Producto[] = [];
        if (Array.isArray(data)) lista = data;
        else if ('value' in data) lista = data.value;
        setRemotos(lista);
      } catch (e) {
        if (!(e instanceof DOMException)) {
          console.error(e);
        }
        setRemotos([]);
      } finally {
        setCargando(false);
      }
    }, 350); // debounce 350ms
    return () => {
      controlador.abort();
      clearTimeout(h);
    };
  }, [textoActual, categoriaActual, modoServidor]);

  const fuente = modoServidor ? (remotos ?? productos) : productos;
  const filtrados = useMemo(() => {
    if (modoServidor) return fuente; // ya vienen filtrados
    const q = textoActual.trim().toLowerCase();
    const cat = categoriaActual.trim().toLowerCase();
    return fuente.filter((p) => {
      const coincideTexto = !q || p.titulo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
      const coincideCat = !cat || p.categoria.toLowerCase() === cat;
      return coincideTexto && coincideCat;
    });
  }, [fuente, textoActual, categoriaActual, modoServidor]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{titulo}</h1>
            <div className="w-full md:w-[40rem]">
              <Label htmlFor="barra-busqueda" className="sr-only">Barra de búsqueda</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="barra-busqueda"
                    value={textoActual}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Buscar por título o descripción..."
                    className="pr-10"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.5 3.75a6.75 6.75 0 1 0 4.243 11.957l3.775 3.775a.75.75 0 1 0 1.06-1.06l-3.775-3.775A6.75 6.75 0 0 0 10.5 3.75Zm-5.25 6.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="w-56">
                  <Label htmlFor="selector-categoria" className="sr-only">Categoría</Label>
                  <Select
                    id="selector-categoria"
                    value={categoriaActual}
                    onChange={(e) => handleChangeCategoria(e.target.value)}
                    options={(() => {
                      const base = categoriasDisponibles && categoriasDisponibles.length > 0
                        ? categoriasDisponibles
                        : Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)));
                      return [{ value: "", label: "Todas las categorías" }, ...base.map(c => ({ value: c, label: c }))];
                    })()}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            {cargando ? 'Buscando...' : `${filtrados.length} productos disponibles`}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {filtrados.length === 0 ? (
          <p className="text-gray-500">No se encontraron productos para "{textoActual}".</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtrados.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
