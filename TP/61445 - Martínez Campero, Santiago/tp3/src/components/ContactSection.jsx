import React from 'react';
import ContactCard from './ContactCard.jsx';

const ContactSection = ({ titulo, alumnos, onToggleFavorito, esFavoritos = false }) => {
  if (alumnos.length === 0) {
    return null;
  }

  return (
    <section style={{ marginBottom: '30px' }}>
      {titulo && (
        <h2 style={{
          fontSize: '1.4rem',
          color: esFavoritos ? '#f59e0b' : '#333',
          marginBottom: '15px',
          paddingBottom: '8px',
          borderBottom: `2px solid ${esFavoritos ? '#f59e0b' : '#007bff'}`
        }}>
          {titulo} ({alumnos.length})
        </h2>
      )}
      
      <div className="contacts-grid">
        {alumnos.map(alumno => (
          <ContactCard 
            key={alumno.legajo}
            alumno={alumno}
            onToggleFavorito={onToggleFavorito}
          />
        ))}
      </div>
    </section>
  );
};

export default ContactSection;