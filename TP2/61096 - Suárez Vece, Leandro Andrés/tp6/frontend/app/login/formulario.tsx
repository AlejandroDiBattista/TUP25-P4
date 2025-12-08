"use client";

import { useState } from "react";
import { UsuarioLogin } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { iniciarSesion } from "../services/usuarios";
import { useRouter } from 'next/navigation';


export default function Formulario() {
    const [formData, setFormData] = useState<UsuarioLogin>({

        email: "vece@gmail.com",
        password: "miPassword123",
    });

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await iniciarSesion(formData);
            localStorage.setItem("token", res.access_token);
            router.push('/');
        } catch (error) {
            alert("Error al iniciar sesión");
        }
    };


    return (

        <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6">Crear cuenta</h1>

            <form onSubmit={handleSubmit} className="space-y-4">



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
                    Iniciar Sesion
                </Button>

            </form>

            {/* Enlace de inicio de sesión */}
            <div className="mt-4 text-center text-sm text-gray-600">
                ¿No tienes cuenta? <Link href="/registro" className="font-semibold hover:underline">Registrate aqui</Link>
            </div>
        </div>
    );
}