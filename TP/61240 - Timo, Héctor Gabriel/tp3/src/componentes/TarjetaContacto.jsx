import React from 'react';
import "../styles/TarjetaContacto.css";

const TarjetaContacto = ({ contacto, onAlternarFavorito }) => {
  const { nombre, telefono, legajo, github, favorito } = contacto;

  const obtenerUrlAvatar = () => {
    if (github) {
      return `https://github.com/${github}.png?size=100`;
    }
    return '';
  };

  const obtenerIniciales = () => {
    const partes = nombre.split(' ');
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`tarjeta-contacto ${favorito ? 'favorito' : ''}`}>
      <div className="avatar">
        {github ? (
          <img src={obtenerUrlAvatar()} alt={`Avatar de ${nombre}`} />
        ) : (
          <div className="contenedor-iniciales">{obtenerIniciales()}</div>
        )}
      </div>
      <div className="info">
        <h3>{nombre}</h3>
        <p>Tel: {telefono}</p>
        <p>Legajo: {legajo}</p>
      </div>
      <div className="boton-favorito" onClick={() => onAlternarFavorito(legajo)}>
        <span role="img" aria-label="favorito">
          {favorito ? '⭐' : '☆'}
        </span>
      </div>
    </div>
  );
};

export default TarjetaContacto;