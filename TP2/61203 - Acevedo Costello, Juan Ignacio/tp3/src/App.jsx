import React, { useEffect, useState, useMemo } from 'react';
import { loadAlumnos } from './services/alumnos';
import { includesContacto, cmpNombre } from './utils/text';

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadAlumnos()
      .then((data) => {
        if (!mounted) return;
        setAlumnos(data);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  function toggleFavorito(id) {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, favorito: !a.favorito } : a))
    );
  }

  const filtered = useMemo(() => {
    if (!query) return alumnos.slice();
    return alumnos.filter((a) => includesContacto(a, query));
  }, [alumnos, query]);

  const favoritos = useMemo(
    () => filtered.filter((a) => a.favorito).sort(cmpNombre),
    [filtered]
  );
  const noFavoritos = useMemo(
    () => filtered.filter((a) => !a.favorito).sort(cmpNombre),
    [filtered]
  );

  return (
    <div style={{ maxWidth: 900, margin: '1rem auto', padding: '0 1rem' }}>
      {/* Topbar */}
      <header style={styles.header}>
        <h1 style={styles.title}>Alumnos Programación 4</h1>
        <input
          placeholder="Buscar por nombre, teléfono o legajo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
        />
      </header>

      {loading ? (
        <div style={{ padding: '1rem' }}>Cargando alumnos...</div>
      ) : (
        <main>
          {/* Sección Favoritos */}
          <Section
            title={`Favoritos (${favoritos.length})`}
            contacts={favoritos}
            onToggleFavorito={toggleFavorito}
          />

          {/* Sección Contactos */}
          <Section
            title={`Contactos (${noFavoritos.length})`}
            contacts={noFavoritos}
            onToggleFavorito={toggleFavorito}
          />

          {filtered.length === 0 && (
            <div style={{ padding: '1rem', color: '#666' }}>
              No se encontraron alumnos.
            </div>
          )}
        </main>
      )}
    </div>
  );
}

/* ---------------------------
   COMPONENTES LOCALES
----------------------------*/
function Section({ title, contacts, onToggleFavorito }) {
  return (
    <section style={{ margin: '1rem 0' }}>
      <h2 style={{ margin: '0 0 0.5rem 0' }}>{title}</h2>
      {contacts.length === 0 ? (
        <div style={{ padding: '1rem', color: '#666' }}>No hay resultados.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {contacts.map((c) => (
            <ContactCard
              key={c.id}
              alumno={c}
              onToggleFavorito={onToggleFavorito}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ContactCard({ alumno, onToggleFavorito }) {
  const { nombre, telefono, legajo, github, favorito } = alumno;

  const initials = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

  return (
    <div style={cardStyles.container}>
      <div style={cardStyles.avatarWrap}>
        {github ? (
          <img
            src={`https://github.com/${github}.png?size=100`}
            alt={github}
            style={cardStyles.avatar}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div style={cardStyles.initials}>{initials}</div>
        )}
      </div>

      <div style={cardStyles.info}>
        <div style={cardStyles.row}>
          <strong>{nombre}</strong>
          <button
            onClick={() => onToggleFavorito(alumno.id)}
            aria-label={favorito ? 'Desmarcar favorito' : 'Marcar favorito'}
            style={{
              ...cardStyles.starBtn,
              color: favorito ? '#f5b301' : '#999',
            }}
          >
            {favorito ? '★' : '☆'}
          </button>
        </div>
        <div style={cardStyles.meta}>
          Tel: {telefono || '-'} • Legajo: {legajo || '-'}
        </div>
        {github && <div style={cardStyles.meta}>GitHub: {github}</div>}
      </div>
    </div>
  );
}

/* ---------------------------
   ESTILOS
----------------------------*/
const styles = {
  header: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #eee',
  },
  title: { margin: 0, fontSize: '1.25rem' },
  input: { flex: 1, padding: '0.5rem', fontSize: '1rem' },
};

const cardStyles = {
  container: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    padding: '0.6rem',
    borderRadius: '8px',
    border: '1px solid #eee',
    background: '#fff',
  },
  avatarWrap: { minWidth: 56, minHeight: 56 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  initials: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f0f0',
    fontWeight: '700',
  },
  info: { flex: 1 },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: { color: '#666', fontSize: '0.9rem' },
  starBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
};
