
'use strict';

// Clase Contacto: representa un contacto individual en la agenda.
class Contacto {
	constructor(id, nombre, apellido, telefono, email) {
		this.id = id;
		this.nombre = nombre;
		this.apellido = apellido;
		this.telefono = telefono;
		this.email = email;
	}
}

// Clase Agenda: gestiona la colección de contactos y las operaciones principales.
class Agenda {
	constructor() {
		this.contactos = [];
	}
	// Agrega un nuevo contacto a la agenda
	agregar(contacto) {
		this.contactos.push(contacto);
	}
	// Actualiza los datos de un contacto existente
	actualizar(id, datos) {
		const idx = this.contactos.findIndex(c => c.id === id);
		if (idx !== -1) {
			this.contactos[idx] = { ...this.contactos[idx], ...datos };
		}
	}
	// Elimina un contacto por su id
	borrar(id) {
		this.contactos = this.contactos.filter(c => c.id !== id);
	}
	// Busca contactos por nombre, apellido, teléfono o email (insensible a mayúsculas y acentos)
	buscar(texto) {
		if (!texto) return this.contactos;
		// Normaliza el texto para búsqueda insensible a mayúsculas y acentos
		const normalizar = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
		const t = normalizar(texto);
		return this.contactos.filter(c =>
			normalizar(c.nombre).includes(t) ||
			normalizar(c.apellido).includes(t) ||
			normalizar(c.telefono).includes(t) ||
			normalizar(c.email).includes(t)
		);
	}
	// Ordena los contactos por apellido y luego por nombre
	ordenar() {
		this.contactos.sort((a, b) => {
			const ap = a.apellido.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
			const bp = b.apellido.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
			if (ap !== bp) return ap.localeCompare(bp);
			const an = a.nombre.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
			const bn = b.nombre.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
			return an.localeCompare(bn);
		});
	}
}

// 10 contactos de ejemplo para inicializar la agenda (sin persistencia)
const contactosEjemplo = [
	new Contacto(1, 'Diego', 'Díaz', '11-5555-8080', 'diego.diaz@example.com'),
	new Contacto(2, 'Valentina', 'Fernández', '11-5555-9090', 'valen.fernandez@example.com'),
	new Contacto(3, 'María', 'García', '11-5555-2020', 'maria.garcia@example.com'),
	new Contacto(4, 'Sofía', 'Gómez', '11-5555-7070', 'sofia.gomez@example.com'),
	new Contacto(5, 'Ana', 'López', '11-5555-4040', 'ana.lopez@example.com'),
	new Contacto(6, 'Lucía', 'Martínez', '11-5555-5050', 'lucia.martinez@example.com'),
	new Contacto(7, 'Juan', 'Pérez', '11-5555-3030', 'juan.perez@example.com'),
	new Contacto(8, 'Carlos', 'Rodríguez', '11-5555-6060', 'carlos.rodriguez@example.com'),
	new Contacto(9, 'Mateo', 'Ruiz', '11-5555-1010', 'mateo.ruiz@example.com'),
	new Contacto(10, 'Martina', 'Sosa', '11-5555-8081', 'martina.sosa@example.com'),
];

// Instancia de agenda y carga de los contactos de ejemplo
const agenda = new Agenda();
contactosEjemplo.forEach(c => agenda.agregar(c));
agenda.ordenar();

// Elementos principales del DOM
const listado = document.getElementById('listado');
const buscador = document.getElementById('buscador');
const btnAgregar = document.getElementById('btnAgregar');
const dialogo = document.getElementById('dialogo');
const formContacto = document.getElementById('formContacto');
const btnCancelar = document.getElementById('btnCancelar');
const tituloDialogo = document.getElementById('tituloDialogo');

let modoEdicion = false;
let idEditando = null;

// Renderiza la lista de contactos en el DOM.
// Se actualiza cada vez que se agrega, edita, borra o busca.
function renderizarContactos(lista) {
	listado.innerHTML = '';
	lista.forEach(contacto => {
		// Tarjeta de contacto
		const card = document.createElement('article');
		card.className = 'card';
		card.innerHTML = `
			<header><strong>${contacto.nombre} ${contacto.apellido}</strong></header>
			<p><span aria-label="Teléfono">📞</span> ${contacto.telefono}<br>
			<span aria-label="Email">✉️</span> ${contacto.email}</p>
			<footer style="display: flex; gap: 1rem;">
				<button aria-label="Editar" class="btn-editar" data-id="${contacto.id}" style="background: none; border: none; color: #d9534f; font-size: 1.2em;">✏️</button>
				<button aria-label="Borrar" class="btn-borrar" data-id="${contacto.id}" style="background: none; border: none; color: #d9534f; font-size: 1.2em;">🗑️</button>
			</footer>
		`;
		listado.appendChild(card);
	});
}

// Inicializa el renderizado de la agenda al cargar la página
renderizarContactos(agenda.contactos);

// Búsqueda en tiempo real: filtra los contactos mientras el usuario escribe
buscador.addEventListener('input', e => {
	const texto = e.target.value;
	const resultados = agenda.buscar(texto);
	agenda.ordenar();
	renderizarContactos(resultados);
});

// Abre el diálogo para agregar un nuevo contacto
btnAgregar.addEventListener('click', () => {
	modoEdicion = false;
	idEditando = null;
	formContacto.reset();
	tituloDialogo.textContent = 'Nuevo contacto';
	dialogo.showModal();
});

// Cierra el diálogo sin guardar cambios
btnCancelar.addEventListener('click', () => {
	dialogo.close();
});

// Guarda el contacto (alta o edición) al enviar el formulario
formContacto.addEventListener('submit', e => {
	e.preventDefault();
	const nombre = formContacto.nombre.value.trim();
	const apellido = formContacto.apellido.value.trim();
	const telefono = formContacto.telefono.value.trim();
	const email = formContacto.email.value.trim();
	if (!nombre || !apellido || !telefono || !email) return;
	if (modoEdicion && idEditando !== null) {
		agenda.actualizar(idEditando, { nombre, apellido, telefono, email });
	} else {
		const nuevoId = Math.max(...agenda.contactos.map(c => c.id), 0) + 1;
		agenda.agregar(new Contacto(nuevoId, nombre, apellido, telefono, email));
	}
	agenda.ordenar();
	renderizarContactos(agenda.buscar(buscador.value));
	dialogo.close();
});

// Delegación de eventos para los botones de editar y borrar en cada tarjeta
listado.addEventListener('click', e => {
	if (e.target.classList.contains('btn-editar')) {
		const id = Number(e.target.dataset.id);
		const contacto = agenda.contactos.find(c => c.id === id);
		if (contacto) {
			modoEdicion = true;
			idEditando = id;
			formContacto.nombre.value = contacto.nombre;
			formContacto.apellido.value = contacto.apellido;
			formContacto.telefono.value = contacto.telefono;
			formContacto.email.value = contacto.email;
			tituloDialogo.textContent = 'Editar contacto';
			dialogo.showModal();
		}
	}
	if (e.target.classList.contains('btn-borrar')) {
		const id = Number(e.target.dataset.id);
		agenda.borrar(id);
		agenda.ordenar();
		renderizarContactos(agenda.buscar(buscador.value));
	}
});
