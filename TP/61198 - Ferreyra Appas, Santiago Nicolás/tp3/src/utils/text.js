export function norm(str = '') {
	return String(str)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

export function cmpNombre(a, b) {
	const na = norm(a.nombre || a);
	const nb = norm(b.nombre || b);
	if (na < nb) return -1;
	if (na > nb) return 1;
	return 0;
}

export function includesContacto(contacto, texto) {
	const q = norm(texto);
	if (!q) return true;
	const nombre = norm(contacto.nombre || '');
	const telefono = String(contacto.telefono || '');
	const legajo = String(contacto.legajo || '');
	return (
		nombre.includes(q) ||
		telefono.includes(q) ||
		legajo.includes(q) ||
		norm(contacto.legajo || '').includes(q)
	);
}
