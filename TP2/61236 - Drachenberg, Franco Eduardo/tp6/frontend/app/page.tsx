import { obtenerProductos } from "./services/productos";
import { CatalogoContent } from "./components/CatalogoContent";

export default async function Home() {
  const productos = await obtenerProductos();
  const categorias = Array.from(new Set(productos.map((producto) => producto.categoria))).filter(
    Boolean,
  );

  return <CatalogoContent initialProducts={productos} categorias={categorias} />;
}
