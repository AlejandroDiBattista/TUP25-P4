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
		this.nextId = 1;
	}

	agregar(nombre, apellido, telefono, email) {
		const nuevo = new Contacto(this.nextId++, nombre, apellido, telefono, email);
		this.contactos.push(nuevo);
		this.ordenar();
	}

	editar(id, nombre, apellido, telefono, email) {
		const contacto = this.contactos.find((c) => c.id === id);
		if (contacto) {
			contacto.nombre = nombre;
			contacto.apellido = apellido;
			contacto.telefono = telefono;
			contacto.email = email;
			this.ordenar();
		}
	}

	borrar(id) {
		this.contactos = this.contactos.filter((c) => c.id !== id);
	}

	buscar(texto) {
		const normalizar = (s) =>
			s
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.toLowerCase();
		const filtro = normalizar(texto);
		return this.contactos.filter(
			(c) =>
				normalizar(c.nombre).includes(filtro) ||
				normalizar(c.apellido).includes(filtro) ||
				c.telefono.includes(filtro) ||
				normalizar(c.email).includes(filtro)
		);
	}

	ordenar() {
		this.contactos.sort((a, b) => {
			const ap = a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' });
			return ap !== 0
				? ap
				: a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
		});
	}
}

const agenda = new Agenda();
const listado = document.getElementById('listado');
const search = document.getElementById('search');
const dialog = document.getElementById('contactoDialog');
const form = document.getElementById('contactoForm');
const btnAgregar = document.getElementById('btnAgregar');
const btnCancelar = document.getElementById('btnCancelar');
const dialogTitle = document.getElementById('dialogTitle');

[
	['Juan', 'Diaz', '123456789', 'ana@mail.com'],
	['Luis', 'Ferreyra', '987654321', 'luis@mail.com'],
	['Carlos', 'Appas', '1122334455', 'carlos@mail.com'],
	['Maria', 'Colantonio', '2233445566', 'maria@mail.com'],
	['Jorge', 'Escobar', '3344556677', 'jorge@mail.com'],
	['Lucia', 'Salinas', '4455667788', 'lucia@mail.com'],
	['Diego', 'Rivadeneira', '5566778899', 'diego@mail.com'],
	['Sofia', 'Gomez', '6677889900', 'sofia@mail.com'],
	['Pedro', 'Paz', '7788990011', 'pedro@mail.com'],
	['Elena', 'Salazar', '8899001122', 'elena@mail.com'],
].forEach(([n, a, t, e]) => agenda.agregar(n, a, t, e));

render();

function render(filtrados = null) {
	listado.innerHTML = '';
	const contactos = filtrados || agenda.contactos;

	contactos.forEach((c) => {
		const card = document.createElement('div');
		card.className = 'card';

		card.innerHTML = `
      <h4>${c.apellido}, ${c.nombre}</h4>
      <p> ${c.telefono}</p>
      <p> ${c.email}</p>
      <div class="card-actions">
        <button data-id="${c.id}" class="editar"> Editar</button>
        <button data-id="${c.id}" class="borrar"> Borrar</button>
      </div>
    `;

		listado.appendChild(card);
	});

	document
		.querySelectorAll('.editar')
		.forEach((btn) =>
			btn.addEventListener('click', () =>
				abrirDialogoEdicion(parseInt(btn.dataset.id))
			)
		);

	document.querySelectorAll('.borrar').forEach((btn) =>
		btn.addEventListener('click', () => {
			agenda.borrar(parseInt(btn.dataset.id));
			render();
		})
	);
}

function abrirDialogoEdicion(id) {
	const c = agenda.contactos.find((cto) => cto.id === id);
	if (!c) return;
	document.getElementById('contactoId').value = c.id;
	document.getElementById('nombre').value = c.nombre;
	document.getElementById('apellido').value = c.apellido;
	document.getElementById('telefono').value = c.telefono;
	document.getElementById('email').value = c.email;
	dialogTitle.textContent = 'Editar Contacto';
	dialog.showModal();
}

btnAgregar.addEventListener('click', () => {
	form.reset();
	document.getElementById('contactoId').value = '';
	dialogTitle.textContent = 'Nuevo Contacto';
	dialog.showModal();
});

btnCancelar.addEventListener('click', () => dialog.close());

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const id = parseInt(document.getElementById('contactoId').value);
	const nombre = document.getElementById('nombre').value;
	const apellido = document.getElementById('apellido').value;
	const telefono = document.getElementById('telefono').value;
	const email = document.getElementById('email').value;

	if (id) {
		agenda.editar(id, nombre, apellido, telefono, email);
	} else {
		agenda.agregar(nombre, apellido, telefono, email);
	}

	dialog.close();
	render();
});

search.addEventListener('input', () => {
	const texto = search.value.trim();
	if (texto === '') {
		render();
	} else {
		render(agenda.buscar(texto));
	}
});
