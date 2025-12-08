import React from 'react';

function getInitials(nombre) {
  return nombre.split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase();
}

export default function ContactCard({ alumno, onToggleFavorito }) {
  const { nombre, telefono, legajo, github, favorito } = alumno;
  const avatar = github
    ? `https://github.com/${github}.png?size=100`
    : null;
  return (
    <div style={{background:'#fff',borderRadius:'1rem',boxShadow:'0 2px 8px #0001',padding:'1rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem',position:'relative',minWidth:'220px',maxWidth:'250px'}}>
      <div style={{position:'absolute',top:'1rem',right:'1rem',cursor:'pointer'}} onClick={onToggleFavorito} title={favorito ? 'Quitar de favoritos' : 'Marcar favorito'}>
        {favorito ? <span style={{color:'#FFD700',fontSize:'1.5rem'}}>★</span> : <span style={{color:'#bbb',fontSize:'1.5rem'}}>☆</span>}
      </div>
      {avatar ? (
        <img src={avatar} alt={github} style={{width:64,height:64,borderRadius:'50%',objectFit:'cover',border:'2px solid #eee'}} />
      ) : (
        <div style={{width:64,height:64,borderRadius:'50%',background:'#eee',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1.5rem',color:'#888'}}>{getInitials(nombre)}</div>
      )}
      <div style={{textAlign:'center'}}>
        <div style={{fontWeight:600,fontSize:'1.1rem'}}>{nombre}</div>
        <div style={{fontSize:'0.95rem',color:'#444'}}>Tel: {telefono}</div>
        <div style={{fontSize:'0.95rem',color:'#444'}}>Legajo: {legajo}</div>
      </div>
    </div>
  );
}
