import React from 'react';
import ContactCard from './Card.jsx';


export default function Favoritos({ title, contacts, onToggleFavorito }) {
return (
<section className="mb-6">
<h2 className="mb-2 font-bold">{title} ({contacts.length})</h2>
{contacts.length === 0 ? (
<div className="text-sm text-gray-600">No hay resultados en esta sección.</div>
) : (
<div className="grid gap-2">
{contacts.map(c => (
<ContactCard key={c.id} alumno={c} onToggleFavorito={onToggleFavorito} />
))}
</div>
)}
</section>
);
}