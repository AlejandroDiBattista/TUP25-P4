import React from 'react';
import ContactCard from './ContactCard';

/**
 * Componente para mostrar una sección de contactos con título
 */
function ContactSection({ title, contacts, onToggleFavorito }) {
  if (!contacts || contacts.length === 0) {
    return null;
  }

  return (
    <div className="contact-section">
      <h2 className="section-title">{title}</h2>
      <div className="contacts-grid">
        {contacts.map(contacto => (
          <ContactCard 
            key={contacto.id} 
            contacto={contacto} 
            onToggleFavorito={onToggleFavorito} 
          />
        ))}
      </div>
    </div>
  );
}

export default ContactSection;