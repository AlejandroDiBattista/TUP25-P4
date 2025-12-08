"use client";


import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Search } from "lucide-react"; // Asume que tienes instalado lucide-react para los íconos
import { useState } from "react";
import { buscarProductos } from "../services/productos";
import { Producto } from "../types";

// import { useState } from "react";

interface props {
    categorias: string[];
    setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
}

export default function SearchBarWithCategory({ categorias, setProductos }: props) {

    const [categoria, setCategoria] = useState("");
    const [titulo, setTitulo] = useState("");

    const handleSelect = async (value: string) => {
        const cat = value === "all" ? "" : encodeURIComponent(value.trim().toLowerCase());
        setCategoria(cat);

        const res = await buscarProductos(cat, titulo);
        setProductos(res);
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const tituloBuscado = e.target.value;
        setTitulo(tituloBuscado);
    }

    const handleSearchChange = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        const tituloActual = (e.target as HTMLInputElement).value;
        if (e.key === "Enter") {
            const tit = encodeURIComponent(tituloActual.trim().toLowerCase());
            const res = await buscarProductos(categoria, tit);
            setProductos(res);
        }
    }

    return (
        // Contenedor principal para alinear la barra de búsqueda y el select
        <div className="flex w-full max-w-4xl mx-auto p-4 space-x-2">

            {/* 1. Campo de Búsqueda (Input) */}
            <div className="relative flex-grow">
                {/* Ícono de la lupa a la izquierda */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />

                {/* El campo de input en sí */}
                <Input
                    type="search"
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 h-10 text-base rounded-lg border border-input focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    onKeyDown={handleSearchChange}
                />
            </div>

            {/* 2. Selector de Categorías (Select) */}
            <Select onValueChange={handleSelect}>
                {/* El botón visible del select */}
                <SelectTrigger className="w-[180px] h-11 text-sm font-medium py-5">
                    <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>

                {/* El contenido desplegable del select */}
                <SelectContent className="">
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {
                        (categorias ?? []).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    {/* ... otras categorías ... */}
                </SelectContent>
            </Select>

        </div>
    );
}