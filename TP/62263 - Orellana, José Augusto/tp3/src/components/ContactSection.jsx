import React from 'react';
import ContactCard from './ContactCard';

function ContactSection({ title, contacts, onToggleFavorito }) {
    if (contacts.length === 0) return null;

    return (
        <section style={styles.section}>
            <h2 style={styles.title}>
                {title} <span style={styles.count}>({contacts.length})</span>
            </h2>
            <div style={styles.grid}>
                {contacts.map((alumno) => (
                    <ContactCard
                        key={alumno.id}
                        alumno={alumno}
                        onToggleFavorito={onToggleFavorito}
                    />
                ))}
            </div>
        </section>
    );
}

const styles = {
    section: {
        marginBottom: '2rem',
    },
    title: {
        margin: '0 0 1rem',
    },
    count: {
        fontWeight: 'normal',
        color: '#666',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(366px, 1fr))',
        gap: '1rem',
    },
};

export default ContactSection;