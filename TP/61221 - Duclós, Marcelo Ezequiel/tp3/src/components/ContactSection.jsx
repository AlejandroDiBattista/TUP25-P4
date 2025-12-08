import React from 'react';
import ContactCard from './ContactCard';

/**
 * Componente ContactSection - Sección que agrupa contactos con un título
 */

/**
 * Sección que muestra un grupo de contactos con un título
 * Se usa para separar favoritos de no favoritos
 * @param {Object} props - Las propiedades del componente
 * @param {string} props.title - El título de la sección (ej: "Favoritos", "Otros")
 * @param {Array} props.contacts - Array de objetos alumno para mostrar en esta sección
 * @param {Function} props.onToggleFavorito - Función que se ejecuta al cambiar el estado de favorito
 * @returns {JSX.Element} El componente ContactSection renderizado
 */
function ContactSection({ title, contacts, onToggleFavorito }) {
  // Si no hay contactos en esta sección, no renderizamos nada
  if (!contacts || contacts.length === 0) {
    return null;
  }

  return (
    <div className="contact-section">
      {/* Título de la sección */}
      <h2 className="contact-section__title">{title}</h2>
      
      {/* Lista de contactos */}
      <div className="contact-section__list">
        {contacts.map(alumno => (
          <ContactCard
            key={alumno.id} // Usamos el ID único como key para React
            alumno={alumno}
            onToggleFavorito={onToggleFavorito}
          />
        ))}
      </div>
    </div>
  );
}

export default ContactSection;