import React from 'react';

function ContactCard({ alumno, onToggleFavorito }) {
    const { nombre, telefono, legajo, github, favorito} = alumno;

    // Si tiene github usar el avatar sino las iniciales
    const avatarUrl = github
        ? `https://github.com/${github}.png?size=100`
        : null;
    
    const iniciales = nombre
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div style={styles.card}>
            <button
                onClick={() => onToggleFavorito(alumno.id)}
                style={{
                    ...styles.starBtn,
                    color: favorito ? '#f4c542' : '#999',
                }}
            >
                {favorito ? '★' : '☆'}
            </button>

            {avatarUrl ? (
                <img src={avatarUrl} alt={nombre} style={styles.avatar} />
            ) : (
                <div style={styles.avatarFallback}>
                    {iniciales}
                </div>
            )}

            <h3 style={styles.name}>
                {nombre}
            </h3>

            <p style={styles.info}>
                <strong>Tel:</strong> {telefono}
            </p>
            <p style={styles.info}>
                <strong>Legajo:</strong> {legajo}
            </p>
        </div>
    );
}

const styles = {
    card: {
        position: 'relative',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1.5rem 1rem 1rem',
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    },
    starBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
    },
    avatar: {
        borderRadius: '50%',
        width: '70px',
        height: '70px',
        objectFit: 'cover',
        marginBottom: '2rem',
    },
    avatarFallback: {
        borderRadius: '50%',
        width: '70px',
        height: '70px',
        background: '#ccc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        color: '#fff',
        marginBottom: '0.8rem',
    },
    name: {
        margin: '0 0 2rem',
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#222',
    },
    info: {
        margin: '0.2rem 0',
        fontSize: '0.95rem',
        color: '#444',
    },
};

export default ContactCard;