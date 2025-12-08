"use client";
import NavBarClient from "../components/NavBarClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [finalizada, setFinalizada] = useState(false);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<any>(null);
  const router = useRouter();

  const obtenerClaveCarrito = (usuarioEmail?: string) => {
    return usuarioEmail ? `carrito_${usuarioEmail}` : "carrito";
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    let usuarioObj = null;
    
    if (usuarioGuardado) {
      usuarioObj = JSON.parse(usuarioGuardado);
      setUsuario(usuarioObj);
    }
    
    if (usuarioObj?.email) {
      const claveCarrito = obtenerClaveCarrito(usuarioObj.email);
      const carritoGuardado = localStorage.getItem(claveCarrito);
      if (carritoGuardado) {
        setCarrito(JSON.parse(carritoGuardado));
      }
    }
  }, []);

  const subtotal = carrito.reduce((acc: number, item: any) => acc + item.precio * item.cantidad, 0);
  
  const ivaPorProducto = carrito.map((item: any) => {
    const esElectronico = (item.categoria?.toLowerCase() === "electrónica" || item.categoria?.toLowerCase() === "electronica");
    const ivaTasa = esElectronico ? 0.10 : 0.21;
    return item.precio * item.cantidad * ivaTasa;
  });
  const iva = ivaPorProducto.reduce((acc: number, v: number) => acc + v, 0);
  const envio = (carrito.length > 0 && (subtotal + iva) > 1000) ? 0 : (carrito.length > 0 ? 50 : 0);
  const total = subtotal + iva + envio;

  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBarClient />
      <main className="max-w-6xl mx-auto px-4 py-12">
        {!finalizada ? (
          <>
            <h1 className="text-4xl font-extrabold mb-10">Finalizar compra</h1>
            <div className="flex gap-8 w-full">
              <section className="bg-white rounded-2xl shadow p-10 flex-1 border border-gray-200">
                <h2 className="text-2xl font-bold mb-8">Resumen del carrito</h2>
                {carrito.length === 0 ? (
                  <div className="text-gray-500">No hay productos en el carrito.</div>
                ) : (
                  carrito.map((item: any, idx: number) => {
                    const esElectronico = (item.categoria?.toLowerCase() === "electrónica" || item.categoria?.toLowerCase() === "electronica");
                    const ivaTasa = esElectronico ? 0.10 : 0.21;
                    const ivaItem = item.precio * item.cantidad * ivaTasa;
                    return (
                      <div key={idx} className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-semibold text-lg text-gray-900">{item.nombre || item.titulo}</div>
                          <div className="text-gray-500 text-base">Cantidad: {item.cantidad}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold text-gray-900">${item.precio.toFixed(2)}</div>
                          <div className="text-gray-400 text-sm">IVA ({esElectronico ? "10%" : "21%"}): {ivaItem.toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <hr className="my-6" />
                <div className="text-base mb-2">Total productos: <span className="font-medium">${subtotal.toFixed(2)}</span></div>
                <div className="text-base mb-2">IVA: <span className="font-medium">${iva.toFixed(2)}</span></div>
                <div className="text-base mb-2">Envío: <span className="font-medium">${envio.toFixed(2)}</span></div>
                <div className="text-xl font-bold mt-4">Total a pagar: <span className="text-black">${total.toFixed(2)}</span></div>
              </section>
              <section className="bg-white rounded-2xl shadow p-10 flex-1 border border-gray-200">
                <h2 className="text-2xl font-bold mb-8">Datos de envío</h2>
                <form className="flex flex-col gap-6" onSubmit={async (e) => {
                  e.preventDefault();
                  
                  try {
                    const token = usuario?.access_token;
                    
                    if (!token) {
                      alert("Error: No se encontró token de usuario. Por favor, inicie sesión nuevamente.");
                      console.log("Usuario object:", usuario);
                      return;
                    }

                    console.log("Token encontrado:", token.substring(0, 10) + "...");
                    const compraData = {
                      productos: carrito.map((item: any) => ({
                        id: item.id,
                        cantidad: item.cantidad,
                        precio: item.precio
                      }))
                    };

                    console.log("Enviando compra al backend:", compraData);

                    const params = new URLSearchParams({
                      token: token,
                      direccion: direccion,
                      tarjeta: tarjeta
                    });

                    const response = await fetch(`http://localhost:8000/carrito/finalizar?${params}`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify(compraData)
                    });

                    if (!response.ok) {
                      let errorMessage = `Error ${response.status}: ${response.statusText}`;
                      try {
                        const errorData = await response.text();
                        errorMessage = errorData || errorMessage;
                      } catch {}
                      
                      console.error("Error en la compra:", errorMessage);
                      alert(`Error al procesar la compra: ${errorMessage}`);
                      return;
                    }

                    const compras = JSON.parse(localStorage.getItem("compras") || "[]");

                    const carritoConIVA = carrito.map((item: any) => {
                      const esElectronico = (item.categoria?.toLowerCase() === "electrónica" || item.categoria?.toLowerCase() === "electronica");
                      const ivaTasa = esElectronico ? 0.10 : 0.21;
                      return { ...item, iva: item.precio * item.cantidad * ivaTasa };
                    });
                    compras.push({
                      fecha: new Date().toISOString(),
                      carrito: carritoConIVA,
                      subtotal,
                      iva,
                      envio,
                      total,
                      direccion,
                      tarjeta,
                      usuario: usuario?.email ?? null
                    });
                    localStorage.setItem("compras", JSON.stringify(compras));
                    
                    const claveCarrito = obtenerClaveCarrito(usuario?.email);
                    localStorage.setItem(claveCarrito, JSON.stringify([]));
                    
                    setFinalizada(true);
                    
                  } catch (error) {
                    console.error("Error al procesar la compra:", error);
                    alert("Error de red al procesar la compra");
                  }
                }}>
                  <div>
                    <label className="block mb-2 text-base font-semibold text-gray-700">Dirección</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Dirección"
                      required
                      value={direccion}
                      onChange={e => setDireccion(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-base font-semibold text-gray-700">Tarjeta</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Tarjeta"
                      required
                      value={tarjeta}
                      onChange={e => setTarjeta(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded font-bold shadow hover:bg-transparent hover:text-blue-600 border border-blue-600 transition active:scale-95"
                  >Confirmar compra</button>
                </form>
              </section>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-extrabold mb-6 text-center">¡Compra finalizada!</h1>
            <p className="text-lg text-gray-700 mb-10 text-center">Gracias por tu compra. Puedes seguir comprando o ver tus compras realizadas.</p>
            <div className="flex gap-6">
              <button
                className="bg-blue-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-transparent hover:text-blue-600 border border-blue-600 transition active:scale-95"
                onClick={() => router.push("/")}
              >Seguir comprando</button>
              <button
                className="bg-blue-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-transparent hover:text-blue-600 border border-blue-600 transition active:scale-95"
                onClick={() => router.push("/compras")}
              >Ver mis compras</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
