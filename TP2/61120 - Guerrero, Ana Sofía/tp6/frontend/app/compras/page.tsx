"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMisCompras } from '@/services/api';
import { CompraRead, ItemCompra } from '@/types';
import { useRouter } from 'next/navigation';

export default function ComprasPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [compras, setCompras] = useState<CompraRead[]>([]);
    const [selectedCompra, setSelectedCompra] = useState<CompraRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchCompras = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error("No autenticado");
                    const data = await getMisCompras(token);
                    setCompras(data);
                    // Seleccionar la compra más reciente por defecto
                    if (data.length > 0) {
                        setSelectedCompra(data[0]);
                    }
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchCompras();
        }
    }, [isAuthenticated]);

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-AR');
    };

    const calcularSubtotal = (items: ItemCompra[]) => {
        return items.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);
    };

    if (loading || authLoading) {
        return <p className="text-center mt-10">Cargando historial de compras...</p>;
    }

    if (error) {
        return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
    }

    return (
        <div className="container mx-auto max-w-6xl mt-10">
            <h1 className="text-3xl font-bold mb-8">Mis Compras</h1>
            {compras.length === 0 ? (
                <p>Aún no has realizado ninguna compra.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Columna de Lista de Compras */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
                            {compras.map(compra => (
                                <div key={compra.id}
                                     onClick={() => setSelectedCompra(compra)}
                                     className={`p-3 rounded-md cursor-pointer ${selectedCompra?.id === compra.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}>
                                    <p className="font-bold">Compra #{compra.id}</p>
                                    <p className="text-sm">{formatFecha(compra.fecha)}</p>
                                    <p className="text-sm mt-1">Total: ${compra.total.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Columna de Detalle de Compra */}
                    <div className="md:col-span-2">
                        {selectedCompra && (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-2xl font-semibold mb-4 border-b pb-3 text-black">Detalle de la compra #{selectedCompra.id}</h2>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-6 text-black">
                                    <div><span className="font-semibold">Fecha:</span> {formatFecha(selectedCompra.fecha)}</div>
                                    <div><span className="font-semibold">Tarjeta:</span> **** **** **** {selectedCompra.tarjeta.slice(-4)}</div>
                                    <div className="col-span-2"><span className="font-semibold">Dirección:</span> {selectedCompra.direccion}</div>
                                </div>
                                <h3 className="font-semibold mb-3 text-black">Productos</h3>
                                <div className="space-y-3 mb-6 text-black">
                                    {selectedCompra.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <span>{item.nombre} (x{item.cantidad})</span>
                                            <span>${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-4 space-y-2 text-sm text-black">
                                    <div className="flex justify-between"><span>Subtotal:</span> <span>${calcularSubtotal(selectedCompra.items).toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Envío:</span> <span>${selectedCompra.envio.toFixed(2)}</span></div>
                                    <div className="flex justify-between font-bold text-base mt-2"><span>Total pagado:</span> <span>${selectedCompra.total.toFixed(2)}</span></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}