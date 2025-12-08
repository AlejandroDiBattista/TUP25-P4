"use client";

import { useState } from "react";
import Navbar from "../components/navbar";
import Formulario from "./formulario";


export default function login() {
    const [token, setToken] = useState<string>("");
    return (


        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <Navbar
                    token={token}
                    setToken={setToken}
                />
            </header>

            <main className=" flex-grow flex items-center justify-center p-4">
                <Formulario />
            </main>
        </div>
    );
}