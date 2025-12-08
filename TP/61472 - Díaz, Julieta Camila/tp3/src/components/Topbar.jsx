import React from 'react';

const Topbar = ({ searchTerm, onSearchChange }) => {
    return (
        <header className="topbar">
            <h1>Alumnos Programación 4</h1>
            <input
                type="search"
                placeholder="Buscar por nombre, teléfono o legajo"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
            />
        </header>
    );
};

export default Topbar;