import ContactCard from './ContactCard.jsx'

export default function ContactSection({ title, contactos, toggleFavorito }) {
  if (!contactos.length) return null
  return (
    <section>
      <h2>{title}</h2>
      {contactos.map(a => (
        <ContactCard key={a.id} alumno={a} toggleFavorito={toggleFavorito} />
      ))}
    </section>
  )
}
