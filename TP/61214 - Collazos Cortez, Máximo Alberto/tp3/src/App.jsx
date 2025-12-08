import React, { useEffect, useState } from 'react';
import { loadAlumnos } from './services/alumnos';
import { norm, cmpNombre, includesContacto } from './utils/text';

function Topbar({ search, setSearch }) {
  return (
    <header>
      <h1>Alumnos Programación 4</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </header>
  );
}

function ContactCard({ alumno, onFav }) {
  const avatar = alumno.github
    ? <img className="avatar" src={`https://github.com/${alumno.github}.png?size=100`} alt={alumno.nombre} />
    : <div className="avatar">{alumno.nombre.split(' ').map(x => x[0]).join('').toUpperCase()}</div>;
  return (
    <div className="contact-card">
      {avatar}
      <div className="contact-info">
        <div className="contact-name">{alumno.nombre}</div>
        <div>
          <span className="contact-label">Tel:</span>{' '}
          <span className="contact-value">{alumno.telefono}</span>
        </div>
        <div>
          <span className="contact-label">Legajo:</span>{' '}
          <span className="contact-value">{alumno.legajo}</span>
        </div>
      </div>
      <button
        className={`fav-btn${alumno.favorito ? ' fav' : ''}`}
        onClick={onFav}
        title={alumno.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        ★
      </button>
    </div>
  );
}

function ContactSection({ title, contacts, onFav }) {
  if (!contacts.length) return null;
  return (
    <section>
      <h2>{title} <span style={{ color: '#888', fontSize: 16 }}>({contacts.length})</span></h2>
      <div className="contact-list">
        {contacts.map(alumno =>
          <ContactCard key={alumno.id} alumno={alumno} onFav={() => onFav(alumno.id)} />
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAlumnos().then(setAlumnos);
  }, []);

  const filtrar = a => includesContacto(a, search);
  const favoritos = alumnos.filter(a => a.favorito && filtrar(a)).sort(cmpNombre);
  const otros = alumnos.filter(a => !a.favorito && filtrar(a)).sort(cmpNombre);

  const toggleFav = id => setAlumnos(alumnos =>
    alumnos.map(a => a.id === id ? { ...a, favorito: !a.favorito } : a)
  );

  return (
    <div>
      <Topbar search={search} setSearch={setSearch} />
      {favoritos.length === 0 && otros.length === 0
        ? <div className="empty-msg">No hay resultados.</div>
        : <>
            <ContactSection title="Favoritos" contacts={favoritos} onFav={toggleFav} />
            <ContactSection title="Contactos" contacts={otros} onFav={toggleFav} />
          </>
      }
    </div>
  );
}