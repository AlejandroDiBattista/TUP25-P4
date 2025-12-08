'use strict';

// Utilidades de normalización para búsqueda insensible a mayúsculas y acentos
function norm(s) {
	return (s ?? '')
		.toString()
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

class Contacto {
	constructor({ id = null, nombre = '', apellido = '', telefono = '', email = '' } = {}) {
		this.id = id;
		this.nombre = nombre;
		this.apellido = apellido;
		this.telefono = telefono;
		this.email = email;
	}
}

class Agenda {
	constructor(contactos = []) {
		this.items = contactos.map(c => new Contacto(c));
		this.nextId = this.items.reduce((m, c) => Math.max(m, Number(c.id) || 0), 0) + 1;
	}

	ordenar(arr) {
		return [...arr].sort((a, b) => {
			const ap = norm(a.apellido).localeCompare(norm(b.apellido));
			if (ap !== 0) return ap;
			return norm(a.nombre).localeCompare(norm(b.nombre));
		});
	}

	listar() {
		return this.ordenar(this.items);
	}

	agregar(datos) {
		const c = datos instanceof Contacto ? datos : new Contacto(datos);
		c.id = this.nextId++;
		this.items.push(c);
		return c;
	}

	actualizar(id, cambios) {
		const c = this.items.find(x => x.id === id);
		if (!c) return false;
		for (const k of ['nombre', 'apellido', 'telefono', 'email']) {
			if (k in cambios) c[k] = cambios[k];
		}
		return true;
	}

	borrar(id) {
		const i = this.items.findIndex(x => x.id === id);
		if (i < 0) return false;
		this.items.splice(i, 1);
		return true;
	}

	buscar(texto) {
		const t = norm(texto);
		if (!t) return this.listar();
		return this.ordenar(
			this.items.filter(c =>
				[c.nombre, c.apellido, c.telefono, c.email].some(v => norm(v).includes(t))
			)
		);
	}
}

// Datos de ejemplo (10 contactos)
const ejemplos = [
	{ nombre: 'Juan', apellido: 'Pérez', telefono: '3815551234', email: 'jperez@gmail.com' },
	{ nombre: 'José', apellido: 'Gómez', telefono: '3815551235', email: 'jgomez@gmail.com' },
	{ nombre: 'Pedro', apellido: 'Sánchez', telefono: '3815551236', email: 'psanchez@gmail.com' },
	{ nombre: 'Ana', apellido: 'Martínez', telefono: '3815552234', email: 'amartinez@gmail.com' },
	{ nombre: 'Luis', apellido: 'Rodríguez', telefono: '3815553234', email: 'lrodriguez@gmail.com' },
	{ nombre: 'María', apellido: 'López', telefono: '3815554234', email: 'mlopez@gmail.com' },
	{ nombre: 'Carlos', apellido: 'Fernández', telefono: '3815555234', email: 'cfernandez@gmail.com' },
	{ nombre: 'Laura', apellido: 'García', telefono: '3815556234', email: 'lgarcia@gmail.com' },
	{ nombre: 'Sofia', apellido: 'Díaz', telefono: '3815557234', email: 'sdiaz@gmail.com' },
	{ nombre: 'Diego', apellido: 'Ramírez', telefono: '3815558234', email: 'dramirez@gmail.com' },
];

// Estado de la app
const agenda = new Agenda(ejemplos);

// Referencias del DOM
const q = sel => document.querySelector(sel);
const cards = q('#cards');
const buscarInp = q('#buscar');
const btnAgregar = q('#btnAgregar');
const dlg = q('#dlgContacto');
const frm = q('#frmContacto');
const dlgTitle = q('#dlgTitle');
const fId = q('#id');
const fNombre = q('#nombre');
const fApellido = q('#apellido');
const fTelefono = q('#telefono');
const fEmail = q('#email');

// Iconos SVG inline (sin dependencias)
const svg = {
	edit: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/></svg>',
	trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 7h12m-9-3h6a1 1 0 0 1 1 1v2H6V5a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 7v11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7" stroke="currentColor" stroke-width="1.8"/></svg>',
	phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.31 1.79.57 2.65a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.43-1.11a2 2 0 0 1 2.11-.45c.86.26 1.75.45 2.65.57A2 2 0 0 1 22 16.92z" fill="currentColor"/></svg>',
	mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.5"/><path d="m22 6-10 7L2 6" stroke="currentColor" stroke-width="1.5"/></svg>',
};

function fieldRow(icon, text) {
	if (!text) return '';
	return `<div class="contact-field">${icon}<span>${text}</span></div>`;
}

function cardTemplate(c) {
	return `
		<article class="contact-card" data-id="${c.id}">
			<header class="contact-card__header">
				<div class="name">
					<div class="fullname">${c.nombre} ${c.apellido}</div>
				</div>
			</header>
			<div class="contact-card__body">
				${fieldRow(svg.phone, c.telefono)}
				${fieldRow(svg.mail, c.email)}
				<nav class="contact-actions">
					<button class="icon-btn editar" title="Editar" aria-label="Editar" data-id="${c.id}">${svg.edit}</button>
					<button class="icon-btn borrar" title="Borrar" aria-label="Borrar" data-id="${c.id}">${svg.trash}</button>
				</nav>
			</div>
		</article>
	`;
}

function render(lista) {
	const datos = lista ?? agenda.listar();
	if (!datos.length) {
		cards.innerHTML = '<p>No hay contactos.</p>';
		return;
	}
	cards.innerHTML = datos.map(cardTemplate).join('');
}

function abrirDialogo(modo, contacto = null) {
	if (modo === 'editar' && contacto) {
	dlgTitle.textContent = 'Editar contacto';
		fId.value = contacto.id;
		fNombre.value = contacto.nombre;
		fApellido.value = contacto.apellido;
		fTelefono.value = contacto.telefono || '';
		fEmail.value = contacto.email || '';
	} else {
	dlgTitle.textContent = 'Agregar contacto';
		fId.value = '';
		frm.reset();
	}
	dlg.showModal();
}

function cerrarDialogo() {
	dlg.close();
}

// Eventos
buscarInp.addEventListener('input', () => {
	const texto = buscarInp.value;
	render(agenda.buscar(texto));
});

btnAgregar.addEventListener('click', () => abrirDialogo('agregar'));

cards.addEventListener('click', (ev) => {
	const btn = ev.target.closest('button');
	if (!btn) return;
	const id = Number(btn.dataset.id);
	if (btn.classList.contains('editar')) {
		const c = agenda.items.find(x => x.id === id);
		if (c) abrirDialogo('editar', c);
	} else if (btn.classList.contains('borrar')) {
		// Borrado directo sin confirmación
		agenda.borrar(id);
		render();
	}
});

frm.addEventListener('submit', (ev) => {
	ev.preventDefault();
	const id = Number(fId.value);
	const payload = {
		nombre: fNombre.value.trim(),
		apellido: fApellido.value.trim(),
		telefono: fTelefono.value.trim(),
		email: fEmail.value.trim(),
	};
	if (id) {
		agenda.actualizar(id, payload);
	} else {
		agenda.agregar(payload);
	}
	cerrarDialogo();
	render();
});

q('#btnCancelar').addEventListener('click', () => {
	cerrarDialogo();
});

// Inicio
render();
