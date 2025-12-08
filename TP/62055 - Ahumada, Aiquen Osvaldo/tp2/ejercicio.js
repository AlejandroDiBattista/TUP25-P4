document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("btnAgregar").addEventListener("click", mostrarAgregarContacto);
});
// ==================== MODELO ====================
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
		this.ultimoId = 0;
	}

	inicializarEjemplo() {
		const ejemplos = [
			["Diego", "Díaz", "11-5555-8080", "diego.diaz@example.com"],
			["Valentina", "Fernández", "11-5555-9090", "valen.fernandez@example.com"],
			["María", "García", "11-5555-2020", "maria.garcia@example.com"],
			["Sofía", "Gómez", "11-5555-7070", "sofia.gomez@example.com"],
			["Ana", "López", "11-5555-4040", "ana.lopez@example.com"],
			["Lucía", "Martínez", "11-5555-5050", "lucia.martinez@example.com"],
			["Juan", "Pérez", "11-5555-6060", "juan.perez@example.com"],
			["Carlos", "Rodríguez", "11-5555-7071", "carlos.rodriguez@example.com"],
			["Mateo", "Ruiz", "11-5555-8081", "mateo.ruiz@example.com"],
			["Camila", "Torres", "11-5555-9091", "camila.torres@example.com"],
		];
		ejemplos.forEach(([n, a, t, e]) => this.agregar(new Contacto(null, n, a, t, e)));
	}

	agregar(contacto) {
		contacto.id = ++this.ultimoId;
		this.contactos.push(contacto);
		this.ordenar();
	}

	actualizar(id, datos) {
		const c = this.contactos.find(ct => ct.id === id);
		if (c) {
			c.nombre = datos.nombre;
			c.apellido = datos.apellido;
			c.telefono = datos.telefono;
			c.email = datos.email;
			this.ordenar();
		}
	}

	borrar(id) {
		this.contactos = this.contactos.filter(ct => ct.id !== id);
	}

	buscar(texto) {
		const normalizar = str => str.toLowerCase()
																.normalize("NFD")
																.replace(/[\u0300-\u036f]/g, "");
		const q = normalizar(texto);
		return this.contactos.filter(ct =>
			normalizar(ct.nombre).includes(q) ||
			normalizar(ct.apellido).includes(q) ||
			normalizar(ct.telefono).includes(q) ||
			normalizar(ct.email).includes(q)
		);
	}

	ordenar() {
		this.contactos.sort((a, b) => {
			const ap = a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' });
			if (ap !== 0) return ap;
			return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
		});
	}
}

// ==================== UI ====================
const agenda = new Agenda();
agenda.inicializarEjemplo();

const lista = document.getElementById("lista-contactos");
const buscador = document.getElementById("buscador");
const dialog = document.getElementById("contactoDialog");
const form = document.getElementById("contactoForm");
const dialogTitle = document.getElementById("dialogTitle");
const contactoId = document.getElementById("contactoId");

function renderContactos(arr) {
	lista.innerHTML = "";
	arr.forEach(ct => {
		const card = document.createElement("article");
		card.classList.add("contact-card");
		card.innerHTML = `
			<h4>${ct.nombre} ${ct.apellido}</h4>
			<p>📞 ${ct.telefono}</p>
			<p>✉️ ${ct.email}</p>
			<footer>
				<button class="btnEditar" data-id="${ct.id}">✏️</button>
				<button class="btnBorrar" data-id="${ct.id}">🗑️</button>
			</footer>
		`;
		lista.appendChild(card);
	});
	document.querySelectorAll(".btnEditar").forEach(btn =>
		btn.addEventListener("click", () => editarContacto(parseInt(btn.dataset.id)))
	);
	document.querySelectorAll(".btnBorrar").forEach(btn =>
		btn.addEventListener("click", () => {
			agenda.borrar(parseInt(btn.dataset.id));
			renderContactos(agenda.contactos);
		})
	);
}

buscador.addEventListener("input", () => {
	const q = buscador.value.trim();
	const res = q ? agenda.buscar(q) : agenda.contactos;
	renderContactos(res);
});

function mostrarAgregarContacto() {
		console.log('Click Agregar');
		form.reset();
		contactoId.value = "";
		dialogTitle.textContent = "Agregar contacto";
		if (typeof dialog.showModal === "function") {
			dialog.showModal();
		} else {
			dialog.setAttribute("open", "true");
			dialog.style.display = "block";
		}
}

form.addEventListener("submit", e => {
	e.preventDefault();
	const datos = {
		nombre: document.getElementById("nombre").value,
		apellido: document.getElementById("apellido").value,
		telefono: document.getElementById("telefono").value,
		email: document.getElementById("email").value,
	};
	if (contactoId.value) {
		agenda.actualizar(parseInt(contactoId.value), datos);
	} else {
		agenda.agregar(new Contacto(null, datos.nombre, datos.apellido, datos.telefono, datos.email));
	}
	cerrarDialogo();
	renderContactos(agenda.contactos);
});

document.getElementById("cancelarBtn").addEventListener("click", cerrarDialogo);

function editarContacto(id) {
	const c = agenda.contactos.find(ct => ct.id === id);
	if (!c) return;
	contactoId.value = c.id;
	document.getElementById("nombre").value = c.nombre;
	document.getElementById("apellido").value = c.apellido;
	document.getElementById("telefono").value = c.telefono;
	document.getElementById("email").value = c.email;
	dialogTitle.textContent = "Editar contacto";
	if (typeof dialog.showModal === "function") {
		dialog.showModal();
	} else {
		dialog.setAttribute("open", "true");
		dialog.style.display = "block";
	}
}

function cerrarDialogo() {
	if (typeof dialog.close === "function") {
		dialog.close();
	} else {
		dialog.removeAttribute("open");
		dialog.style.display = "none";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	renderContactos(agenda.contactos);
});
