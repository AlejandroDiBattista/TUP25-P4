import React from "react";

export default function Navbar({ search, setSearch }) {
  return (
    <header className="Navbar px-6 py-3 shadow-sm flex items-center justify-between bg-white">
      {/* Título */}
      <h1 className="text-lg font-semibold text-gray-800">
        Alumnos Programación 4
      </h1>

      {/* Input de búsqueda */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
        <input
          aria-label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o legajo"
          className="pl-9 pr-3 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ minWidth: 260 }}
        />
      </div>
    </header>
  );
}
