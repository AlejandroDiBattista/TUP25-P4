
import { useState, useEffect } from 'react';
import { loadAlumnos } from './services/alumnos';
import { cmpNombre, includesContacto } from './utils/text';
import './App.css';

// Componente de tarjeta de contacto
function ContactCard({ contact, onToggleFavorite }) {
  const avatarSrc = contact.github
    ? `https://github.com/${contact.github}.png?size=100`
    : null;

  const initials = contact.nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="contact-card">
      <div className="contact-avatar">
        {avatarSrc ? (
          <img src={avatarSrc} alt={contact.nombre} />
        ) : (
          <div className="avatar-initials">{initials}</div>
        )}
      </div>
      <div className="contact-info">
        <h3>{contact.nombre}</h3>
        <p>Tel: {contact.telefono}</p>
        <p>Legajo: {contact.legajo}</p>
      </div>
      <button
        className={`favorite-button ${contact.favorito ? 'active' : ''}`}
        onClick={() => onToggleFavorite(contact.id)}
      >
        ★
      </button>
    </div>
  );
}

// Componente de sección de contactos
function ContactSection({ title, contacts, onToggleFavorite }) {
  if (contacts.length === 0) return null;

  return (
    <section className="contact-section">
      <h2>{title} ({contacts.length})</h2>
      <div className="contact-grid">
        {contacts.map(contact => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}

// Componente de barra superior
function Topbar({ search, onSearchChange }) {
  return (
    <header className="topbar">
      <h1>Alumnos Programación 4</h1>
      <input
        type="search"
        placeholder="Buscar por nombre, teléfono o legajo"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
      />
    </header>
  );
}

// Componente principal
function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await loadAlumnos();
        setAlumnos(data || []);
      } catch (error) {
        console.error('Error al cargar alumnos:', error);
        setAlumnos([]);
      }
    })();
  }, []);

  const toggleFavorite = (id) => {
    setAlumnos(prev => prev.map(alumno =>
      alumno.id === id
        ? { ...alumno, favorito: !alumno.favorito }
        : alumno
    ));
  };

  const filteredAlumnos = alumnos.filter(alumno =>
    includesContacto(alumno, search)
  );

  const favoritos = filteredAlumnos
    .filter(alumno => alumno.favorito)
    .sort(cmpNombre);

  const noFavoritos = filteredAlumnos
    .filter(alumno => !alumno.favorito)
    .sort(cmpNombre);

  return (
    <div className="app">
      <Topbar search={search} onSearchChange={setSearch} />
      <main>
        {filteredAlumnos.length === 0 ? (
          <p className="empty-message">No se encontraron resultados</p>
        ) : (
          <>
            <ContactSection
              title="Favoritos"
              contacts={favoritos}
              onToggleFavorite={toggleFavorite}
            />
            <ContactSection
              title="Contactos"
              contacts={noFavoritos}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
