'use client';
import React from 'react';

interface SearchFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    categories: string[];
    resultCount: number;
}

export default function SearchFilters({
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    resultCount
}: SearchFiltersProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Barra de búsqueda */}
                <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-bold text-gray-900 mb-2">
                        🔍 Buscar productos
                    </label>
                    <input
                        id="search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre o descripción..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold placeholder:text-gray-400"
                    />
                </div>

                {/* Filtro por categoría */}
                <div className="md:w-64">
                    <label htmlFor="category" className="block text-sm font-bold text-gray-900 mb-2">
                        📂 Categoría
                    </label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Contador de resultados y botón limpiar */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-gray-900 font-semibold">
                    {resultCount === 0 ? (
                        <span className="text-red-600 font-bold">❌ No se encontraron productos</span>
                    ) : (
                        <span>
                            ✅ Mostrando <strong>{resultCount}</strong> {resultCount === 1 ? 'producto' : 'productos'}
                        </span>
                    )}
                </p>

                {(searchTerm || selectedCategory) && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-bold"
                    >
                        🔄 Limpiar filtros
                    </button>
                )}
            </div>
        </div>
    );
}
