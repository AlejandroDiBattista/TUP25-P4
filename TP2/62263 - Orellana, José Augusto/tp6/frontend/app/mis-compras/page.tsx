import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { obtenerCompras } from '../services/compras';
import MisComprasView from '@/app/mis-compras/MisComprasView';

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function MisComprasPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  }

  const compras = await obtenerCompras(token.value);

  if (!compras.length) {
    return (
      <section className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Mis compras</h1>
          <p className="text-sm text-slate-500">Todavía no realizaste compras. Explora nuestros productos y realiza tu primer pedido.</p>
        </header>

        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          <p>No encontramos compras registradas.</p>
          <Link href="/" className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-900/90">
            Ver productos
          </Link>
        </div>
      </section>
    );
  }

  const compraParam = searchParams?.compra;
  const compraIdRaw = Array.isArray(compraParam) ? compraParam[0] : compraParam;
  const compraId = compraIdRaw ? Number.parseInt(compraIdRaw, 10) : undefined;

  return <MisComprasView compras={compras} initialCompraId={Number.isFinite(compraId ?? NaN) ? compraId : undefined} />;
}
