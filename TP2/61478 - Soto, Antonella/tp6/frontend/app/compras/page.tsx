"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

type Compra = {
  id: number;
  fecha: number;
  direccion: string;
  tarjeta: string;
  total: number;
  envio: number;
};

type ItemCompra = {
  id: number;
  producto_id: number;
  cantidad: number;
  nombre: string;
  precio_unitario: number;
};

type DetalleCompra = {
  compra: Compra;
  items: ItemCompra[];
};

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<DetalleCompra | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user?.token) {
      fetchCompras();
    }
  }, [user, authLoading, router]);

  const fetchCompras = async () => {
    try {
      const res = await fetch("http://localhost:8000/compras", {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCompras(data);
        // Seleccionar la primera compra automáticamente
        if (data.length > 0) {
          fetchDetalleCompra(data[0].id);
        }
      } else {
        console.error("Error al cargar compras");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetalleCompra = async (compraId: number) => {
    setCompraSeleccionada(compraId);
    try {
      const res = await fetch(`http://localhost:8000/compras/${compraId}`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setDetalle(data);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-300 text-lg">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          Mis compras
        </h1>

        {compras.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl text-center">
            <p className="text-slate-300 mb-4 text-lg">No tienes compras realizadas aún</p>
            <button 
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de compras - Izquierda */}
            <div className="lg:col-span-1 space-y-3">
              {compras.map((compra) => {
                const fecha = new Date(compra.fecha * 1000);
                const isSelected = compraSeleccionada === compra.id;
                return (
                  <div 
                    key={compra.id} 
                    onClick={() => fetchDetalleCompra(compra.id)}
                    className={`bg-slate-800 p-4 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'border-2 border-cyan-500 shadow-cyan-500/20' 
                        : 'border-2 border-slate-700 hover:border-cyan-400 hover:shadow-cyan-400/10'
                    }`}
                  >
                    <h3 className="font-bold text-slate-200">Compra #{compra.id}</h3>
                    <p className="text-sm text-slate-400">
                      {fecha.toLocaleDateString()}, {fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="font-bold text-lg mt-2 text-cyan-400">Total: ${compra.total.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            {/* Detalle de compra - Derecha */}
            <div className="lg:col-span-2">
              {detalle ? (
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl">
                  <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Detalle de la compra
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-700">
                    <div>
                      <p className="text-sm text-slate-400">Compra #:</p>
                      <p className="font-semibold text-slate-200">{detalle.compra.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Fecha:</p>
                      <p className="font-semibold text-slate-200">
                        {new Date(detalle.compra.fecha * 1000).toLocaleDateString()}, {
                          new Date(detalle.compra.fecha * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Dirección:</p>
                      <p className="font-semibold text-slate-200">{detalle.compra.direccion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Tarjeta:</p>
                      <p className="font-semibold text-slate-200">****-****-****-{detalle.compra.tarjeta.slice(-4)}</p>
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-4 text-slate-200">Productos</h3>
                  <div className="space-y-4 mb-6">
                    {detalle.items.map((item) => {
                      const totalItem = item.precio_unitario * item.cantidad;
                      const ivaItem = totalItem * 0.21;
                      return (
                        <div key={item.id} className="flex justify-between items-start border-b border-slate-700 pb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-200">{item.nombre}</h4>
                            <p className="text-sm text-slate-400">Cantidad: {item.cantidad}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-cyan-400">${totalItem.toFixed(2)}</p>
                            <p className="text-xs text-slate-500">IVA: ${ivaItem.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-600">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-200">
                        ${(detalle.compra.total - detalle.compra.envio - (detalle.compra.total - detalle.compra.envio) * 0.21 / 1.21).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>IVA:</span>
                      <span className="font-semibold text-slate-200">
                        ${((detalle.compra.total - detalle.compra.envio) * 0.21 / 1.21).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Envío:</span>
                      <span className="font-semibold text-slate-200">${detalle.compra.envio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-3 border-t border-slate-600">
                      <span className="text-slate-200">Total pagado:</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                        ${detalle.compra.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl text-center">
                  <p className="text-slate-400">Selecciona una compra para ver el detalle</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
