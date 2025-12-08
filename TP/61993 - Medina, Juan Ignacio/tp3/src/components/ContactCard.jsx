export default function ContactCard({ alumno, toggleFavorito }) {
  const avatar = alumno.github
    ? `https://github.com/${alumno.github}.png?size=100`
    : alumno.nombre
        .split(' ')
        .map(n => n[0])
        .join('')

  return (
    <div>
      <img src={alumno.github ? avatar : undefined} alt={alumno.nombre} width={50} height={50} />
      {!alumno.github && <span>{avatar}</span>}
      <div>{alumno.nombre}</div>
      <div>{alumno.telefono}</div>
      <div>{alumno.legajo}</div>
      <button onClick={() => toggleFavorito(alumno.id)}>
        {alumno.favorito ? '★' : '☆'}
      </button>
    </div>
  )
}
