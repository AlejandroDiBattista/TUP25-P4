"use client";

import { obtenerProductos } from './services/productos';
import ProductoCard from './components/ProductoCard';
import Navbar from './components/navbar';
import SearchBarWithCategory from './components/search';
import { CarritoRead, Producto } from './types';
import { useEffect, useState } from 'react';
import Carrito from './components/Carrito';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [CarritoData, setCarritoData] = useState<CarritoRead[]>([]);
  const [token, setToken] = useState<string>('');
  // const productos = await obtenerProductos();

  useEffect(() => {
    const ifToken = localStorage.getItem("token");
    if (ifToken) setToken(ifToken);
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const prods = await obtenerProductos();
        setProductos(prods);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };

    fetchProductos();

  }, [token]);


  const categoriaUnicas = ['ropa de hombre', 'joyeria', 'electronica', 'ropa de mujer'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <Navbar
          token={token}
          setToken={setToken} />
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <SearchBarWithCategory
          categorias={categoriaUnicas}
          setProductos={setProductos}
        />
        <div className="grid grid-cols-4 gap-6 mt-6">

          {/* COLUMNA 1: Carrito (Queremos que aparezca ARRIBA en móvil, y a la DERECHA en desktop) */}
          <div className="col-span-4 lg:col-span-1 order-1 lg:order-2">
            <Card className="p-4 sticky top-4">
              {!token ? (

                <h2 className="mx-auto ">Inicie Sesion</h2>

              ) : (
                <Carrito
                  CarritoData={CarritoData}
                  setCarritoData={setCarritoData}
                  setProductos={setProductos}
                  productos={productos}
                  token={token}
                />)
              }
            </Card>
          </div>

          {/* COLUMNA 2: Cards de Productos (Queremos que aparezca ABAJO en móvil, y a la IZQUIERDA en desktop) */}
          <div className="col-span-4 lg:col-span-3 order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {productos.map((producto) => (
                <ProductoCard key={producto.id}
                  producto={producto}
                  setCarritoData={setCarritoData}
                  carritoData={CarritoData}
                  setProductos={setProductos}
                />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
