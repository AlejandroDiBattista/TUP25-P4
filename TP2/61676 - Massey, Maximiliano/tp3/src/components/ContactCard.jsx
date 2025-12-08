import React from 'react';

function ContactCard({ alumno, onToggleFavorito }) {
  const getIniciales = (nombre) => {
    return nombre
      .split(' ')
      .map(parte => parte[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="contact-card">
      <div className="contact-header">
        <div className="contact-avatar">
          {alumno.github ? (
            <img
              src={`https://github.com/${alumno.github}.png?size=100`}
              alt={`Avatar de ${alumno.nombre}`}
              className="avatar-img"
              onError={(e) => {
                e.target.style.display = 'none';
                const initialsDiv = e.target.parentElement.querySelector('.avatar-initials');
                if (initialsDiv) {
                  initialsDiv.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div 
            className="avatar-initials" 
            style={{ display: alumno.github ? 'none' : 'flex' }}
          >
            {getIniciales(alumno.nombre)}
          </div>
        </div>
        
        <div className="contact-info">
          <div className="contact-name">{alumno.nombre}</div>
        </div>
      </div>
      
      <div className="contact-details">
        <div className="contact-detail">
          <strong>📱 Teléfono:</strong> {alumno.telefono}
        </div>
        <div className="contact-detail">
          <strong>🎓 Legajo:</strong> {alumno.legajo}
        </div>
        {alumno.github && (
          <div className="contact-detail">
            <strong>💻 GitHub:</strong> @{alumno.github}
          </div>
        )}
      </div>
      
      <button
        className={`favorite-btn ${alumno.favorito ? 'is-favorite' : ''}`}
        onClick={() => onToggleFavorito(alumno.legajo)}
        title={alumno.favorito ? 'Remover de favoritos' : 'Agregar a favoritos'}
      >
        {alumno.favorito ? '★' : '☆'}
      </button>
    </div>
  );
}

export default ContactCard;