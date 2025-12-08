import { obtenerProductos } from "./services/productos";
import ProductoCard from "../components/ProductoCard";
import BuscarFiltrar from "../components/BuscarFiltrar";
import Carrito from "@/components/Carrito";

type ParametrosBusqueda = { categoria?: string; buscar?: string };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}) {
  const params = await searchParams;
  const productos = await obtenerProductos(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Catálogo de Productos 📦
          </h1>
          <p className="text-gray-600 mt-2">
            {productos.length} productos disponibles
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <BuscarFiltrar />
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <aside className="h-full lg:sticky lg:top-24">
            <Carrito />
          </aside>
        </div>
      </main>
    </div>
  );
}
