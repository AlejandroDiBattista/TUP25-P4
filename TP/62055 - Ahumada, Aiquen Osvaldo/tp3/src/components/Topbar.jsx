
import React from "react"

function Topbar({ search, setSearch }) {
  return (
    <header style={{ padding: "1rem", background: "#eee" }}>
      <h1>Directorio de Alumnos</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginTop: "0.5rem", width: "100%", padding: "0.5rem" }}
      />
    </header>
  )
}

export default Topbar
