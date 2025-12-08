"use client";

import { useState } from "react";
import { UsuarioRegister } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { registrarUsuario } from "../services/usuarios";
import { useRouter } from 'next/navigation';

export default function FormularioRegistro() {
    const router = useRouter();
    // 1. Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState<UsuarioRegister>({
        nombre: "Leandro Vece",
        email: "vece@gmail.com",
        password: "miPassword123",
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Evita el recargo de la página

        try {
            const res = await registrarUsuario(formData);
            if (res) {
                alert(res)
                console.log(res.message);
                router.push('/login');
            }
        } catch (error) {
            console.error("Error al registrar usuario:", error);
        }

    };

    return (

        <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6">Crear cuenta</h1>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Campo Nombre */}
                <div>
                    <label htmlFor="nombre" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Nombre
                    </label>
                    <Input
                        id="nombre"
                        type="text"
                        placeholder="Juan Perez"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Campo Correo */}
                <div>
                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Correo
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="jperez@mail.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Campo Contraseña */}
                <div>
                    <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Contraseña
                    </label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Botón Registrarme (Negro como en su imagen, usando clases de Tailwind) */}
                <Button type="submit" className="w-full h-10 mt-6 bg-black text-white hover:bg-gray-800">
                    Registrarme
                </Button>

            </form>

            {/* Enlace de inicio de sesión */}
            <div className="mt-4 text-center text-sm text-gray-600">
                ¿Ya tienes cuenta? <Link href="/login" className="font-semibold hover:underline">Inicia sesión</Link>
            </div>
        </div>
    );
}