import React from 'react';

function ContactCard({ alumno, onToggleFavorito }) {
  return (
    <li>
      <div>
        <h3>{alumno.nombre}</h3>
        <p>Tel: {alumno.telefono}</p>
        <p>Legajo: {alumno.legajo}</p>
        {alumno.github && (
          <img
            src={`https://github.com/${alumno.github}.png?size=100`}
            alt={alumno.nombre}
            style={{ width: "50px", borderRadius: "50%" }}
          />
        )}
        <button onClick={() => onToggleFavorito(alumno.id)}>
          {alumno.favorito ? "Quitar de Favoritos" : "Agregar a Favoritos"}
        </button>
      </div>
    </li>
  );
}

export default ContactCard;