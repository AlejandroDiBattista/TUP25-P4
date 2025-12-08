import { CartPageClient } from "@/components/cart/CartPageClient";
import { fetchProductos } from "@/lib/products";

export default async function CartPage(): Promise<JSX.Element> {
  const productos = await fetchProductos();

  return <CartPageClient productos={productos} />;
}

