import { cookies } from 'next/headers';
import { obtenerProductos } from './services/productos';
import { obtenerCarrito, obtenerPerfil } from './services/usuarios';
import ProductCatalog from './components/ProductCatalog';
import type { Carrito, Usuario } from './types';

export default async function Home() {
  const productos = await obtenerProductos();
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  let usuario: Usuario | null = null;
  let carrito: Carrito | null = null;

  if (token) {
    usuario = await obtenerPerfil(token.value);

    if (usuario) {
      carrito = await obtenerCarrito(token.value);
    }
  }

  return <ProductCatalog productos={productos} usuario={usuario} carrito={carrito} />;
}
