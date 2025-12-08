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

  agregar(contacto) {
    contacto.id = ++this.ultimoId;
    this.contactos.push(contacto);
  }

  actualizar(id, datos) {
    const c = this.contactos.find(c => c.id === id);
    if (c) Object.assign(c, datos);
  }

  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }

  buscar(texto) {
    const normalizar = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    texto = normalizar(texto);
    return this.contactos.filter(c =>
      [c.nombre, c.apellido, c.telefono, c.email]
        .some(campo => normalizar(campo).includes(texto))
    );
  }

  ordenar() {
    this.contactos.sort((a, b) => {
      const ap = a.apellido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const bp = b.apellido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      if (ap === bp) {
        const an = a.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const bn = b.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return an.localeCompare(bn);
      }
      return ap.localeCompare(bp);
    });
  }
}

// Genera 10 contactos de ejemplo
function contactosEjemplo() {
  return [
    new Contacto(1, "Lewis", "Hamilton", "4444-4444", "ham44@gmail.com"),
    new Contacto(2, "Franco", "Colapinto", "4343-4343", "franco43@mail.com"),
    new Contacto(3, "Lando", "Norris", "4444-4444", "lando4@gmail.com"),
    new Contacto(4, "Oscar", "Piastri", "8181-8181", "oscar81@gmail.com"),
    new Contacto(5, "Fernando", "Alonso", "1414-1414", "alonso5@gmail.com"),
    new Contacto(6, "Gabriel", "Bortoleto", "0800-5555", "sauber5@gmail.com"),
    new Contacto(7, "Carlos", "Sainz", "5555-5555", "carlos5@gmail.com"),
    new Contacto(8, "Max", "Verstapen", "1111-1111", "supermax@gmail.com"),
    new Contacto(9, "Pierre", "Gasly", "1010-1010", "gasly10@gmail.com"),
    new Contacto(10, "Isak", "Hadjar", "7777-7777", "hadjarrb@gmail.com"),
    new Contacto(11, "Alex", "Albon", "2222-2222", "alexalbon@gmail.com")
  ]
}

// --- Lógica de UI y eventos aquí (te// ...existing code...

// --- Lógica de UI y eventos ---

// Referencias a elementos del DOM
const listado = document.getElementById('listado');
const buscador = document.getElementById('buscador');
const btnAgregar = document.getElementById('btnAgregar');
const dialogo = document.getElementById('dialogoContacto');
const form = document.getElementById('formContacto');
const contactoId = document.getElementById('contactoId');
const nombre = document.getElementById('nombre');
const apellido = document.getElementById('apellido');
const telefono = document.getElementById('telefono');
const email = document.getElementById('email');
const cancelar = document.getElementById('cancelar');

const agenda = new Agenda();
contactosEjemplo().forEach(c => agenda.agregar(c));
agenda.ordenar();

let modoEdicion = false;

// Renderiza la lista de contactos
function renderizarLista(filtro = '') {
  agenda.ordenar();
  let contactos = filtro ? agenda.buscar(filtro) : agenda.contactos;
  listado.innerHTML = contactos.map(c => `
    <article class="card">
      <header>
        <strong>${c.nombre} ${c.apellido}</strong>
      </header>
      <p>📞 ${c.telefono}<br>✉️ ${c.email}</p>
      <footer>
        <button class="editar" data-id="${c.id}" title="Editar">✏️</button>
        <button class="borrar" data-id="${c.id}" title="Borrar">🗑️</button>
      </footer>
    </article>
  `).join('');
}

// Mostrar diálogo para agregar o editar
function abrirDialogo(editar = false, c = null) {
  modoEdicion = editar;
  if (editar && c) {
    contactoId.value = c.id;
    nombre.value = c.nombre;
    apellido.value = c.apellido;
    telefono.value = c.telefono;
    email.value = c.email;
  } else {
    contactoId.value = '';
    form.reset();
  }
  dialogo.showModal();
}

// Evento buscar
buscador.addEventListener('input', e => {
  renderizarLista(e.target.value);
});

// Evento agregar
btnAgregar.addEventListener('click', () => {
  abrirDialogo(false);
});

// Evento editar/borrar (delegación)
listado.addEventListener('click', e => {
  if (e.target.classList.contains('editar')) {
    const id = Number(e.target.dataset.id);
    const c = agenda.contactos.find(c => c.id === id);
    abrirDialogo(true, c);
  }
  if (e.target.classList.contains('borrar')) {
    const id = Number(e.target.dataset.id);
    agenda.borrar(id);
    renderizarLista(buscador.value);
  }
});

// Evento guardar contacto
form.addEventListener('submit', e => {
  e.preventDefault();
  const datos = {
    nombre: nombre.value,
    apellido: apellido.value,
    telefono: telefono.value,
    email: email.value
  };
  if (modoEdicion && contactoId.value) {
    agenda.actualizar(Number(contactoId.value), datos);
  } else {
    agenda.agregar(new Contacto(null, ...Object.values(datos)));
  }
  dialogo.close();
  renderizarLista(buscador.value);
});

// Evento cancelar
cancelar.addEventListener('click', () => {
  dialogo.close();
});

// Inicializa la lista
renderizarLista(); 
