export default function ContactCard({ contacto, toggleFavorito }) {
  const avatarUrl = contacto.github
    ? `https://github.com/${contacto.github}.png?size=100`
    : null;

  const initials = contacto.nombre
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="card">
      {avatarUrl ? (
        <img src={avatarUrl} alt="avatar" className="avatar" />
      ) : (
        <div className="avatar placeholder">{initials}</div>
      )}
      <div className="info">
        <strong>{contacto.nombre}</strong>
        <div><b>Tel:</b> {contacto.telefono}</div>
        <div><b>Legajo:</b> {contacto.legajo}</div>
      </div>
      <div
        className="star"
        onClick={() => toggleFavorito(contacto.id)}
        title="Marcar como favorito"
      >
        {contacto.favorito ? '⭐' : '☆'}
      </div>
    </div>
  );
}