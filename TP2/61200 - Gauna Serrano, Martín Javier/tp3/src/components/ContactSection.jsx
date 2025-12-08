import ContactCard from "./ContactCard";

export default function ContactSection({ title, contacts, toggleFavorito }) {
  return (
    <section>
      <h2>{title}</h2>
      {contacts.length === 0 ? (
        <p>No hay alumnos en esta sección.</p>
      ) : (
        <div className="contact-list">
          {contacts.map((al) => (
            <ContactCard
              key={al.id}
              alumno={al}
              toggleFavorito={toggleFavorito}
            />
          ))}
        </div>
      )}
    </section>
  );
}
