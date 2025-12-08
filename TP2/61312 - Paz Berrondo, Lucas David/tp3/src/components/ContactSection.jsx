import ContactCard from './ContactCard';

function ContactSection({ title, contacts, onToggleFavorito }) {
  if (contacts.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      <h2 style={{
        fontSize: '20px',
        marginBottom: '16px',
        color: '#333',
        borderLeft: '4px solid #007bff',
        paddingLeft: '12px'
      }}>
        {title} ({contacts.length})
      </h2>
      <div>
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