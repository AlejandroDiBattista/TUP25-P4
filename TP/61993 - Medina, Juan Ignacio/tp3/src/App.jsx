import React, { useEffect, useState } from 'react'
import { loadAlumnos } from './services/alumnos'

function norm(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function App() {
  const [alumnos, setAlumnos] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAlumnos()
      .then(data => setAlumnos(data))
      .catch(e => setError(e.message))
  }, [])

  function toggleFavorito(id) {
    setAlumnos(prev =>
      prev.map(a => (a.id === id ? { ...a, favorito: !a.favorito } : a))
    )
  }

  if (error) return <div>Error: {error}</div>

  const alumnosFiltrados = alumnos.filter(a =>
    norm(a.nombre).includes(norm(query)) ||
    norm(a.telefono).includes(norm(query)) ||
    norm(a.legajo).includes(norm(query))
  )

  const favoritos = alumnosFiltrados
    .filter(a => a.favorito)
    .sort((a, b) => norm(a.nombre).localeCompare(norm(b.nombre)))

  const noFavoritos = alumnosFiltrados
    .filter(a => !a.favorito)
    .sort((a, b) => norm(a.nombre).localeCompare(norm(b.nombre)))

  function renderAvatar(a) {
    if (a.github) {
      return (
        <img
          src={`https://github.com/${a.github}.png?size=100`}
          alt={a.github}
          style={{ width: '50px', borderRadius: '50%', marginRight: '10px' }}
        />
      )
    } else {
      return (
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
            fontWeight: 'bold',
          }}
        >
          {a.nombre
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()}
        </div>
      )
    }
  }

  function renderCard(a) {
    return (
      <div
        key={a.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          borderBottom: '1px solid #ddd',
        }}
      >
        {renderAvatar(a)}
        <div style={{ flex: 1 }}>
          <div>{a.nombre}</div>
          <div>{a.telefono}</div>
          <div>{a.legajo}</div>
        </div>
        <button
          onClick={() => toggleFavorito(a.id)}
          style={{
            fontSize: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {a.favorito ? '⭐' : '☆'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Directorio de Alumnos</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          marginBottom: '20px',
          padding: '8px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />

      {favoritos.map(renderCard)}
      {noFavoritos.map(renderCard)}

      {alumnosFiltrados.length === 0 && <div>No hay resultados</div>}
    </div>
  )
}

export default App
