import React from 'react';
import ContactCard from './ContactCard';

function ContactSection({ titulo, alumnos, onToggleFavorito, esFavoritos }) {
  if (!alumnos || alumnos.length === 0) {
    return null;
  }

  return (
    <div className="contact-section">
      {titulo && <h2 className="section-title">{titulo}</h2>}
      <div className="contacts-grid">
        {alumnos.map(alumno => (
          <ContactCard
            key={alumno.legajo}
            alumno={alumno}
            onToggleFavorito={onToggleFavorito}
          />
        ))}
      </div>
    </div>
  );
}

export default ContactSection;