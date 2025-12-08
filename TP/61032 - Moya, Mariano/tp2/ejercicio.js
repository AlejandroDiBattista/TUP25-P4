'use strict';
// Funciones generales
(function() {
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
		}
		actualizar(id, datos) {
			const idx = this.contactos.findIndex(c => c.id === id);
			if (idx !== -1) {
				this.contactos[idx] = Object.assign(this.contactos[idx], datos);
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
				const norm = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
				const cmpApellido = norm(a.apellido).localeCompare(norm(b.apellido));
				if (cmpApellido !== 0) return cmpApellido;
				return norm(a.nombre).localeCompare(norm(b.nombre));
			});
		}
	}

	// Datos iniciales
	const ejemplos = [
		{nombre: "Juan", apellido: "Pérez", telefono: "111-1111", email: "juan.perez@mail.com"},
		{nombre: "Ana", apellido: "García", telefono: "222-2222", email: "ana.garcia@mail.com"},
		{nombre: "Luis", apellido: "Martínez", telefono: "333-3333", email: "luis.martinez@mail.com"},
		{nombre: "María", apellido: "López", telefono: "444-4444", email: "maria.lopez@mail.com"},
		{nombre: "Carlos", apellido: "Gómez", telefono: "555-5555", email: "carlos.gomez@mail.com"},
		{nombre: "Lucía", apellido: "Fernández", telefono: "666-6666", email: "lucia.fernandez@mail.com"},
		{nombre: "Pedro", apellido: "Sánchez", telefono: "777-7777", email: "pedro.sanchez@mail.com"},
		{nombre: "Sofía", apellido: "Ramírez", telefono: "888-8888", email: "sofia.ramirez@mail.com"},
		{nombre: "Miguel", apellido: "Torres", telefono: "999-9999", email: "miguel.torres@mail.com"},
		{nombre: "Valentina", apellido: "Díaz", telefono: "101-0101", email: "valentina.diaz@mail.com"}
	];

	// Instancia agenda y carga inicial
	const agenda = new Agenda();
	let idCounter = 1;
	ejemplos.forEach(e => agenda.agregar(new Contacto(idCounter++, e.nombre, e.apellido, e.telefono, e.email)));
	agenda.ordenar();

	// Elementos DOM
	const listado = document.getElementById('listado-contactos');
	const buscador = document.getElementById('buscador');
	const btnAgregar = document.getElementById('btn-agregar');
	const dialogo = document.getElementById('dialogo-contacto');
	const form = document.getElementById('form-contacto');
	const btnCancelar = document.getElementById('btn-cancelar');
	const dialogoTitulo = document.getElementById('dialogo-titulo');
	const contactoId = document.getElementById('contacto-id');
	const nombreInput = document.getElementById('nombre');
	const apellidoInput = document.getElementById('apellido');
	const telefonoInput = document.getElementById('telefono');
	const emailInput = document.getElementById('email');

	// Renderizar contactos
	function renderContactos(filtro = "") {
		agenda.ordenar();
		const contactos = agenda.buscar(filtro);
		listado.innerHTML = contactos.map(c => `
			<article class="card-contacto">
				<div class="nombre-apellido">${c.nombre} ${c.apellido}</div>
				<div class="datos">📞 ${c.telefono}</div>
				<div class="datos">✉️ ${c.email}</div>
				<div class="acciones">
					<button type="button" aria-label="Editar" data-id="${c.id}" class="btn-editar">✏️</button>
					<button type="button" aria-label="Borrar" data-id="${c.id}" class="btn-borrar">🗑️</button>
				</div>
			</article>
		`).join("");
	}

	// Abrir diálogo para agregar
	btnAgregar.addEventListener('click', () => {
		dialogoTitulo.textContent = "Nuevo contacto";
		contactoId.value = "";
		form.reset();
		dialogo.showModal();
	});

	// Cancelar diálogo
	btnCancelar.addEventListener('click', () => {
		dialogo.close();
	});

	// Guardar contacto (alta/edición)
	form.addEventListener('submit', function(e) {
		e.preventDefault();
		const id = contactoId.value ? parseInt(contactoId.value) : null;
		const datos = {
			nombre: nombreInput.value.trim(),
			apellido: apellidoInput.value.trim(),
			telefono: telefonoInput.value.trim(),
			email: emailInput.value.trim()
		};
		if (id) {
			agenda.actualizar(id, datos);
		} else {
			agenda.agregar(new Contacto(idCounter++, datos.nombre, datos.apellido, datos.telefono, datos.email));
		}
		renderContactos(buscador.value);
		dialogo.close();
	});

	// Delegación para editar/borrar
	listado.addEventListener('click', function(e) {
		if (e.target.classList.contains('btn-editar')) {
			const id = parseInt(e.target.dataset.id);
			const c = agenda.contactos.find(c => c.id === id);
			if (c) {
				dialogoTitulo.textContent = "Editar contacto";
				contactoId.value = c.id;
				nombreInput.value = c.nombre;
				apellidoInput.value = c.apellido;
				telefonoInput.value = c.telefono;
				emailInput.value = c.email;
				dialogo.showModal();
			}
		} else if (e.target.classList.contains('btn-borrar')) {
			const id = parseInt(e.target.dataset.id);
			agenda.borrar(id);
			renderContactos(buscador.value);
		}
	});

	// Búsqueda en tiempo real
	buscador.addEventListener('input', function() {
		renderContactos(this.value);
	});

	// Inicializar render
	renderContactos();

})();
