import { obtenerProductos } from './services/productos';
import ProductoCard from './components/ProductoCard';

export default async function Home() {
  const productos = await obtenerProductos();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Catálogo de Productos
        </h1>
        <p className="text-gray-600">
          {productos.length} productos disponibles
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}
