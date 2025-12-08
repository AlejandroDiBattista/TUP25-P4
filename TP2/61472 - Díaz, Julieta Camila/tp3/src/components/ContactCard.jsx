import React from 'react';

const getAvatarUrl = (githubUser) => {
    return githubUser
        ? `https://github.com/${githubUser}.png?size=100`
        : null; 
};

// Genera las iniciales para el placeholder
const getInitials = (nombre) => {
    const parts = nombre.split(',')[0].trim().split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nombre[0].toUpperCase();
}

// Genera un color determinístico basado en el legajo para el placeholder
const getPlaceholderStyle = (legajo) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ff9800', '#ff5722'];
    const index = parseInt(legajo) % colors.length; 
    return { 
        backgroundColor: colors[index], 
        color: '#fff',
    };
};

const ContactCard = ({ alumno, onToggleFavorite }) => {
    const avatarUrl = getAvatarUrl(alumno.github);
    const initials = getInitials(alumno.nombre);
    const placeholderStyle = getPlaceholderStyle(alumno.legajo);

    return (
        <div className="contact-card">
            <div className="avatar-container">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={`${alumno.nombre} avatar`} className="avatar" loading="lazy" />
                ) : (
                    <div className="avatar-placeholder" style={placeholderStyle}>{initials}</div>
                )}
            </div>
            <div className="contact-info">
                <p className="name">{alumno.nombre}</p>
                <p className="detail">Tel: {alumno.telefono}</p>
                <p className="detail">Legajo: {alumno.legajo}</p>
                {alumno.github && <p className="detail github">GitHub: {alumno.github}</p>}
            </div>
            <button
                className={`favorite-btn ${alumno.favorito ? 'favorited' : ''}`}
                onClick={() => onToggleFavorite(alumno.legajo)}
                title={alumno.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
            >
                {alumno.favorito ? '⭐' : '☆'}
            </button>
        </div>
    );
};

export default ContactCard;