import React, { useEffect, useState } from 'react';
import Topbar from './components/Topbar';
import ContactSection from './components/ContactSection';
import { loadAlumnos } from './services/alumnos';
import { includesContacto, cmpNombre } from './utils/text';

export default function App() {
	const [alumnos, setAlumnos] = useState([]);
	const [query, setQuery] = useState('');

	useEffect(() => {
		async function fetchData() {
			const data = await loadAlumnos();

			data.sort(cmpNombre);
			setAlumnos(data);
		}
		fetchData();
	}, []);

	function toggleFav(id) {
		setAlumnos((prev) =>
			prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a))
		);
	}

	const filtered = alumnos.filter((a) => includesContacto(a, query));

	const favs = filtered.filter((a) => a.favorito).sort(cmpNombre);
	const others = filtered.filter((a) => !a.favorito).sort(cmpNombre);

	const hasAny = favs.length + others.length > 0;

	return (
		<div className="container">
			<Topbar query={query} setQuery={setQuery} />
			{!hasAny ? (
				<div className="empty">No se encontraron alumnos.</div>
			) : (
				<>
					{favs.length > 0 && (
						<ContactSection
							title="Favoritos"
							contacts={favs}
							onToggleFav={toggleFav}
						/>
					)}
					<ContactSection
						title="Alumnos"
						contacts={others}
						onToggleFav={toggleFav}
					/>
				</>
			)}
		</div>
	);
}
