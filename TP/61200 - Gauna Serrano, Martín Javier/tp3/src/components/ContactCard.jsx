export default function ContactCard({ alumno, toggleFavorito }) {
  const avatarUrl = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : null;

  const iniciales = alumno.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="contact-card">
      {avatarUrl ? (
        <img src={avatarUrl} alt={alumno.nombre} className="avatar" />
      ) : (
        <div className="avatar alt">{iniciales}</div>
      )}
      <div className="info">
        <h3>{alumno.nombre}</h3>
        <p>📞 {alumno.telefono}</p>
        <p>🆔 Legajo: {alumno.legajo}</p>
        {alumno.github && <p>🐙 GitHub: {alumno.github}</p>}
      </div>
      <button onClick={() => toggleFavorito(alumno.id)}>
        {alumno.favorito ? "★" : "☆"}
      </button>
    </div>
  );
}
