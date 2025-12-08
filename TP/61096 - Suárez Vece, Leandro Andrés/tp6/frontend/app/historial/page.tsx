"use client";

import { useEffect, useState } from "react";

import Navbar from "../components/navbar";


import CardList from "./CardList";
import { verCompras } from "../services/compras";
import { CompraResumen } from "../types";

export default function Historial() {

    const [token, setToken] = useState<string>("");
    const [compras, setCompras] = useState<CompraResumen[]>();

    useEffect(() => {
        const ifToken = localStorage.getItem("token");
        const fetchCompras = async () => {
            try {
                const res = await verCompras(ifToken!)
                if (res.length > 0)
                    setCompras(res)
            } catch (error) {
                console.error(error)
            }
        }
        if (ifToken) {
            setToken(ifToken);
            fetchCompras();
        }
    }, [])



    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <Navbar
                    token={token}
                    setToken={setToken}
                />
            </header>

            <main>
                {
                    compras && (

                        <CardList
                            compras={compras}
                            token={token}
                        />
                    )
                }
            </main>
        </div>
    );
}