'use client';

import ProductosBrowser from './components/ProductosBrowser';
import CartPanel from './components/CartPanel';

export default function HomePage() {
  return (
    // Más espacio respecto al navbar
    <div className="mx-auto max-w-screen-2xl px-4 pt-12 pb-6">
      {/* 3/5 para productos, 2/5 para carrito */}
      <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-4 gap-3">
        <div className="lg:col-span-3">
          <ProductosBrowser />
        </div>
        <div className="lg:col-span-2">
          {/* separador para alinear el carrito debajo de la fila de filtros */}
          <div className="hidden lg:block h-16 mb-4" />
          <CartPanel />
        </div>
      </div>
    </div>
  );
}
