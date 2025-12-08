export default function Topbar({ query, setQuery }) {
  return (
    <header className="topbar">
      <h1>Directorio de Alumnos</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </header>
  );
}
