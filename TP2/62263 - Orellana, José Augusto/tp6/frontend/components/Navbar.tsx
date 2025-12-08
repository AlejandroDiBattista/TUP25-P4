import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import LogoutButton from '@/components/LogoutButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Perfil {
  id: number;
  nombre: string;
  email: string;
}

async function obtenerPerfil(token: string): Promise<Perfil | null> {
  try {
    const response = await fetch(`${API_URL}/perfil`, {
      cache: 'no-store',
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    return null;
  }
}

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  const perfil = token ? await obtenerPerfil(token.value) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          TP6 Shop
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
            <Link href="/">Productos</Link>
          </Button>

          {perfil ? (
            <>
              <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
                <Link href="/mis-compras">Mis compras</Link>
              </Button>

              <span className="hidden text-sm font-semibold text-slate-700 sm:inline">{perfil.nombre}</span>

              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="outline" asChild className="border-slate-200 text-slate-700 hover:border-slate-300">
                <Link href="/login">Ingresar</Link>
              </Button>

              <Button asChild className="bg-slate-900 hover:bg-slate-900/90">
                <Link href="/registro">Crear cuenta</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
