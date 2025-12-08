export default function Topbar({ busqueda, setBusqueda }) {
  return (
    <header>
      <h1>Directorio de Alumnos</h1>
      <input
        type="text"
        placeholder="Buscar..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />
    </header>
  )
}
