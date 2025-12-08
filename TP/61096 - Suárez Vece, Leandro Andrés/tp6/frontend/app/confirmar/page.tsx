"use client";

import { useEffect, useState } from "react";
import { CarritoRead } from "../types";
import { verCarrito } from "../services/Carrito";
import Navbar from "../components/navbar";
import Formulario from "./Formulario";
import { useRouter } from "next/navigation";

export default function Confirmar() {

    const [token, setToken] = useState<string>("");
    const [CarritoData, setCarritoData] = useState<CarritoRead[]>([]);

    const [subtotal, setSubTotal] = useState<number[]>();
    const [impuestos, setInpuestos] = useState<number[]>();
    const router = useRouter();

    useEffect(() => {
        const fetchProductos = async (token: string) => {
            try {
                const res = await verCarrito(token!);
                if (res) {
                    setCarritoData(res);
                    setInpuestos(res.map(item => (item.producto.categoria == "electronica") ?
                        item.producto.precio * 0.10 : item.producto.precio * 0.21))
                    setSubTotal(res.map(item => item.producto.precio * item.cantidad))
                }

            } catch (error) {
                console.error('Error al cargar productos:', error);
                // localStorage.clear();
                router.push('/')
            }
        }

        const Iftoken = localStorage.getItem("token")
        console.log(Iftoken);

        if (Iftoken) {
            setToken(Iftoken);
            fetchProductos(Iftoken);
        }
        else {
            router.push('/')
        }
    }, [token]);


    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <Navbar
                    token={token}
                    setToken={setToken}
                />
            </header>

            <main>
                <Formulario
                    CarritoData={CarritoData}
                    subtotal={subtotal!}
                    impuestos={impuestos!}
                    token={token}
                />
            </main>
        </div>
    );
}