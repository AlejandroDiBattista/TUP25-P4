"use client";

import Navbar from "../components/navbar";
import FormularioRegistro from "./formulario";


export default function Registro() {


    return (


        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <Navbar />
            </header>

            <main className=" flex-grow flex items-center justify-center p-4">
                <FormularioRegistro />
            </main>
        </div>
    );
}