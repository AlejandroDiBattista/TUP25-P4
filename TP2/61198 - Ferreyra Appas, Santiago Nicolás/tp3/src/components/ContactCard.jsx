import React from 'react';

export default function ContactCard({ alumno, onToggleFav }) {
	const { nombre, telefono, legajo, github, favorito } = alumno;

	const avatar = github ? `https://github.com/${github}.png?size=100` : null;

	const initials = nombre
		? nombre
				.split(' ')
				.map((p) => p[0])
				.slice(0, 2)
				.join('')
				.toUpperCase()
		: '';

	return (
		<div className="card" role="article" aria-label={`Alumno ${nombre}`}>
			<div className="avatar" aria-hidden="true">
				{avatar ? (
					<img
						src={avatar}
						alt={`${github} avatar`}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				) : (
					initials
				)}
			</div>

			<div className="info">
				<p className="name">{nombre}</p>
				<div className="sub">📞 {telefono || '-'}</div>
				<div className="sub">📘 Legajo: {legajo || '-'}</div>
				{github ? <div className="sub">🐙 {github}</div> : null}
			</div>

			<div className="actions">
				<button
					title={favorito ? 'Quitar favorito' : 'Marcar favorito'}
					className={`btn-fav ${favorito ? 'active' : ''}`}
					onClick={() => onToggleFav(alumno.id)}
					aria-pressed={favorito}
				>
					{favorito ? '★' : '☆'}
				</button>
			</div>
		</div>
	);
}
