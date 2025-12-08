import ProductsList from './components/ProductsList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
          <p className="text-gray-600 mt-2">Explorá nuestro catálogo y usá la búsqueda o filtros por categoría.</p>
        </div>
      </header>

      <ProductsList />
    </div>
  );
}
