"use client"

import {useState, useEffect} from "react"
import {useAuthStore} from "../store/useAuthStore"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {Separator} from "../components/ui/separator"
import { Compra, ItemCompra } from "../types"
import { obtenerCompras, obtenerCompraPorId } from "../services/compras"
import { useSearchParams } from "next/navigation"

export default function MisComprasPage() {
    const [compras, setCompras] = useState<Compra[]>([])
    const [detalle, setDetalle] = useState<{compra: Compra, items: ItemCompra[]} | null>(null)
    const {token} = useAuthStore()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!token) return
        obtenerCompras(token)
            .then(setCompras)
            .catch(() => console.error("Error al cargar las compras"))
    }, [token])

    const verDetalle = async (id: number) => {
        if (!token) return
        try {
            const data = await obtenerCompraPorId(id, token)
            setDetalle(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        const compraId = searchParams.get("compraId")
        if (compraId && token) {
            verDetalle(Number(compraId))
        }
    }, [searchParams, token])

    const totales = (items: ItemCompra[]) => {

        const subtotal = items.reduce(
            (acc, item) => acc + item.precio_unitario * item.cantidad, 0
        )

        const iva = items.reduce((acc, item) => {
            const catElectro = item.categoria?.toLowerCase() === "electronica"
            const porcentaje = catElectro ? 0.1 : 0.21
            return acc + item.precio_unitario * item.cantidad * porcentaje
        }, 0)

        const envio = subtotal + iva >= 1000 ? 0 : items.length > 0 ? 50 : 0
        const total = subtotal + iva + envio

        return {subtotal, iva, total, envio}
    }

    return (
        <div className="p-8 flex flex-col md:flex-row gap-8 min-h-screen bg-gray-50">
            <div className="w-full md:w-1/3 space-y-3">
                <h2 className="text-2xl font-semibold mb-4">
                    Mis Compras
                </h2>
                {compras.length === 0 && (
                    <p className="text-gray-500 text-sm">
                        Aún no realizaste ninguna compra
                    </p>
                )}
                {compras.map((c) => (
                    <Card
                        key={c.id}
                        className={`cursor-pointer transition ${
                            detalle?.compra.id === c.id ? "border-gray-900" : "hover:bg-gray-100" 
                        }`}
                        onClick={() => verDetalle(c.id)}
                    >
                        <CardContent className="p-4">
                            <p className="font-medium">
                                Compra #{c.id}
                            </p>
                            <p className="text-sm text-gray-500">
                                {new Date(c.fecha).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-700">
                                Total: ${c.total.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="flex-1">
                {detalle ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Detalle de la compra
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <p>
                                    <span className="font-medium">Compra #</span>
                                    {detalle.compra.id}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Fecha:
                                    </span>{" "}
                                    {new Date(detalle.compra.fecha).toLocaleString()}
                                </p>
                            </div>
                            <p>
                                <span className="font-medium">
                                    Dirección:   
                                </span>{" "}
                                {detalle.compra.direccion}
                            </p>
                            <p>
                                <span className="font-medium">
                                    Tarjeta:
                                </span>{" "}
                                **** **** **** {detalle.compra.tarjeta.slice(-4)}
                            </p>

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-2">
                                    Productos
                                </h3>
                                {detalle.items.map((item) => {
                                    const catElectro = item.categoria?.toLowerCase() === "electronica"
                                    const porcentaje = catElectro ? 0.1 : 0.21
                                    const itemSubtotal = item.precio_unitario * item.cantidad
                                    const itemIva = itemSubtotal * porcentaje

                                    return (
                                        <div key={item.id} className="flex justify-between items-center border-b py-2 text-sm">
                                            <div>
                                                <p>{item.nombre}</p>
                                                <p className="text-gray-500">Cantidad: {item.cantidad}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base">${itemSubtotal.toFixed(2)}</p>
                                            <p className="text-gray-500">IVA: ${itemIva.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>

                            {(() => {
                                const {subtotal, iva, envio, total} = totales(detalle.items)
                                return (
                                    <div className="space-y-1 text-sm">
                                        <p>Subtotal: ${subtotal.toFixed(2)}</p>
                                        <p>IVA: ${iva.toFixed(2)}</p>
                                        <p>Envío: ${envio.toFixed(2)}</p>
                                        <p className="font-semibold text-lg">
                                            Total Pagado: ${total.toFixed(2)}
                                        </p>
                                    </div>
                                )
                            })()}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-gray-500 text-center mt-10">
                        Seleccioná la compra para ver su detalle
                    </div>
                )}
            </div>
        </div>
    )
}