import { obtenerProductos } from './services/productos';
import ProductoCard from './components/ProductoCard';
import Catalogo from './components/Catalogo';

export default async function Home() {
  const productosIniciales = await obtenerProductos();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <Catalogo productosIniciales={productosIniciales} />

      </div>
    </div>
  );
}