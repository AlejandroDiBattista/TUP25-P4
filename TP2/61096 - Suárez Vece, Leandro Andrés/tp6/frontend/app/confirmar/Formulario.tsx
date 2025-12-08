"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CarritoRead } from "../types";
import { finalizarCompra } from "../services/compras";
import { useRouter } from 'next/navigation';

// Interfaz para los datos del formulario de envío
export interface CompraFinalizar {
    direccion: string;
    tarjeta: string;
}
interface props {
    CarritoData: CarritoRead[];
    subtotal: number[]
    impuestos: number[]
    token: string
}

export default function Formulario({ CarritoData, subtotal, impuestos, token }: props) {

    const [formData, setFormData] = useState<CompraFinalizar>({
        direccion: "",
        tarjeta: "",
    });
    const router = useRouter();

    const totalsinImpuestos = subtotal?.reduce((acc, item) => acc + item, 0) || 0;
    const Impuestototales = impuestos?.reduce((acc, item) => acc + item, 0) || 0;

    // 2. Manejador de cambios
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value,
        }));
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Evita recarga
        // console.log("Datos de Envío y Pago capturados:", formData);
        try {
            console.log(token);

            const res = await finalizarCompra(token!, formData);
            if (res) {
                alert(res.message)
                router.push("./");
            }

        } catch (error) {
            console.error(error)
        }

    };



    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Finalizar compra</h1>

            {/* Contenedor Principal de 2 Columnas (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* COLUMNA 1: Resumen del Carrito */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Resumen del carrito</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Items del carrito */}
                        {CarritoData.map((item, index) => (
                            <div key={index} className="flex justify-between border-b pb-2">
                                <div>
                                    <p className="font-semibold text-sm">{item.producto.titulo}</p>
                                    <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">${subtotal![index].toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">IVA: ${impuestos![index].toFixed(2)};
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Totales */}
                        <div className="pt-4 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Total productos: ${totalsinImpuestos.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>IVA: ${Impuestototales.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Envío: ${totalsinImpuestos > 1000 ? 0 : 50}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                                <span>Total a pagar:</span>
                                <span>${(totalsinImpuestos + Impuestototales).toFixed()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* COLUMNA 2: Datos de Envío y Pago */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Datos de envío</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Dirección */}
                            <div>
                                <label htmlFor="direccion" className="text-sm font-medium">Dirección</label>
                                <Input
                                    id="direccion"
                                    type="text"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Tarjeta */}
                            <div>
                                <label htmlFor="tarjeta" className="text-sm font-medium">Tarjeta</label>
                                <Input
                                    id="tarjeta"
                                    type="text"
                                    value={formData.tarjeta}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Botón Confirmar Compra */}
                            <Button type="submit" className="w-full h-10 mt-6 bg-black text-white hover:bg-gray-800">
                                Confirmar compra
                            </Button>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}