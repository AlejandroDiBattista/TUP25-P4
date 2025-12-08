import React from 'react';

/**
 * Componente ContactCard - Tarjeta de contacto individual
 */

/**
 * Genera las iniciales de un nombre para usar como avatar alternativo
 * 
 * ¿Cuándo se usa esto?
 * Cuando un alumno no tiene cuenta de GitHub, no podemos mostrar su foto.
 * En su lugar, creamos un círculo con sus iniciales (ej: "Juan Pérez" → "JP")
 * 
 * @param {string} nombre - El nombre completo
 * @returns {string} Las iniciales (primeras letras de nombre y apellido)
 */
function generarIniciales(nombre) {
  // Si no hay nombre, devolvemos ?? como placeholder
  if (!nombre) return '??';
  
  // Ejemplo: "Juan Carlos Pérez" → ["Juan", "Carlos", "Pérez"]
  const palabras = nombre.split(' ');
  
  // Procesamos las palabras paso a paso:
  const iniciales = palabras
    .filter(palabra => palabra.length > 0) // Quitamos espacios vacíos
    .slice(0, 2) // Solo tomamos las primeras 2 palabras (nombre y apellido)
    .map(palabra => palabra[0].toUpperCase()) // Primera letra en mayúscula: ["J", "P"]
    .join(''); // Unimos todo: "JP"
  
  // Si algo salió mal, devolvemos ?? como fallback
  return iniciales || '??';
}

/**
 * Tarjeta individual de contacto que muestra la información de un alumno
 * @param {Object} props - Las propiedades del componente
 * @param {Object} props.alumno - El objeto alumno con {id, nombre, telefono, legajo, github, favorito}
 * @param {Function} props.onToggleFavorito - Función que se ejecuta al hacer clic en favorito
 * @returns {JSX.Element} El componente ContactCard renderizado
 */
function ContactCard({ alumno, onToggleFavorito }) {
  /**
   * Maneja el clic en el botón de favorito
   */
  const handleFavoritoClick = () => {
    onToggleFavorito(alumno.id);
  };

  /**
   * Construye la URL del avatar de GitHub si el usuario tiene cuenta
   * @returns {string} La URL del avatar o una cadena vacía
   */
  const getAvatarUrl = () => {
    if (!alumno.github) return '';
    return `https://github.com/${alumno.github}.png?size=100`;
  };

  /**
   * Maneja el error de carga de la imagen del avatar
   * Oculta la imagen si no se puede cargar
   */
  const handleImageError = (event) => {
    event.target.style.display = 'none';
    // Mostramos el avatar con iniciales
    const inicialesDiv = event.target.nextElementSibling;
    if (inicialesDiv) {
      inicialesDiv.style.display = 'flex';
    }
  };

  return (
    <div className="contact-card">
      {/* Avatar del alumno */}
      <div className="contact-card__avatar">
        {alumno.github ? (
          <>
            {/* Si tiene GitHub, intentamos cargar su avatar */}
            <img
              src={getAvatarUrl()}
              alt={`Avatar de ${alumno.nombre}`}
              className="contact-card__avatar-img"
              onError={handleImageError}
            />
            {/* Avatar alternativo con iniciales (se muestra si la imagen falla) */}
            <div className="contact-card__avatar-iniciales" style={{ display: 'none' }}>
              {generarIniciales(alumno.nombre)}
            </div>
          </>
        ) : (
          // Si no tiene GitHub, mostramos directamente las iniciales
          <div className="contact-card__avatar-iniciales">
            {generarIniciales(alumno.nombre)}
          </div>
        )}
      </div>

      {/* Información del contacto */}
      <div className="contact-card__info">
        <h3 className="contact-card__nombre">{alumno.nombre}</h3>
        <p className="contact-card__telefono">📱 {alumno.telefono}</p>
        <p className="contact-card__legajo">🎓 Legajo: {alumno.legajo}</p>
        {alumno.github && (
          <p className="contact-card__github">
            <a 
              href={`https://github.com/${alumno.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card__github-link"
            >
              💻 @{alumno.github}
            </a>
          </p>
        )}
      </div>

      {/* Botón de favorito */}
      <button
        onClick={handleFavoritoClick}
        className={`contact-card__favorito ${alumno.favorito ? 'contact-card__favorito--activo' : ''}`}
        title={alumno.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {alumno.favorito ? '⭐' : '☆'}
      </button>
    </div>
  );
}

export default ContactCard;