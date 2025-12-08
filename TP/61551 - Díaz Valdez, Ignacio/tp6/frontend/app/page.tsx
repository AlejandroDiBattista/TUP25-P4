import { obtenerProductos } from './services/productos';
import BarraDeBusqueda from './components/BarraDeBusqueda';

export default async function Home() {
  const productos = await obtenerProductos();

  return <BarraDeBusqueda productos={productos} />;
}
