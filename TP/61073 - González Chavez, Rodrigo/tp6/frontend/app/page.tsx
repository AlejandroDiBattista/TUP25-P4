"use client"
// import { obtenerProductos } from './services/productos';
// import ProductoCard from './components/ProductoCard';

// export default async function Home() {
//   const productos = await obtenerProductos();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-6">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Catálogo de Productos
//           </h1>
//           <p className="text-gray-600 mt-2">
//             {productos.length} productos disponibles
//           </p>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {productos.map((producto) => (
//             <ProductoCard key={producto.id} producto={producto} />
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }
import {useEffect, useState} from "react"
import { obtenerProductos } from "./services/productos"
import ProductoCard from "./components/ProductoCard"
import BusquedaBar from "./components/BusquedaBar"
import { Producto } from "./types"
import CarritoLateral from "./components/CarritoLateral"

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([])
  const cargarProductos = async (buscar?: string, categoria?: string) => {

      const data = await obtenerProductos({buscar, categoria})
      setProductos(data)
  }

  useEffect(() => {cargarProductos()}, [])

  return (
    <div className="space-y-6">
      <BusquedaBar Buscar={(texto, categoria) => cargarProductos(texto, categoria)} />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {productos.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <div className="w-full lg:w-[350px]">
            <CarritoLateral />
          </div>
        </div>
    </div>
  )
}
