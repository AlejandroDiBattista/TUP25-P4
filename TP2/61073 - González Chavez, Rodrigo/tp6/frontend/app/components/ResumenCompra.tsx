"use client"

import Image from "next/image"
import { useCarritoStore } from "../store/useCarritoStore"
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card"

export default function ResumenCompra() {
    const {productos = []} = useCarritoStore()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const subtotal = productos.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
    const iva = subtotal * 0.21
    const envio = subtotal > 1000 ? 0 : productos.length > 0 ? 50 : 0
    const total = subtotal + iva + envio

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Resumen de tu compra
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {productos.map((p) => (
                    <div key={p.producto_id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12">
                                <Image
                                    src={`${API_URL}/imagenes/${p.imagen}`}
                                    alt={p.nombre}
                                    fill
                                    unoptimized
                                    className="object-contain rounded"
                                />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{p.nombre}</p>
                                <p className="text-xs text-gray-500">
                                    Cantidad: {p.cantidad} x {p.precio.toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <p className="font-semibold text-sm">
                            ${(p.precio * p.cantidad).toFixed(2)}
                        </p>
                    </div>
                ))}
                <div className="text-sm mt-4 space-y-1">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>IVA</span>
                        <span>${iva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Envío</span>
                        <span>${envio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}