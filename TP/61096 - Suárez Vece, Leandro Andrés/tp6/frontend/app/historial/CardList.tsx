import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Resumen from "./resumen";
import { CompraResumen } from "../types";

interface ComprasProps {
    compras: CompraResumen[];
    token: string
}

export default function CardList({ compras, token }: ComprasProps) {

    const [compraSeleccionada, setCompraSeleccionada] = useState<CompraResumen>(compras[0]);

    useEffect(() => {
        setCompraSeleccionada(compras[0]);
        console.log(compras);

    }, [compraSeleccionada])

    const seleccionarCompra = (compra: CompraResumen) => {
        setCompraSeleccionada(compra);

    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Mis compras</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-1 space-y-4">
                    {compras.map((compra) => (
                        <Card
                            key={compra.id}

                            className={`cursor-pointer transition-all ${compra?.id === compraSeleccionada?.id
                                ? "border-blue-600 bg-gray-100 shadow-md"
                                : "border-gray-200 hover:border-blue-300"
                                }`}
                            onClick={() => seleccionarCompra(compra)}
                        >
                            <CardContent className="p-4">
                                <p className="font-semibold text-base">Compra #: {compra.id}</p>
                                <p className="text-xs text-gray-600">{compra.fecha}</p>
                                <p className="text-lg font-bold mt-1">Total: ${compra.total.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-2">
                    <Resumen id={compraSeleccionada?.id || compras[0]?.id} token={token} />
                </div>
            </div>
        </div>
    );
}
