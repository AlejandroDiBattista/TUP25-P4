import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import type { Producto } from "@/app/types";
import { SiteHeader } from "@/components/site-header";
import { AddToCartButton } from "./AddToCartButton";

type ProductoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const obtenerProductoPorId = cache(async (id: string): Promise<Producto | null> => {
  const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("No se pudo cargar la información del producto");
  }

  return response.json();
});

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const { id } = await params;
  const producto = await obtenerProductoPorId(id);

  if (!producto) {
    return {
      title: "Producto no encontrado | TP6 Shop",
      description: "No pudimos encontrar el producto solicitado.",
    };
  }

  return {
    title: `${producto.titulo} | TP6 Shop`,
    description: producto.descripcion,
  };
}

export default async function ProductoDetallePage({ params }: ProductoPageProps) {
  const { id } = await params;
  const producto = await obtenerProductoPorId(id);

  if (!producto) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader active="products" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <span aria-hidden="true">←</span> Volver a los productos
        </Link>

        <section className="grid gap-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-8">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={`${API_BASE_URL}/${producto.imagen}`}
                alt={producto.titulo}
                fill
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 640px"
                priority
                unoptimized
              />
            </div>
            <div className="space-y-4">
              <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                {producto.categoria}
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">{producto.titulo}</h1>
              <p className="text-base leading-relaxed text-slate-600">{producto.descripcion}</p>
            </div>
          </div>

          <aside className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-6">
            <div>
              <p className="text-sm text-slate-500">Precio</p>
              <p className="text-3xl font-semibold text-slate-900">{formatCurrency(producto.precio)}</p>
            </div>

            <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-4">
              <DetalleItem label="Disponibilidad" value={`${producto.existencia} unidades`} />
              <DetalleItem
                label="Valoración de clientes"
                value={`${producto.valoracion.toFixed(1)} / 5`}
              />
              <DetalleItem label="ID de producto" value={`#${producto.id}`} />
            </div>

            <AddToCartButton
              productoId={producto.id}
              titulo={producto.titulo}
              disponible={producto.existencia > 0}
            />

            <p className="text-sm text-slate-500">
              Este producto forma parte del catálogo TP6 Shop. Todas las compras son protegidas
              mediante nuestro sistema de pagos y envíos.
            </p>
          </aside>
        </section>
      </main>
    </div>
  );
}

type DetalleItemProps = {
  label: string;
  value: string;
};

function DetalleItem({ label, value }: DetalleItemProps) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}
