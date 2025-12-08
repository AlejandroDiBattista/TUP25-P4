import React, { useState, useEffect, useMemo } from 'react';
import { loadAlumnos } from './services/alumnos';
import { includesContacto, cmpNombre } from './utils/text';
import Topbar from './components/Topbar';
import ContactSection from './components/ContactSection';
import './App.css'; 

function App() {
    const [alumnos, setAlumnos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    
    useEffect(() => {
        setAlumnos(loadAlumnos());
    }, []);

    
    const toggleFavorito = (legajo) => {
        setAlumnos(prevAlumnos =>
            prevAlumnos.map(alumno =>
                alumno.legajo === legajo
                    ? { ...alumno, favorito: !alumno.favorito }
                    : alumno
            )
        );
    };

   
    const { favoritos, noFavoritos } = useMemo(() => {
        
        
        const filteredAlumnos = alumnos.filter(alumno =>
            includesContacto(alumno, searchTerm)
        );

       
        const favs = filteredAlumnos
            .filter(a => a.favorito)
            .sort(cmpNombre);

        const nonFavs = filteredAlumnos
            .filter(a => !a.favorito)
            .sort(cmpNombre);

        return { favoritos: favs, noFavoritos: nonFavs };
    }, [alumnos, searchTerm]); 

    const totalResults = favoritos.length + noFavoritos.length;
    const isListEmpty = totalResults === 0 && searchTerm !== '';

    return (
        <div className="app-container">
            <Topbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            <main className="main-content">
                {isListEmpty ? (
                    <p className="empty-message">
                        No se encontraron alumnos para la búsqueda: **"{searchTerm}"**.
                    </p>
                ) : (
                    <>
                        {}
                        <ContactSection
                            title="Favoritos"
                            contacts={favoritos}
                            onToggleFavorite={toggleFavorito}
                        />

                        {}

                        {}
                        <ContactSection
                            title="Contactos"
                            contacts={noFavoritos}
                            onToggleFavorite={toggleFavorito}
                        />
                    </>
                )}
            </main>
        </div>
    );
}

export default App;