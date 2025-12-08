import React, { useState, useMemo } from 'react';
import { loadAlumnos } from './services/alumnos';
import { cmpNombre, includesContacto } from './utils/text';

const alumnosInit = loadAlumnos();

export default function App() {
  const [search, setSearch] = useState('');
  const [alumnos, setAlumnos] = useState(alumnosInit);

  const filtrados = useMemo(() => {
    if (!search) return alumnos;
    return alumnos.filter(a => includesContacto(a, search));
  }, [alumnos, search]);

  const favoritos = useMemo(
    () => filtrados.filter(a => a.favorito).sort(cmpNombre),
    [filtrados]
  );
  const otros = useMemo(
    () => filtrados.filter(a => !a.favorito).sort(cmpNombre),
    [filtrados]
  );

  function toggleFav(id) {
    setAlumnos(alumnos =>
      alumnos.map(a =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    );
  }

  function renderAlumno(alumno) {
    const avatar = alumno.github
      ? `https://github.com/${alumno.github}.png?size=100`
      : null;
    const iniciales = alumno.nombre
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase();

    return (
      <div key={alumno.id} className="contact-card">
        <div className="avatar">
          {avatar ? (
            <img src={avatar} alt={alumno.nombre} />
          ) : (
            <span className="avatar-text">{iniciales}</span>
          )}
        </div>
        <div className="info">
          <strong>{alumno.nombre}</strong>
          <div>Tel: {alumno.telefono}</div>
          <div>Legajo: {alumno.legajo}</div>
          {alumno.github && (
            <div>
              GitHub: <a href={`https://github.com/${alumno.github}`} target="_blank" rel="noopener noreferrer">{alumno.github}</a>
            </div>
          )}
        </div>
        <button
          className={alumno.favorito ? 'fav active' : 'fav'}
          onClick={() => toggleFav(alumno.id)}
          title={alumno.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
        >
          ★
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="topbar">
        <h1>Alumnos Programación 4</h1>
        <input
          type="search"
          placeholder="Buscar por nombre, teléfono o legajo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </header>
      {filtrados.length === 0 ? (
        <div className="empty">No se encontraron alumnos.</div>
      ) : (
        <>
          {favoritos.length > 0 && (
            <section>
              <h2>Favoritos ({favoritos.length})</h2>
              <div className="contact-list">
                {favoritos.map(renderAlumno)}
              </div>
            </section>
          )}
          {otros.length > 0 && (
            <section>
              <h2>Contactos ({otros.length})</h2>
              <div className="contact-list">
                {otros.map(renderAlumno)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
