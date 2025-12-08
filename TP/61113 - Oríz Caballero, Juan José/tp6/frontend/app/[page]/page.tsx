import { notFound } from 'next/navigation';
import Carrito from '../components/carrito';
import Ingresar from '../components/Ingresar';
import MisCompras from '../components/MisCompras';
import Ticket from '../components/ticket';
import Cuenta from '../components/Cuenta';

const componentMap: Record<string, React.ComponentType> = {
  carrito: Carrito,
  ingresar: Ingresar,
  'mis-compras': MisCompras,
  recibo: Ticket,
  'crear-cuenta': Cuenta,
};

interface PageProps {
  params: Promise<{ page: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { page } = await params;
  const Component = componentMap[page];

  if (!Component) {
    notFound();
  }

  return <Component />;
}

export async function generateStaticParams() {
  return Object.keys(componentMap).map((page) => ({
    page,
  }));
}
