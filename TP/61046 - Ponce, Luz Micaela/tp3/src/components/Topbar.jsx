import React from "react"

function Topbar({search, setSearch}) {
    return (
        <header style={{padding: "1rem", background: "#f5f5f5" }}>
            <h1>Directorio de Alumnos</h1>
            <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    width: "100%",
                    maxWidth: "300px"
                }}
            />
        </header>
    );
}

export default Topbar;