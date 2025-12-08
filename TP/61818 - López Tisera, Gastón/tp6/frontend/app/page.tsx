import { ProductCatalogWithCart } from "@/components/catalog/ProductCatalogWithCart";
import { fetchProductos } from "@/lib/products";

type PageSearchParams =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

async function resolveSearchParams(
  searchParams?: PageSearchParams,
): Promise<Record<string, string | string[] | undefined>> {
  if (!searchParams) {
    return {};
  }
  return (await Promise.resolve(searchParams)) ?? {};
}

export default async function Home({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const params = await resolveSearchParams(searchParams);

  const search =
    typeof params.search === "string" ? params.search.trim() : undefined;
  const categoria =
    typeof params.categoria === "string" ? params.categoria : undefined;

  const [catalogoCompleto, productosFiltrados] = await Promise.all([
    fetchProductos(),
    fetchProductos({ search, categoria }),
  ]);

  const categoriasDisponibles = Array.from(
    new Set(catalogoCompleto.map((producto) => producto.categoria)),
  ).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

  return (
    <ProductCatalogWithCart
      productos={productosFiltrados}
      categorias={categoriasDisponibles}
      filters={{ search, categoria }}
    />
  );
}
