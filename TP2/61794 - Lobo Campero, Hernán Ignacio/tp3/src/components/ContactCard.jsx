import React from 'react';

/**
 * Componente para mostrar la información de un contacto individual
 */
function ContactCard({ contacto, onToggleFavorito }) {
  const { id, nombre, telefono, legajo, github, favorito } = contacto;

  // Generar iniciales del nombre como fallback
  const initials = nombre
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // URL del avatar de GitHub si está disponible
  const avatarUrl = github ? `https://github.com/${github}.png?size=100` : null;

  return (
    <div className="contact-card">
      <div className="contact-header">
        <div className="contact-avatar">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={`Avatar de ${nombre}`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="avatar-fallback" 
            style={{ display: avatarUrl ? 'none' : 'flex' }}
          >
            {initials}
          </div>
        </div>
        
        <div className="contact-info">
          <h3 className="contact-name">{nombre}</h3>
          <div className="contact-details">
            <p className="contact-phone">📞 {telefono}</p>
            <p className="contact-legajo">🎓 Legajo: {legajo}</p>
            {github && (
              <p className="contact-github">
                🐙 <a 
                  href={`https://github.com/${github}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {github}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
      
      <button 
        className={`favorite-btn ${favorito ? 'favorito' : ''}`}
        onClick={() => onToggleFavorito(id)}
        title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {favorito ? '⭐' : '☆'}
      </button>
    </div>
  );
}

export default ContactCard;