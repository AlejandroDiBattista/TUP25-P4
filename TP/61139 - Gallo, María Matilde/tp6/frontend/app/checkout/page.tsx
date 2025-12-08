"use client";
import { useState } from "react";
import { finalizar, verCarrito } from "../services/carrito";
import { useEffect } from "react";

export default function Checkout(){
  const [carrito,setCarrito]=useState<{items:any[]}>({items:[]});
  const [direccion,setDireccion]=useState(""); const [tarjeta,setTarjeta]=useState("");
  useEffect(()=>{ verCarrito().then(setCarrito); },[]);
  const subtotal = carrito.items.reduce((a,i)=> a + i.precio*i.cantidad, 0);
  const iva = carrito.items.reduce((a,i)=> a + i.precio*i.cantidad*(i.titulo.includes("Disco")||i.titulo.includes("SSD")||i.titulo.includes("Electr")?0.10:0.21), 0);
  const envio = subtotal>1000?0:50; const total=subtotal+iva+envio;
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Finalizar compra</h1>
      <div className="grid grid-cols-3 gap-6">
        <section className="col-span-2 bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Resumen del carrito</h2>
          <div className="space-y-2">
            {carrito.items.map(it=>(
              <div key={it.product_id} className="flex justify-between text-sm">
                <span>{it.titulo} <span className="opacity-60">Cant: {it.cantidad}</span></span>
                <span>${(it.precio*it.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 text-sm space-y-1">
            <div className="flex justify-between"><span>Total productos:</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>IVA:</span><span>${iva.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Envío:</span><span>${envio.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-lg"><span>Total a pagar:</span><span>${total.toFixed(2)}</span></div>
          </div>
        </section>
        <aside className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Datos de envío</h2>
          <input className="w-full border rounded-md px-3 py-2 mb-3" placeholder="Dirección" value={direccion} onChange={e=>setDireccion(e.target.value)}/>
          <input className="w-full border rounded-md px-3 py-2 mb-4" placeholder="Tarjeta" value={tarjeta} onChange={e=>setTarjeta(e.target.value)}/>
          <button className="w-full bg-slate-900 text-white py-2 rounded-md"
            onClick={async()=>{ await finalizar(direccion,tarjeta); location.href="/mis-compras"; }}>
            Confirmar compra
          </button>
        </aside>
      </div>
    </main>
  );
}
