
"use client";
import NavBarClient from "../components/NavBarClient";
import { useEffect, useState } from "react";

function maskCard(card: string) {
  if (!card) return "";
  return card.replace(/.(?=.{4})/g, "*");
}

export default function ComprasPage() {
  const [compras, setCompras] = useState<any[]>([]);
  const [seleccionada, setSeleccionada] = useState<number>(0);

  useEffect(() => {
    const usuario = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("usuario") || "null") : null;
    const comprasGuardadas = JSON.parse(localStorage.getItem("compras") || "[]");
    const comprasUsuario = usuario?.email ? comprasGuardadas.filter((c: any) => c.usuario === usuario.email) : [];
    setCompras(comprasUsuario.reverse()); 
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarClient />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold mb-10">Mis compras</h1>
        <div className="flex gap-8 w-full">
          <section className="flex-1">
            <ul className="flex flex-col gap-4">
              {compras.length === 0 ? (
                <li className="text-gray-500">No tienes compras realizadas.</li>
              ) : (
                compras.map((compra, idx) => (
                  <li
                    key={idx}
                    className={`rounded-xl border px-6 py-5 cursor-pointer transition ${seleccionada === idx ? "bg-gray-100 border-gray-400" : "bg-white border-gray-200"}`}
                    onClick={() => setSeleccionada(idx)}
                  >
                    <div className="font-bold text-lg">Compra #{compras.length - idx}</div>
                    <div className="text-gray-500 text-sm">{new Date(compra.fecha).toLocaleString()}</div>
                    <div className="mt-2 text-base font-semibold">Total: ${compra.total.toFixed(2)}</div>
                  </li>
                ))
              )}
            </ul>
          </section>
          <section className="flex-1">
            <div className="bg-white rounded-2xl shadow p-10 border border-gray-200">
              <h2 className="text-2xl font-bold mb-8">Detalle de la compra</h2>
              {compras.length === 0 ? (
                <div className="text-gray-500">Selecciona una compra para ver el detalle.</div>
              ) : (
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="font-bold">Compra #: {compras.length - seleccionada}</div>
                    <div className="font-bold">Fecha: {new Date(compras[seleccionada].fecha).toLocaleString()}</div>
                  </div>
                  {compras[seleccionada].direccion && (
                    <div className="mb-2"><span className="font-bold">Dirección:</span> {compras[seleccionada].direccion}</div>
                  )}
                  {compras[seleccionada].tarjeta && (
                    <div className="mb-2"><span className="font-bold">Tarjeta:</span> {maskCard(compras[seleccionada].tarjeta)}</div>
                  )}
                  <div className="font-bold mt-6 mb-2">Productos</div>
                  {compras[seleccionada].carrito.map((item: any, i: number) => {
                    const esElectronico = (item.categoria?.toLowerCase() === "electrónica" || item.categoria?.toLowerCase() === "electronica");
                    const ivaTasa = esElectronico ? 0.10 : 0.21;
                    const ivaItem = item.iva !== undefined ? item.iva : (item.precio ?? 0) * item.cantidad * ivaTasa;
                    return (
                      <div key={i} className="flex justify-between items-center border-b border-gray-100 py-2">
                        <div>
                          <div className="font-semibold text-base text-gray-900">{item.nombre || item.titulo}</div>
                          <div className="text-gray-500 text-sm">Cantidad: {item.cantidad}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">${(item.precio ?? 0).toFixed(2)}</div>
                          <div className="text-gray-400 text-sm">IVA ({esElectronico ? "10%" : "21%"}): {ivaItem.toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })}
                  <hr className="my-6" />
                  <div className="text-base mb-2">Subtotal: <span className="font-medium">${(compras[seleccionada].subtotal ?? 0).toFixed(2)}</span></div>
                  <div className="text-base mb-2">IVA: <span className="font-medium">${(compras[seleccionada].iva ?? 0).toFixed(2)}</span></div>
                  <div className="text-base mb-2">Envío: <span className="font-medium">${(compras[seleccionada].envio ?? 0).toFixed(2)}</span></div>
                  <div className="text-xl font-bold mt-4">Total pagado: <span className="text-black">${(compras[seleccionada].total ?? 0).toFixed(2)}</span></div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
