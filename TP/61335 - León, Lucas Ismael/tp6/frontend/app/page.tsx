import { obtenerProductos } from './services/productos';
import ProductoCard from './components/ProductoCard';
import Filtros from './components/Filtros';
import SidebarCarrito from './components/SidebarCarrito';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ buscar?: string | string[]; categoria?: string | string[] }>;
}) {
  const sp = await searchParams;
  const buscar = Array.isArray(sp?.buscar) ? sp.buscar[0] : sp?.buscar;
  const categoria = Array.isArray(sp?.categoria) ? sp.categoria[0] : sp?.categoria;

  const productos = await obtenerProductos({ buscar, categoria });

  return (
    <div className="">
      <div className="mb-4">
        <div className="bg-white border rounded p-4">
          <Filtros />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="space-y-3 lg:col-span-2">
          {productos.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
        <div>
          <SidebarCarrito />
        </div>
      </div>
    </div>
  );
}
