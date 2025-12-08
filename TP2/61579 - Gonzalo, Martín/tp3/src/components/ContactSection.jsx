import ContactCard from './ContactCard';

export default function ContactSection({ title, contacts, toggleFavorito }) {
  if (contacts.length === 0) return null;

  return (
    <div className="section">
      <h2>{title} ({contacts.length})</h2>
      <div className="list">
        {contacts.map(contacto => (
          <ContactCard
            key={contacto.id}
            contacto={contacto}
            toggleFavorito={toggleFavorito}
          />
        ))}
      </div>
    </div>
  );
}