import React from 'react';

export default function Topbar({ value, onChange }) {
  return (
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.5rem 2rem',borderBottom:'1px solid #eee',background:'#fff'}}>
      <h1 style={{fontSize:'2rem',fontWeight:700}}>Alumnos Programación 4</h1>
      <input
        type="search"
        placeholder="Buscar por nombre, teléfono o legajo"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{fontSize:'1rem',padding:'0.5rem 1rem',borderRadius:'2rem',border:'1px solid #ccc',width:'22rem'}}
      />
    </header>
  );
}
