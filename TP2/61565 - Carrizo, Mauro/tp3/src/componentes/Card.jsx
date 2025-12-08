import React from 'react';
import '../stilos/Card.css';

export default function Card({ alumno, onToggleFavorito }) {
const avatarUrl = alumno.github ? `https://github.com/${alumno.github}.png?size=100` : null;


const initials = alumno.nombre
.split(' ')
.filter(Boolean)
.slice(0,2)
.map(n => n[0])
.join('')
.toUpperCase();


return (
<article className="contact-card flex items-center gap-3 p-3 border rounded">
<div className="avatar w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-200">
{avatarUrl ? (
<img src={avatarUrl} alt={`${alumno.nombre} avatar`} />
) : (
<span className="font-bold">{initials}</span>
)}
</div>


<div className="flex-1">
<div className="font-semibold">{alumno.nombre}</div>
<div className="text-sm text-gray-600">Tel: {alumno.telefono} — Legajo: {alumno.legajo}</div>
{alumno.github && (
<div className="text-xs text-gray-500">GitHub: {alumno.github}</div>
)}
</div>


<button
aria-pressed={alumno.favorito}
onClick={() => onToggleFavorito(alumno.id)}
title={alumno.favorito ? 'Quitar favorito' : 'Marcar favorito'}
className="p-2"
>
{alumno.favorito ? '★' : '☆'}
</button>
</article>
);
}