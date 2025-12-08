import Link from 'next/link';

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Bienvenido a Tienda Online TP6
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Descubre productos de calidad a los mejores precios
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/productos"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
          >
            Ver Productos
          </Link>
          <Link
            href="/registro"
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition text-lg"
          >
            Registrarse
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegirnos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Envíos Rápidos</h3>
              <p className="text-gray-600">Envío gratis en compras superiores a $1000</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Seguro</h3>
              <p className="text-gray-600">Tus datos están protegidos con nosotros</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Fácil de Usar</h3>
              <p className="text-gray-600">Compra en pocos pasos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
