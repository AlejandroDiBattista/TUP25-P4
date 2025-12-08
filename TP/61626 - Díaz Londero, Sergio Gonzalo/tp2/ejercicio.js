'use strict';

// Clase Contacto
class Contacto {
	constructor(id, nombre, apellido, telefono, email) {
		this.id = id;
		this.nombre = nombre;
		this.apellido = apellido;
		this.telefono = telefono;
		this.email = email;
	}
}

// Clase Agenda
class Agenda {
	constructor() {
		this.contactos = [];
	}

	agregar(contacto) {
		this.contactos.push(contacto);
		this.ordenar();
	}

	actualizar(id, datos) {
		const idx = this.contactos.findIndex(c => c.id === id);
		if (idx !== -1) {
			this.contactos[idx] = { ...this.contactos[idx], ...datos };
			this.ordenar();
		}
	}

	borrar(id) {
		this.contactos = this.contactos.filter(c => c.id !== id);
	}

	buscar(texto) {
		if (!texto) return this.contactos;
		const normalizar = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
		const t = normalizar(texto);
		return this.contactos.filter(c => {
			return [c.nombre, c.apellido, c.telefono, c.email].some(
				campo => normalizar(campo).includes(t)
			);
		});
	}

	ordenar() {
		this.contactos.sort((a, b) => {
			const an = a.apellido.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
			const bn = b.apellido.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
			if (an === bn) {
				const aNom = a.nombre.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
				const bNom = b.nombre.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
				return aNom.localeCompare(bNom);
			}
			return an.localeCompare(bn);
		});
	}
}

// Datos iniciales
const datosEjemplo = [
	{ nombre: 'Ana', apellido: 'García', telefono: '123456789', email: 'ana@gmail.com' },
	{ nombre: 'Luis', apellido: 'Pérez', telefono: '234567890', email: 'luis@gmail.com' },
	{ nombre: 'María', apellido: 'López', telefono: '345678901', email: 'maria@gmail.com' },
	{ nombre: 'Juan', apellido: 'Martínez', telefono: '456789012', email: 'juan@gmail.com' },
	{ nombre: 'Sofía', apellido: 'Rodríguez', telefono: '567890123', email: 'sofia@gmail.com' },
	{ nombre: 'Pedro', apellido: 'Gómez', telefono: '678901234', email: 'pedro@gmail.com' },
	{ nombre: 'Lucía', apellido: 'Fernández', telefono: '789012345', email: 'lucia@gmail.com' },
	{ nombre: 'Carlos', apellido: 'Sánchez', telefono: '890123456', email: 'carlos@gmail.com' },
	{ nombre: 'Valentina', apellido: 'Torres', telefono: '901234567', email: 'valentina@gmail.com' },
	{ nombre: 'Miguel', apellido: 'Ramírez', telefono: '012345678', email: 'miguel@gmail.com' }
];

const agenda = new Agenda();
let ultimoId = 1;
datosEjemplo.forEach(d => agenda.agregar(new Contacto(ultimoId++, d.nombre, d.apellido, d.telefono, d.email)));

// Elementos DOM
const buscador = document.getElementById('buscador');
const btnAgregar = document.getElementById('btn-agregar');
const listado = document.getElementById('listado-contactos');
const dialogo = document.getElementById('dialogo-contacto');
const formContacto = document.getElementById('form-contacto');
const dialogoTitulo = document.getElementById('dialogo-titulo');
const contactoId = document.getElementById('contacto-id');
const contactoNombre = document.getElementById('contacto-nombre');
const contactoApellido = document.getElementById('contacto-apellido');
const contactoTelefono = document.getElementById('contacto-telefono');
const contactoEmail = document.getElementById('contacto-email');
const btnCancelar = document.getElementById('btn-cancelar');

// Renderizar contactos
function renderizarContactos(filtrados = null) {
	const contactos = filtrados || agenda.contactos;
	listado.innerHTML = '';
	if (contactos.length === 0) {
		listado.innerHTML = '<p>No hay contactos para mostrar.</p>';
		return;
	}
	contactos.forEach(contacto => {
			const card = document.createElement('article');
			card.className = 'card-contacto card'; // Pico.css card
			card.innerHTML = `
				<header class="card-header">
					<strong class="card-title">${contacto.nombre} ${contacto.apellido}</strong>
				</header>
				<p>Teléfono: <span class="card-data">${contacto.telefono}</span></p>
				<p>Email: <span class="card-data">${contacto.email}</span></p>
				<footer class="card-footer">
					<button class="icono-editar outline" title="Editar" aria-label="Editar" data-id="${contacto.id}">
						✏️
					</button>
					<button class="icono-borrar outline" title="Borrar" aria-label="Borrar" data-id="${contacto.id}">
						🗑️
					</button>
				</footer>
			`;
			listado.appendChild(card);
	});
}

// Búsqueda en tiempo real
buscador.addEventListener('input', e => {
	const texto = e.target.value;
	const filtrados = agenda.buscar(texto);
	renderizarContactos(filtrados);
});

// Abrir diálogo para agregar
btnAgregar.addEventListener('click', () => {
	dialogoTitulo.textContent = 'Nuevo Contacto';
	contactoId.value = '';
	contactoNombre.value = '';
	contactoApellido.value = '';
	contactoTelefono.value = '';
	contactoEmail.value = '';
	dialogo.showModal();
});

// Cancelar diálogo
btnCancelar.addEventListener('click', () => {
	dialogo.close();
});

// Guardar contacto (alta o edición)
formContacto.addEventListener('submit', e => {
	e.preventDefault();
	const id = contactoId.value ? Number(contactoId.value) : null;
	const nombre = contactoNombre.value.trim();
	const apellido = contactoApellido.value.trim();
	const telefono = contactoTelefono.value.trim();
	const email = contactoEmail.value.trim();
	if (!nombre || !apellido || !telefono || !email) return;
	if (id) {
		agenda.actualizar(id, { nombre, apellido, telefono, email });
	} else {
		agenda.agregar(new Contacto(ultimoId++, nombre, apellido, telefono, email));
	}
	renderizarContactos();
	dialogo.close();
});

// Delegación para editar y borrar
listado.addEventListener('click', e => {
	if (e.target.classList.contains('icono-editar')) {
		const id = Number(e.target.dataset.id);
		const contacto = agenda.contactos.find(c => c.id === id);
		if (contacto) {
			dialogoTitulo.textContent = 'Editar Contacto';
			contactoId.value = contacto.id;
			contactoNombre.value = contacto.nombre;
			contactoApellido.value = contacto.apellido;
			contactoTelefono.value = contacto.telefono;
			contactoEmail.value = contacto.email;
			dialogo.showModal();
		}
	}
	if (e.target.classList.contains('icono-borrar')) {
		const id = Number(e.target.dataset.id);
		agenda.borrar(id);
		renderizarContactos();
	}
});

// Inicializar render
renderizarContactos();
