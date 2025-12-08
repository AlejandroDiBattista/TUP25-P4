// src/App.jsx
import React, { useEffect, useState } from 'react';
import { loadAlumnos } from './services/alumnos';
import { cmpNombre, includesContacto } from './utils/text';
// Componentes integrados en este archivo
import './style.css';

function App() {
  // Topbar
  function Topbar({ query, setQuery }) {
    return (
      <header className="topbar">
        <h1>Alumnos Programación 4</h1>
        <input
          className="search"
          type="search"
          placeholder="Buscar por nombre, teléfono o legajo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>
    );
  }

  // ContactCard
  function ContactCard({ contacto, toggleFavorito }) {
    const { nombre, telefono, legajo, github, favorito } = contacto;
    // Avatar
    function Avatar({ nombre, github }) {
      if (github) {
        const url = `https://github.com/${github}.png?size=100`;
        return (
          <img
            className="avatar"
            src={url}
            alt={`${nombre} avatar`}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        );
      }
      const parts = nombre.split(' ').filter(Boolean);
      const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
      return <div className="avatar initials">{initials.toUpperCase()}</div>;
    }
    return (
      <div className="card">
        <div className="card-header">
          <Avatar nombre={nombre} github={github} />
          <button
            className={`fav-btn ${favorito ? 'fav' : ''}`}
            onClick={() => toggleFavorito(contacto.id)}
          >
            {favorito ? '★' : '☆'}
          </button>
        </div>
        <div className="card-body">
          <h3 className="name">{nombre}</h3>
          <p><strong>Tel:</strong> {telefono || '—'}</p>
          <p><strong>Legajo:</strong> {legajo || '—'}</p>
          {github && <p><strong>GitHub:</strong> {github}</p>}
        </div>
      </div>
    );
  }

  // ContactSection
  function ContactSection({ title, contacts, toggleFavorito }) {
    return (
      <section className="section">
        <h2>{title} ({contacts.length})</h2>
        {contacts.length === 0 ? (
          <p className="empty">No hay resultados.</p>
        ) : (
          <div className="grid">
            {contacts.map(c => (
              <ContactCard key={c.id} contacto={c} toggleFavorito={toggleFavorito} />
            ))}
          </div>
        )}
      </section>
    );
  }
  const [alumnos, setAlumnos] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadAlumnos().then(data => {
      data.sort(cmpNombre);
      setAlumnos(data);
    }).catch(console.error);
  }, []);

  const toggleFavorito = (id) => {
    setAlumnos(prev =>
      prev.map(a => a.id === id ? { ...a, favorito: !a.favorito } : a)
    );
  };

  const filtered = alumnos.filter(a => includesContacto(a, query));
  const favs = filtered.filter(f => f.favorito).sort(cmpNombre);
  const notFavs = filtered.filter(f => !f.favorito).sort(cmpNombre);

  return (
    <div className="app">
      <Topbar query={query} setQuery={setQuery} />
      <main className="container">
        <ContactSection title="Favoritos" contacts={favs} toggleFavorito={toggleFavorito} />
        <ContactSection title="Contactos" contacts={notFavs} toggleFavorito={toggleFavorito} />
      </main>
      <footer className="footer">
        <small>Favoritos no se guardan entre recargas.</small>
      </footer>
    </div>
  );
}

export default App;
