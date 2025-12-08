export default function Header() {
  return (
    <header className="bg-blue-600 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Mi Tienda</h1>
        <nav className="space-x-4">
          <a href="/" className="hover:underline">Inicio</a>
          <a href="/productos" className="hover:underline">Productos</a>
        </nav>
      </div>
    </header>
  );
}
