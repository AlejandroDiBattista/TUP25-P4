"use client";

import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface Props {
    Buscar: (texto: string, categoria: string) => void;
}

export default function BusquedaBar({ Buscar }: Props) {
    const [busqueda, setBusqueda] = useState("")
    const [categoria, setCategoria] = useState("todas")

    useEffect(() => {
        const delay = setTimeout(() => {
            const categoriaFinal = categoria === "todas" ? "" : categoria
            Buscar(busqueda, categoriaFinal)
        }, 200)

        return () => clearTimeout(delay)
    }, [busqueda, categoria, Buscar])

    return (
        <div className="flex flex-col sm:flex-row gap-3">
        <Input
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="sm:w-3/4"
        />
        <Select value={categoria} onValueChange={setCategoria}>
        <SelectTrigger className="sm:w-1/4">
            <SelectValue placeholder="Todas las categorías" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            <SelectItem value="ropa de hombre">Ropa de Hombre</SelectItem>
            <SelectItem value="ropa de mujer">Ropa de Mujer</SelectItem>
            <SelectItem value="joyeria">Joyería</SelectItem>
            <SelectItem value="electronica">Electrónica</SelectItem>
        </SelectContent>
        </Select>
        </div>
    )
}

