import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { loadAlumnos } from './services/alumnos.js';
import { includesContacto, cmpNombre } from './utils/text.js';

export default function App() {
  const [alumnos, setAlumnos] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('Cargando…');

  useEffect(() => {
    (async () => {
      try {
        const data = await loadAlumnos();
        setAlumnos(data);
        setStatus(`Cargados: ${data.length}`);
      } catch (e) {
        console.error(e);
        setStatus('Error cargando alumnos.vcf');
      }
    })();
  }, []);

  const filtrados = useMemo(
    () => alumnos.filter(a => includesContacto(a, q)),
    [alumnos, q]
  );

  const favoritos = useMemo(
    () => filtrados.filter(a => a.favorito).sort((x, y) => cmpNombre(x.nombre, y.nombre)),
    [filtrados]
  );
  const otros = useMemo(
    () => filtrados.filter(a => !a.favorito).sort((x, y) => cmpNombre(x.nombre, y.nombre)),
    [filtrados]
  );

  const toggleFav = (id) => {
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, favorito: !a.favorito } : a));
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Alumnos Programación 4</h1>
        <div style={{ marginLeft: 'auto', width: 360 }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por nombre, teléfono o legajo"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 999, border: '1px solid #d0d7de' }}
          />
        </div>
      </header>

      <Section title={`Favoritos (${favoritos.length})`}>
        <Grid>
          {favoritos.map(a => <Card key={a.id} alumno={a} onStar={() => toggleFav(a.id)} />)}
          {favoritos.length === 0 && <p style={{ opacity: .6 }}>Sin favoritos por ahora ⭐</p>}
        </Grid>
      </Section>

      <Section title={`Contactos (${otros.length})`}>
        <Grid>
          {otros.map(a => <Card key={a.id} alumno={a} onStar={() => toggleFav(a.id)} />)}
          {otros.length === 0 && <p style={{ opacity: .6 }}>No hay contactos que coincidan con la búsqueda.</p>}
        </Grid>
      </Section>

      <p style={{ opacity: .6, marginTop: 12 }}>{status}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 20, margin: '16px 0' }}>{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: 16
    }}>
      {children}
    </div>
  );
}

function Card({ alumno, onStar }) {
  const { nombre, telefono, legajo, avatar, favorito, github } = alumno;
  const initials = nombre.split(/[ ,]+/).slice(0,2).map(w => w[0] || '').join('').toUpperCase();
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e6e8eb',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
      display: 'flex',
      gap: 12
    }}>
      {avatar ? (
        <img src={avatar} alt={nombre} width="56" height="56" style={{ borderRadius: '50%', border: '3px solid #111' }} />
      ) : (
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          display: 'grid', placeItems: 'center', fontWeight: 700,
          background: '#eef2f6', border: '3px solid #d0d7de'
        }}>{initials}</div>
      )}

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
          <strong style={{ fontSize: 16, lineHeight: 1.2 }}>{nombre}</strong>
          <button
            onClick={onStar}
            title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18
            }}
          >
            {favorito ? '⭐' : '☆'}
          </button>
        </div>

        <div style={{ marginTop: 8, fontSize: 14, color: '#333' }}>
          <div><strong>Tel:</strong> {telefono || '—'}</div>
          <div><strong>Legajo:</strong> {legajo ?? '—'}</div>
          {github && <div><strong>GitHub:</strong> {github}</div>}
        </div>
      </div>
    </div>
  );
}
