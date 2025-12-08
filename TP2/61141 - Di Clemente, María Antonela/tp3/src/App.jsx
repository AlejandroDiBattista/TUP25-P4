import React,{ useState } from 'react';
import { loadAlumnos } from './services/alumnos';
import { cmpNombre, includesContacto } from './utils/text';
import defaultAvatar from './61141.png';

const initialAlumnos = loadAlumnos();  

function Topbar({ search, setSearch }) {
  return (
    <header
      style={{
        padding: '1rem',
        background: '#da97c7ff',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontWeight: 'bold' }}>Directorio de Alumnos</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar..."
        style={{
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #9e5d95ff',
          width: '200px',
        }}
      />
    </header>
  );
}

function ContactCard({ alumno, toggleFavorito }) {

  const avatar = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : defaultAvatar;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '50px',
        width: '320px',
        boxShadow: '0 1px 3px rgba(228, 39, 152, 0.73)',
      }}
    >
      <img
        src={avatar}
        alt={alumno.nombre}
        style={{ width: '70px', height: '70px', borderRadius: '50%' }}
      />
      <div style={{ flex: 1 }}>
        <h2>{alumno.nombre}</h2>
        <p>{alumno.telefono}</p>
        <p style={{ color: 'gray' }}>Legajo: {alumno.legajo}</p>
      </div>
      <button
        onClick={() => toggleFavorito(alumno.id)}
        style={{
          fontSize: '1.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: alumno.favorito ? 'gold' : 'gray',
        }}
      >
        {alumno.favorito ? '★' : '☆'}
      </button>
    </div>
  );
}

function ContactSection({ title, contacts, toggleFavorito }) {
  if (!contacts.length) return null;

  const isFavoritos = title === "Favoritos";

  return (
    <section style={{ marginTop: '1.5rem' }}>
      <h2 style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>{title}</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:'repeat(3, 1fr)',
          gap: '2rem',
          justifyItems: 'center',
        }}
      >
        {contacts.map((alumno) => (
          <ContactCard
            key={alumno.id}
            alumno={alumno}
            toggleFavorito={toggleFavorito}
          />
        ))}
      </div>
    </section>
  );
}


export default function App() {
  const [search, setSearch] = useState('');
  const [alumnos, setAlumnos] = useState(initialAlumnos);

  const toggleFavorito = (id) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a))
    );
  };

  const filtered = alumnos.filter((a) => includesContacto(a, search));
  const favoritos = filtered.filter((a) => a.favorito).sort(cmpNombre);
  const resto = filtered.filter((a) => !a.favorito).sort(cmpNombre);

  return (
  <div
    style={{
      background: '#f5f5f5',
      minHeight: '100vh',
      fontFamily: "'Arial Rounded MT Bold', 'Helvetica Rounded', Arial, sans-serif",
    }}
  >
      <Topbar search={search} setSearch={setSearch} />
      <main
        style={{
          padding: '1rem',
          maxWidth: '1200px', 
          margin: '0 auto',   
          display: 'block',
          justifyContent: 'center',
    }}
>

        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'gray' }}>No hay resultados</p>
        ) : (
          <>
            <ContactSection
              title="Favoritos"
              contacts={favoritos}
              toggleFavorito={toggleFavorito}
            />
            <ContactSection
              title="Alumnos"
              contacts={resto}
              toggleFavorito={toggleFavorito}
            />
          </>
        )}
      </main>
    </div>
  );
}