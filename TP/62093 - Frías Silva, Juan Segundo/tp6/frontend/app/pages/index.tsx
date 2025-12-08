import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">Bienvenido al E-Commerce</h1>
      <div className="flex gap-4">
        <Link href="/productos">
          <a className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Ver Productos
          </a>
        </Link>
        <Link href="/carrito">
          <a className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            Mi Carrito
          </a>
        </Link>
        <Link href="/compras">
          <a className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
            Mis Compras
          </a>
        </Link>
      </div>
    </div>
  );
}
