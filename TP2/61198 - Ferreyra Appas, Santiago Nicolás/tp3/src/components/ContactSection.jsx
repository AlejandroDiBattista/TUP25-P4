import React from 'react';
import ContactCard from './ContactCard';

export default function ContactSection({ title, contacts, onToggleFav }) {
	return (
		<section aria-labelledby={title}>
			<div className="section-title" id={title}>
				{title}
			</div>
			{contacts.length === 0 ? (
				<div className="empty">No hay resultados en esta sección.</div>
			) : (
				<div className="grid">
					{contacts.map((c) => (
						<ContactCard key={c.id} alumno={c} onToggleFav={onToggleFav} />
					))}
				</div>
			)}
		</section>
	);
}
