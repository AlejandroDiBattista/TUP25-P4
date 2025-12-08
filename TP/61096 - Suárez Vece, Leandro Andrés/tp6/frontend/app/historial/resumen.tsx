import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { verCompraPorId } from "../services/compras";
import { CompraDetalle } from "../types";


interface DetalleCompraProps {
    id: number;
    token: string
}

export default function Resumen({ id, token }: DetalleCompraProps) {

    const [compra, setCompra] = useState<CompraDetalle>();

    useEffect(() => {
        const fetchDetalles = async () => {

            try {
                const res = await verCompraPorId(token, id);
                if (res) {
                    setCompra(res)
                    console.log(res);
                }
            } catch (error) {
                console.error(error);
            }
        }
        if (id)
            fetchDetalles();


    }, [])

    return (
        <Card className="shadow-lg p-4"> {/* Creado más compacto: p-4 en lugar de p-6 */}
            <h2 className="text-lg font-bold mb-1">Detalle de la compra</h2> {/* Creado más compacto: text-lg y mb-1 */}

            {/* Fila de Datos Generales */}
            <div className="grid grid-cols-2 gap-x-2 border-b pb-2 mb-2 text-xs"> {/* Creado más compacto: text-xs, pb-2, gap-x-2 */}
                <div>
                    <p className="font-semibold">Compra #: {compra?.id}</p>
                    <p>Dirección: {compra?.direccion}</p>
                    <p>Tarjeta: {compra?.tarjeta}</p>
                </div>
                <div className="text-right">
                    <p>Fecha: {compra?.fecha}</p>
                </div>
            </div>

            {/* Productos */}
            <p className="font-bold mb-0.5">Productos</p> {/* Creado más compacto: mb-0.5 */}
            {compra?.items?.map((producto, index) => (
                <div key={index} className="flex justify-between items-start mb-0.5"> {/* Creado más compacto: mb-0.5 */}
                    <div className="flex-grow text-sm"> {/* Creado más compacto: text-sm */}
                        <p className="font-medium">{producto?.nombre}</p>
                        <p className="text-xs text-gray-500">Cantidad: {producto?.cantidad}</p>
                    </div>
                    <div className="text-right flex-shrink-0 text-sm"> {/* Creado más compacto: text-sm */}
                        <p>${producto?.precio_unitario.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Iva: {producto?.iva.toFixed(2)}</p>
                    </div>
                </div>
            ))}

            {/* Totales */}
            {/* Creado más compacto: mt-3, pt-2, space-y-0.5 */}
            <div className="mt-3 pt-2 border-t text-sm space-y-0.5 max-w-xs ml-auto">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">${compra?.items?.reduce((cc, itens) => cc + itens.precio_unitario, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>IVA:</span>
                    <span className="font-medium">${compra?.items?.reduce((cc, itens) => cc + itens.iva, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Envío:</span>
                    <span className="font-medium">${compra?.envio?.toFixed(2)}</span>
                </div>
                {/* Creado más compacto: text-base, pt-1, mt-1 */}
                <div className="flex justify-between text-base font-bold pt-1 border-t mt-1">
                    <span>Total pagado:</span>
                    <span>${compra?.total?.toFixed(2)}</span>
                </div>
            </div>
        </Card>
    );
}