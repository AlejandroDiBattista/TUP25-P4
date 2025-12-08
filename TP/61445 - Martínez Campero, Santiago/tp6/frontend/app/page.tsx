export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Bienvenido a TP6 Shop
          </h1>
          <p className="text-xl text-gray-600">
            Tienda de productos en línea con FastAPI y Next.js
          </p>
          <p className="text-lg text-gray-500">
            Cargando productos...
          </p>
        </div>
      </main>
    </div>
  );
}
