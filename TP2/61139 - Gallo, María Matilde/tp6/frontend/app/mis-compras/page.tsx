"use client";
import { useEffect, useState } from "react";
import { compras, compraDetalle } from ".././services/carrito";

export default function MisCompras(){
  const [list,setList]=useState<any[]>([]);
  const [sel,setSel]=useState<any|null>(null);

  useEffect(()=>{ compras().then(setList); },[]);
  useEffect(()=>{ if(list[0]) detalle(list[0].id); },[list]);

  async function detalle(id:number){
    const d = await compraDetalle(id); setSel(d);
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mis compras</h1>
      <div className="grid grid-cols-3 gap-6">
        <aside className="bg-white border rounded-xl p-4 space-y-3">
          {list.map(c=>(
            <button key={c.id} onClick={()=>detalle(c.id)}
              className="w-full text-left border rounded-lg px-3 py-2 hover:bg-gray-50">
              <div className="font-medium">Compra #{c.id}</div>
              <div className="text-sm opacity-70">Total: ${c.total.toFixed(2)}</div>
            </button>
          ))}
        </aside>
        <section className="col-span-2 bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Detalle de la compra</h2>
          {sel && (
            <>
              <div className="grid grid-cols-2 text-sm mb-3">
                <div>Compra #: {sel.compra.id}</div>
                <div>Fecha: {new Date(sel.compra.fecha).toLocaleString()}</div>
                <div>Dirección: {sel.compra.direccion}</div>
                <div>Tarjeta: ****-****-****-{sel.compra.tarjeta}</div>
              </div>
              <div className="divide-y">
                {sel.items.map((i:any)=>(
                  <div key={i.id} className="flex justify-between py-2">
                    <span>{i.nombre} <span className="opacity-60">Cant: {i.cantidad}</span></span>
                    <span>${(i.precio_unitario).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>${sel.compra.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>IVA:</span><span>${sel.compra.iva.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Envío:</span><span>${sel.compra.envio.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold"><span>Total pagado:</span><span>${sel.compra.total.toFixed(2)}</span></div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
