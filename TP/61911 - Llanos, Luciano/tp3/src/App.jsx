import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './componentes/Navbar';
import Favoritos from './componentes/Favoritos';
import { loadAlumnos } from './services/alumnos';
import { norm, cmpNombre, includesContacto } from './utils/text';
import alumnosVcf from './alumnos.vcf?raw';


function App() {

const [alumnos, setAlumnos] = useState([]);
const [search, setSearch] = useState('');


useEffect(() => {
(async () => {
const data = await loadAlumnos(alumnosVcf);
setAlumnos(data);
})();
}, []);


function toggleFavoritos(id) {
setAlumnos(prev => prev.map(a => a.id === id ? { ...a, favorito: !a.favorito } : a));
}


const filtered = useMemo(() => {
const term = norm(search);
const match = a => includesContacto(a, term);


const visibles = alumnos.filter(a => match(a));


const favoritos = visibles.filter(a => a.favorito).sort(cmpNombre);
const noFav = visibles.filter(a => !a.favorito).sort(cmpNombre);


return { favoritos, noFav };
}, [alumnos, search]);


const total = filtered.favoritos.length + filtered.noFav.length;


return (
<div className="app container mx-auto p-4">
<Navbar search={search} setSearch={setSearch} />


<main className="mt-4">
{total === 0 ? (
<div className="text-center text-gray-600">No se encontraron alumnos que coincidan con la búsqueda.</div>
) : (
<>
<Favoritos title="Favoritos" contacts={filtered.favoritos} onToggleFavorito={toggleFavoritos} />
<Favoritos title="Otros" contacts={filtered.noFav} onToggleFavorito={toggleFavoritos} />
</>
)}
</main>
</div>
);
}


export default App 
