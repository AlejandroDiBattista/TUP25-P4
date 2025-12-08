'use strict';
// Utilidades
const normalize = (s) =>
	(s ?? '')
		.toString()
		.normalize('NFD')
		.replace(/\p{Diacritic}+/gu, '')
		.toLowerCase()
		.trim();

// SVG inline (sin dependencias externas)
const ICONOS = {
	phone:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.11 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.59 2.61a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.47-1.16a2 2 0 0 1 2.11-.45c.84.27 1.71.47 2.61.59A2 2 0 0 1 22 16.92z"></path></svg>',
	mail:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path><path d="m22 6-10 7L2 6"></path></svg>',
	pencil:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
	trash:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>',
};

// Modelo
class Contacto {
	constructor({ id, nombre, apellido, telefono = '', email = '' }) {
		this.id = id;
		this.nombre = nombre;
		this.apellido = apellido;
		this.telefono = telefono;
		this.email = email;
	}

	get nombreCompleto() {
		return `${this.nombre} ${this.apellido}`.trim();
	}
}

class Agenda {
	#items = [];
	#nextId = 1;

	constructor(contactos = []) {
		contactos.forEach((c) => this.agregar(c));
	}

	listar(filtro = '') {
		const q = normalize(filtro);
		const arr = !q
			? [...this.#items]
			: this.#items.filter((c) =>
					[c.nombre, c.apellido, c.telefono, c.email]
						.map(normalize)
						.some((t) => t.includes(q))
				);
		// ordenar por apellido y nombre
		return arr.sort((a, b) => {
			const ap = normalize(a.apellido).localeCompare(normalize(b.apellido));
			return ap !== 0 ? ap : normalize(a.nombre).localeCompare(normalize(b.nombre));
		});
	}

	agregar(data) {
		const c = new Contacto({ ...data, id: this.#nextId++ });
		this.#items.push(c);
		return c;
	}

	buscarPorId(id) {
		return this.#items.find((c) => c.id === Number(id));
	}

	actualizar(id, data) {
		const c = this.buscarPorId(id);
		if (!c) return false;
		Object.assign(c, data);
		return true;
	}

	borrar(id) {
		const i = this.#items.findIndex((c) => c.id === Number(id));
		if (i >= 0) this.#items.splice(i, 1);
		return i >= 0;
	}
}

// Datos de ejemplo
const ejemplos = [
	['Hernan', 'Lobo', '3815906461', 'hernan.lobo@mail.com'],
	['Valentina', 'Fernández', '11-5555-9090', 'valen.fernandez@mail.com'],
	['María', 'García', '11-5555-2020', 'maria.garcia@mail.com'],
	['Sofía', 'Gómez', '11-5555-7070', 'sofia.gomez@mail.com'],
	['Ana', 'López', '11-5555-4040', 'ana.lopez@mail.com'],
	['Lucía', 'Martínez', '11-5555-5050', 'lucia.martinez@mail.com'],
	['Juan', 'Pérez', '11-5555-1010', 'juan.perez@mail.com'],
	['Carlos', 'Rodríguez', '11-5555-3030', 'carlos.rodriguez@mail.com'],
	['Mateo', 'Ruiz', '11-5555-6060', 'mateo.ruiz@mail.com'],
	['Camila', 'Sánchez', '11-5555-8081', 'camila.sanchez@mail.com'],
].map(([nombre, apellido, telefono, email]) => ({ nombre, apellido, telefono, email }));

// UI
const $ = (sel) => document.querySelector(sel);

const ui = {
	lista: $('#lista'),
	buscar: $('#txtBuscar'),
	btnAgregar: $('#btnAgregar'),
	dlg: $('#dlgContacto'),
	dlgTitulo: $('#dlgTitulo'),
	frm: $('#frmContacto'),
	inpNombre: $('#inpNombre'),
	inpApellido: $('#inpApellido'),
	inpTelefono: $('#inpTelefono'),
	inpEmail: $('#inpEmail'),
};

const agenda = new Agenda(ejemplos);
let modo = 'alta';
let editId = null;

function render(filtro = '') {
	const datos = agenda.listar(filtro);
	if (datos.length === 0) {
		ui.lista.innerHTML = '<p class="muted">Sin resultados</p>';
		return;
	}

	ui.lista.innerHTML = datos
		.map(
			(c) => `
			<article class="card" data-id="${c.id}">
				<header>${c.nombre} ${c.apellido}</header>
				<div class="body">
					<div class="row"><span class="muted">${ICONOS.phone}</span><span>${c.telefono || ''}</span></div>
					<div class="row"><span class="muted">${ICONOS.mail}</span><span>${c.email || ''}</span></div>
					<div class="actions">
						<button class="icon-btn btn-editar" title="Editar" aria-label="Editar contacto">${ICONOS.pencil}</button>
						<button class="icon-btn btn-borrar" title="Borrar" aria-label="Borrar contacto">${ICONOS.trash}</button>
					</div>
				</div>
			</article>`
		)
		.join('');
}

function abrirDialogo(tipo, contacto) {
	modo = tipo;
	ui.dlgTitulo.textContent = tipo === 'alta' ? 'Agregar contacto' : 'Editar contacto';
	if (tipo === 'edicion' && contacto) {
		editId = contacto.id;
		ui.inpNombre.value = contacto.nombre;
		ui.inpApellido.value = contacto.apellido;
		ui.inpTelefono.value = contacto.telefono ?? '';
		ui.inpEmail.value = contacto.email ?? '';
	} else {
		editId = null;
		ui.frm.reset();
	}
	ui.dlg.showModal();
	ui.inpNombre.focus();
}

function cerrarDialogo() {
	ui.dlg.close();
}

// Eventos
ui.btnAgregar.addEventListener('click', () => abrirDialogo('alta'));
ui.buscar.addEventListener('input', (e) => render(e.target.value));
ui.frm.addEventListener('submit', (e) => {
	e.preventDefault();
	const data = {
		nombre: ui.inpNombre.value.trim(),
		apellido: ui.inpApellido.value.trim(),
		telefono: ui.inpTelefono.value.trim(),
		email: ui.inpEmail.value.trim(),
	};
	if (modo === 'alta') {
		agenda.agregar(data);
	} else if (modo === 'edicion' && editId != null) {
		agenda.actualizar(editId, data);
	}
	cerrarDialogo();
	render(ui.buscar.value);
});

$('#btnCancelar').addEventListener('click', () => {
	cerrarDialogo();
});

// Delegación de eventos para editar/borrar
ui.lista.addEventListener('click', (e) => {
	const card = e.target.closest('.card');
	if (!card) return;
	const id = Number(card.getAttribute('data-id'));

	if (e.target.closest('.btn-editar')) {
		const c = agenda.buscarPorId(id);
		if (c) abrirDialogo('edicion', c);
	}
	if (e.target.closest('.btn-borrar')) {
		agenda.borrar(id);
		render(ui.buscar.value);
	}
});

// Inicio
render();
