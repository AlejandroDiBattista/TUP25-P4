
// Agenda de Contactos - Lógica principal

class Contacto {
	constructor(id, nombre, apellido, telefono, email) {
		this.id = id;
		this.nombre = nombre;
		this.apellido = apellido;
		this.telefono = telefono;
		this.email = email;
	}
}

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
		return this.contactos.filter(c =>
			normalizar(c.nombre).includes(t) ||
			normalizar(c.apellido).includes(t) ||
			normalizar(c.telefono).includes(t) ||
			normalizar(c.email).includes(t)
		);
	}

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

// Datos iniciales de ejemplo
const datosEjemplo = [
	[1, 'Juan', 'Pérez', '3811111111', 'juan.perez@mail.com'],
	[2, 'Ana', 'García', '3812222222', 'ana.garcia@mail.com'],
	[3, 'Luis', 'Martínez', '3813333333', 'luis.martinez@mail.com'],
	[4, 'María', 'López', '3814444444', 'maria.lopez@mail.com'],
	[5, 'Carlos', 'Sánchez', '3815555555', 'carlos.sanchez@mail.com'],
	[6, 'Laura', 'Torres', '3816666666', 'laura.torres@mail.com'],
	[7, 'Pedro', 'Romero', '3817777777', 'pedro.romero@mail.com'],
	[8, 'Sofía', 'Díaz', '3818888888', 'sofia.diaz@mail.com'],
	[9, 'Diego', 'Vega', '3819999999', 'diego.vega@mail.com'],
	[10, 'Valeria', 'Silva', '3810000000', 'valeria.silva@mail.com'],
];

const agenda = new Agenda();
datosEjemplo.forEach(d => agenda.agregar(new Contacto(...d)));

// --- UI y lógica de interacción ---
const listado = document.getElementById('listadoContactos');
const busqueda = document.getElementById('busqueda');
const btnAgregar = document.getElementById('btnAgregar');
const dialogo = document.getElementById('dialogoContacto');
const form = document.getElementById('formContacto');
const cancelar = document.getElementById('cancelar');
const tituloDialogo = document.getElementById('tituloDialogo');
const contactoId = document.getElementById('contactoId');
const nombre = document.getElementById('nombre');
const apellido = document.getElementById('apellido');
const telefono = document.getElementById('telefono');
const email = document.getElementById('email');

function renderizarContactos(filtro = '') {
	const contactos = agenda.buscar(filtro);
	listado.innerHTML = '';
	if (contactos.length === 0) {
		listado.innerHTML = '<p>No se encontraron contactos.</p>';
		return;
	}
	contactos.forEach(c => {
		const card = document.createElement('article');
		card.className = 'card-contacto';
		card.innerHTML = `
			<div class="acciones">
				<button aria-label="Editar" title="Editar" data-id="${c.id}" class="editar">✏️</button>
				<button aria-label="Borrar" title="Borrar" data-id="${c.id}" class="borrar">🗑️</button>
			</div>
			<h4>${c.nombre} ${c.apellido}</h4>
			<div><strong>Tel:</strong> ${c.telefono}</div>
			<div><strong>Email:</strong> ${c.email}</div>
		`;
		listado.appendChild(card);
	});
}

busqueda.addEventListener('input', e => {
	renderizarContactos(e.target.value);
});

btnAgregar.addEventListener('click', () => {
	form.reset();
	contactoId.value = '';
	tituloDialogo.textContent = 'Nuevo Contacto';
	dialogo.showModal();
});

listado.addEventListener('click', e => {
	if (e.target.classList.contains('borrar')) {
		const id = Number(e.target.dataset.id);
		agenda.borrar(id);
		renderizarContactos(busqueda.value);
	} else if (e.target.classList.contains('editar')) {
		const id = Number(e.target.dataset.id);
		const c = agenda.contactos.find(c => c.id === id);
		if (c) {
			contactoId.value = c.id;
			nombre.value = c.nombre;
			apellido.value = c.apellido;
			telefono.value = c.telefono;
			email.value = c.email;
			tituloDialogo.textContent = 'Editar Contacto';
			dialogo.showModal();
		}
	}
});

form.addEventListener('submit', e => {
	e.preventDefault();
	const id = contactoId.value ? Number(contactoId.value) : Date.now();
	const datos = {
		nombre: nombre.value.trim(),
		apellido: apellido.value.trim(),
		telefono: telefono.value.trim(),
		email: email.value.trim()
	};
	if (contactoId.value) {
		agenda.actualizar(id, datos);
	} else {
		agenda.agregar(new Contacto(id, ...Object.values(datos)));
	}
	dialogo.close();
	renderizarContactos(busqueda.value);
});

cancelar.addEventListener('click', () => {
	dialogo.close();
});

dialogo.addEventListener('close', () => {
	form.reset();
});

// Inicial
renderizarContactos();
