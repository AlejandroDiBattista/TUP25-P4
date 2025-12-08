import { obtenerProductos } from './services/productos';
import ProductoCard from './components/ProductoCard';
import Header from './components/Header';

export default async function Home() {
  const productos = await obtenerProductos();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Catálogo de Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      </main>
    </div>
  );
}
