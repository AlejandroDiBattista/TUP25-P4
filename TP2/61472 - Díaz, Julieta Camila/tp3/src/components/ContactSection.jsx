import React from 'react';
import ContactCard from './ContactCard';

const ContactSection = ({ title, contacts, onToggleFavorite }) => {
    if (contacts.length === 0) return null;

    // Ajustamos el título según si son favoritos o contactos generales
    const displayTitle = `${title} (${contacts.length})`;

    return (
        <section className="contact-section">
            <h2>{displayTitle}</h2>
            <div className="contact-list">
                {contacts.map(alumno => (
                    <ContactCard 
                        key={alumno.id} 
                        alumno={alumno} 
                        onToggleFavorite={onToggleFavorite} 
                    />
                ))}
            </div>
        </section>
    );
};

export default ContactSection;