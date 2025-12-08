import ProductosExplorer from './components/ProductosExplorer';
import { obtenerProductos } from './services/productos';

export default async function Home() {
  const productos = await obtenerProductos();
  const categorias = Array.from(new Set(productos.map((producto) => producto.categoria)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
          <p className="mt-2 text-gray-600">{productos.length} productos disponibles</p>
        </div>
        
        <ProductosExplorer initialProducts={productos} categories={categorias} />
      </main>
    </div>
  );
}
