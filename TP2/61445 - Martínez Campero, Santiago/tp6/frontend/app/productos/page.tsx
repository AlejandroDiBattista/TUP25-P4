import ProductoCard from "@/app/components/ProductoCard";
import SearchFilter from "@/app/components/SearchFilter";
import { obtenerProductos, obtenerCategorias } from "@/app/services/productos";
import { Producto } from "@/app/types";

export const metadata = {
  title: "Productos - TP6 Shop",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; buscar?: string; ordenar?: string; precioMin?: string; precioMax?: string }>;
}) {
  const params = await searchParams;
  const categoria = params.categoria;
  const buscar = params.buscar;
  const ordenar = params.ordenar;
  const precioMin = params.precioMin;
  const precioMax = params.precioMax;

  let productos: Producto[] = [];
  let categorias: string[] = [];

  try {
    [productos, categorias] = await Promise.all([
      obtenerProductos(categoria, buscar, ordenar, precioMin, precioMax),
      obtenerCategorias(),
    ]);
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Productos
          </h1>
          <p className="text-lg text-gray-600">
            {productos.length} productos disponibles
          </p>
        </div>

        <SearchFilter categorias={categorias} />

        {productos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
