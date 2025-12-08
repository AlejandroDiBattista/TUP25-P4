import React from 'react';

function Topbar({ query, setQuery }) {
    return (
        <header style={styles.header}>
            <h1 style={styles.title}>
                Alumnos Programación 4
            </h1>
            <input
                type="text"
                placeholder='Buscar por nombre, teléfono o legajo'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={styles.input}
            />
        </header>
    );
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        marginBottom: '1.5rem',
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
    },
    input: {
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        borderRadius: '20px',
        border: '1px solid #ccc',
        width: '280px',
    },
};

export default Topbar;