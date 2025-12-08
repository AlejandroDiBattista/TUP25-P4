// Funciones generales

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
		this._cargarEjemplo();
	}

	_cargarEjemplo() {
		const ejemplos = [
			[1, 'Ana', 'García', '351-1234567', 'ana.garcia@mail.com'],
			[2, 'Luis', 'Pérez', '351-2345678', 'luis.perez@mail.com'],
			[3, 'María', 'López', '351-3456789', 'maria.lopez@mail.com'],
			[4, 'Juan', 'Martínez', '351-4567890', 'juan.martinez@mail.com'],
			[5, 'Sofía', 'Rodríguez', '351-5678901', 'sofia.rodriguez@mail.com'],
			[6, 'Carlos', 'Fernández', '351-6789012', 'carlos.fernandez@mail.com'],
			[7, 'Lucía', 'Gómez', '351-7890123', 'lucia.gomez@mail.com'],
			[8, 'Miguel', 'Díaz', '351-8901234', 'miguel.diaz@mail.com'],
			[9, 'Valentina', 'Sosa', '351-9012345', 'valentina.sosa@mail.com'],
			[10, 'Mateo', 'Romero', '351-0123456', 'mateo.romero@mail.com'],
		];
		this.contactos = ejemplos.map(c => new Contacto(...c));//copia de array para no modificar el original
	}

	agregar(contacto) {
		this.contactos.push(contacto);//agrega al final del array 
	}

	actualizar(contacto) {
		const idx = this.contactos.findIndex(c => c.id === contacto.id);//busca el indice del contacto a actualizar
		if (idx !== -1) this.contactos[idx] = contacto;//si lo encuentra, lo actualiza
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

// --- UI ---
const agenda = new Agenda();
agenda.ordenar();

const listado = document.getElementById('listadoContactos');
const busqueda = document.getElementById('busqueda');
const btnAgregar = document.getElementById('btnAgregar');
const dialogo = document.getElementById('dialogoContacto');
const form = document.getElementById('formContacto');
const btnCancelar = document.getElementById('btnCancelar');

function renderizarContactos(filtro = '') {
  agenda.ordenar();
  const contactos = agenda.buscar(filtro);
  listado.innerHTML = '';

  if (contactos.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'No se encontraron contactos.';
    msg.style.textAlign = 'center';
    msg.style.fontStyle = 'italic';
    msg.style.color = '#555';
    listado.appendChild(msg);
    return;
  }

  for (const c of contactos) {
    const card = document.createElement('div');
    card.className = 'card-contacto';
    card.innerHTML = `
      <div class="acciones">
        <button title="Editar" data-id="${c.id}" class="editar">✏️</button>
        <button title="Borrar" data-id="${c.id}" class="borrar">🗑️</button>
      </div>
      <h3>${c.nombre} ${c.apellido}</h3>
      <div><b>Tel:</b> ${c.telefono}</div>
      <div><b>Email:</b> ${c.email}</div>
    `;
    listado.appendChild(card);
  }
}


busqueda.addEventListener('input', e => {
	renderizarContactos(e.target.value);//filtra mientras escribe en busqueda
});

btnAgregar.addEventListener('click', () => {
	form.reset();//limpia el formulario 
	document.getElementById('contactoId').value = '';//id vacio para nuevo contacto
	dialogo.showModal();//abre el dialogo
});

btnCancelar.addEventListener('click', () => {
	dialogo.close();
});

listado.addEventListener('click', e => {
	if (e.target.classList.contains('borrar')) //delegacion de eventos 
    {
		const id = Number(e.target.dataset.id);
		agenda.borrar(id);//
		renderizarContactos(busqueda.value);//
	} else if (e.target.classList.contains('editar')) {
		const id = Number(e.target.dataset.id);
		const c = agenda.contactos.find(c => c.id === id);
		if (c) {
			document.getElementById('contactoId').value = c.id;
			document.getElementById('nombre').value = c.nombre;
			document.getElementById('apellido').value = c.apellido;
			document.getElementById('telefono').value = c.telefono;
			document.getElementById('email').value = c.email;
			dialogo.showModal();
		}
	}
});

form.addEventListener('submit', e => { 
	e.preventDefault();
	const id = document.getElementById('contactoId').value;
	const nombre = document.getElementById('nombre').value.trim();
	const apellido = document.getElementById('apellido').value.trim();
	const telefono = document.getElementById('telefono').value.trim();
	const email = document.getElementById('email').value.trim();
	if (id) {
		agenda.actualizar(new Contacto(Number(id), nombre, apellido, telefono, email));
	} else {
		const nuevoId = agenda.contactos.length ? Math.max(...agenda.contactos.map(c => c.id)) + 1 : 1;
		agenda.agregar(new Contacto(nuevoId, nombre, apellido, telefono, email));
	}
	renderizarContactos(busqueda.value);
	dialogo.close();
});

// Inicial
renderizarContactos();
