import React from 'react';
import ContactCard from './ContactCard';

export default function ContactSection({ title, contacts, onToggleFavorito }) {
  return (
    <section style={{margin:'2rem 0'}}>
      <h2 style={{fontSize:'1.3rem',fontWeight:700,marginBottom:'1rem'}}>{title} <span style={{color:'#888',fontSize:'1rem'}}>({contacts.length})</span></h2>
      {contacts.length === 0 ? (
        <div style={{color:'#888',fontStyle:'italic',margin:'2rem 0'}}>No hay resultados para mostrar.</div>
      ) : (
        <div style={{display:'flex',flexWrap:'wrap',gap:'1.5rem'}}>
          {contacts.map(alumno => (
            <ContactCard
              key={alumno.id}
              alumno={alumno}
              onToggleFavorito={() => onToggleFavorito(alumno.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
