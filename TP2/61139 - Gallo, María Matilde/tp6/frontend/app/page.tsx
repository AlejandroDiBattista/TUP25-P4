"use client";
import { useEffect, useState } from "react";
import ProductCard from "./components/ProductCard"; 
import { getProductos } from "./services/productos";
import { addItem, verCarrito, delItem } from "./services/carrito";

export default function Home() {
  const [productos, setProductos] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [carrito, setCarrito] = useState<{items:any[]}>({items:[]});

  const cargar = async()=> setProductos(await getProductos(q||undefined, categoria||undefined));
  const cargarCarrito = async()=> setCarrito(await verCarrito());

  
useEffect(()=>{
  cargar();
},[q, categoria]);


useEffect(()=>{
  cargarCarrito();
},[]);


  const subtotal = carrito.items.reduce((a,i)=> a + i.precio*i.cantidad, 0);
  const iva = carrito.items.reduce((a,i)=> a + i.precio*i.cantidad*(i.titulo.includes("Disco")||i.titulo.includes("SSD")||i.titulo.includes("Electr")?0.10:0.21), 0);
  const envio = subtotal>1000?0:50;
  const total = subtotal+iva+envio;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..."
               className="border rounded-md px-3 py-2 w-[600px]"/>
        <select value={categoria} onChange={e=>setCategoria(e.target.value)}
                className="border rounded-md px-3 py-2">
          <option value="">Todas las categorías</option>
          <option>Ropa de hombre</option><option>Ropa de mujer</option>
          <option>Joyería</option><option>Electrónica</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 space-y-4">
          {productos.map(p=>(
            <ProductCard key={p.id} p={p} onAdd={async(id)=>{
              await addItem(id,1); await cargarCarrito(); await cargar();
            }}/>
          ))}
        </div>

        {/* Carrito lateral */}
        <aside className="bg-white border rounded-xl p-4 h-fit sticky top-6">
          <div className="space-y-4">
            {carrito.items.map(it=>(
              <div key={it.product_id} className="flex gap-3 items-center">
                <img src={`http://127.0.0.1:8000/${it.imagen}`} className="w-16 h-16 object-contain bg-gray-100 rounded"/>
                <div className="flex-1">
                  <div className="text-sm">{it.titulo}</div>
                  <div className="text-xs opacity-60">${it.precio.toFixed(2)} c/u</div>
                </div>
                <div className="text-sm">x{it.cantidad}</div>
                <button className="text-red-600 text-sm" onClick={async()=>{
                  await delItem(it.product_id); await cargarCarrito(); await cargar();
                }}>−</button>
              </div>
            ))}
            <div className="border-t pt-3 text-sm space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>IVA</span><span>${iva.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Envío</span><span>${envio.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-2">
              <a href="/checkout" className="flex-1 bg-slate-900 text-white text-center py-2 rounded-md">Continuar compra</a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
