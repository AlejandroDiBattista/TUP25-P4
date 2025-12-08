import React from 'react';
import TarjetaContacto from './TarjetaContacto';
import "../styles/SeccionContactos.css";

const SeccionContactos = ({ titulo, contactos, onAlternarFavorito }) => {
  return (
    <section className="seccion-contactos">
      <h2>{titulo}</h2>
      <div className="grilla-contactos">
        {contactos.map(contacto => (
          <TarjetaContacto
            key={contacto.id}
            contacto={contacto}
            onAlternarFavorito={onAlternarFavorito}
          />
        ))}
      </div>
    </section>
  );
};

export default SeccionContactos;