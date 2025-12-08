import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Producto, ProductoRead } from "../types";
import { useState } from "react";
import { agregarAlCarrito, quitarDelCarrito } from "../services/Carrito";
import { on } from "events";


interface ItemCarritoProps {
    item: Producto;
    precioTotal: number;
    token?: string;
    onActualizarCantidad: (idProducto: number, nuevaCantidad: number) => void;
    cantidad: number;
    quitarProdCarrito: (id: number, cantidad: number) => void
}

export default function ItemCarrito({ item, precioTotal, token, onActualizarCantidad, cantidad, quitarProdCarrito }: ItemCarritoProps) {


    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const handleCantidadChange = async (id: number, nuevaCantidad: number) => {

        if (token) {
            try {
                await agregarAlCarrito(token, id, nuevaCantidad);
                onActualizarCantidad(id, nuevaCantidad);
            }
            catch (error) {
                console.error('Error al actualizar el carrito:', error);
            }
        }
    };

    const handleRemoveItem = async (id: number) => {
        try {
            const res = await quitarDelCarrito(token!, id);
            if (res) {
                alert(res.message)
                quitarProdCarrito(id, cantidad)

            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="flex space-x-3 border-b pb-4 last:border-b-0 last:pb-0 relative">

            <div className="w-16 h-16 flex-shrink-0 bg-gray-100   relative">

                <img
                    src={`${API_URL}/${item.imagen}`}
                    alt={item.titulo}
                    className="w-full h-full object-cover rounded-md " />
                <Button
                    size="icon"
                    variant="destructive"
                    className="h-5 w-5 p-0 text-xs rounded-full absolute top-[-6px] right-[-5px] z-12 
                   shadow-md bg-red-500 hover:bg-red-600 text-white border-white border"
                    onClick={() => handleRemoveItem(item.id!)} // Usar una función específica para eliminar
                    title="Eliminar producto"
                >
                    x
                </Button>
            </div>


            <div className="flex-grow">
                <p className="text-sm font-semibold">{item.titulo}</p>
                <p className="text-xs text-gray-500">${item.precio} c/u</p>



                <div className="flex items-center mt-1 space-x-0.5">
                    <div>

                    </div>
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 p-0 text-lg"
                        onClick={() => handleCantidadChange(item.id!, cantidad - 1)}
                        disabled={item.existencia <= 1}
                    >
                        -
                    </Button>
                    <Input
                        type="number"
                        value={cantidad}
                        className="w-10 h-6 text-center text-xs p-0"
                        readOnly // Generalmente se controla con botones
                    />
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 p-0 text-lg"
                        onClick={() => handleCantidadChange(item.id!, cantidad + 1)}
                        disabled={item.existencia <= 0} // Deshabilitar si está agotado
                    >
                        +
                    </Button>


                </div>


            </div>


            <div className="text-right flex-shrink-0">
                <span className="text-sm font-semibold">${precioTotal}</span>
            </div>
        </div>
    );
}