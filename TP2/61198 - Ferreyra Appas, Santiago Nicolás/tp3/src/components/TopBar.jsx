import React from 'react';

export default function Topbar({ query, setQuery }) {
	return (
		<div className="topbar" role="search" aria-label="Buscar alumnos">
			<div className="title">Directorio de Alumnos</div>
			<input
				className="search"
				placeholder="Buscar por nombre, teléfono o legajo..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				aria-label="Buscar alumnos"
			/>
		</div>
	);
}
