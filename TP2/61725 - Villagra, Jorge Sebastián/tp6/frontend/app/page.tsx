import AuthGate from '@/app/auth/Gate/AuthGate';
import { obtenerProductos } from './services/productos';
import ProductosGrid from '@/components/ui/ProductosGrid';
import PageHeader from '@/components/ui/PageHeader';
import Navbar from '@/components/ui/Navbar';
import CarritoPanel from '@/components/ui/CarritoPanel';

export default async function HomePage() {
  const productos = await obtenerProductos();

  return (
    <>
      <Navbar />
      <AuthGate>
        <PageHeader title="Catálogo de Productos" subtitle={`${productos.length} productos disponibles`} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_384px] gap-6 items-start">
            <div>
              {/* listado de productos */}
              <ProductosGrid productos={productos} />
            </div>
            <div className="sticky top-4">
              <CarritoPanel />
            </div>
          </div>
        </main>
      </AuthGate>
    </>
  );
}
