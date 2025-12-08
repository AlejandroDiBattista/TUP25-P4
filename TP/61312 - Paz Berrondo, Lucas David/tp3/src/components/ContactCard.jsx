

function ContactCard({ contacto, onToggleFavorito }) {
  // Función para obtener las iniciales del nombre
  const getInitials = (nombre) => {
    return nombre
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Avatar o iniciales */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {contacto.github ? (
          <img 
            src={`https://github.com/${contacto.github}.png?size=100`}
            alt={`Avatar de ${contacto.nombre}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              // Si falla la carga de la imagen, mostrar iniciales
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : (
          <span style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#6c757d'
          }}>
            {getInitials(contacto.nombre)}
          </span>
        )}
        {contacto.github && (
          <span style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#6c757d',
            display: 'none'
          }}>
            {getInitials(contacto.nombre)}
          </span>
        )}
      </div>

      {/* Información del contacto */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          color: '#333'
        }}>
          {contacto.nombre}
        </h3>
        <p style={{
          margin: '0 0 4px 0',
          color: '#666',
          fontSize: '14px'
        }}>
          📞 {contacto.telefono}
        </p>
        <p style={{
          margin: '0 0 4px 0',
          color: '#666',
          fontSize: '14px'
        }}>
          🎓 Legajo: {contacto.legajo}
        </p>
        {contacto.github && (
          <p style={{
            margin: '0',
            color: '#0066cc',
            fontSize: '14px'
          }}>
            💻 GitHub: {contacto.github}
          </p>
        )}
      </div>

      {/* Botón de favorito */}
      <button
        onClick={() => onToggleFavorito(contacto.id)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        title={contacto.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {contacto.favorito ? '⭐' : '☆'}
      </button>
    </div>
  );
}

export default ContactCard;