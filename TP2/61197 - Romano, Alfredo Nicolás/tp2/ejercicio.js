// --- Modelo ---
class Contacto {
  constructor({ id, nombre, apellido, telefono, email }) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
  }
}

class Agenda {
  constructor(contactos = []) {
    this.contactos = contactos;
    this.ultimoId = contactos.length ? Math.max(...contactos.map(c => c.id)) : 0;
  }

  agregar(contacto) {
    contacto.id = ++this.ultimoId;
    this.contactos.push(contacto);
    this.ordenar();
  }

  actualizar(id, datos) {
    const c = this.contactos.find(c => c.id == id);
    if (c) Object.assign(c, datos);
    this.ordenar();
  }

  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id != id);
  }

  buscar(texto) {
    texto = texto.toLowerCase();
    return this.contactos.filter(c =>
      c.nombre.toLowerCase().includes(texto) ||
      c.apellido.toLowerCase().includes(texto) ||
      c.telefono.toLowerCase().includes(texto) ||
      c.email.toLowerCase().includes(texto)
    );
  }

  ordenar() {
    this.contactos.sort((a, b) => {
      if (a.apellido === b.apellido) {
        return a.nombre.localeCompare(b.nombre);
      }
      return a.apellido.localeCompare(b.apellido);
    });
  }
}

// --- Datos de ejemplo ---
function crearEjemplo() {
  return [
    { nombre: "Juan", apellido: "Pérez", telefono: "3815550001", email: "juan.perez@mail.com" },
    { nombre: "María", apellido: "Gómez", telefono: "3815550002", email: "maria.gomez@mail.com" },
    { nombre: "Luis", apellido: "Martínez", telefono: "3815550003", email: "luis.martinez@mail.com" },
    { nombre: "Ana", apellido: "Torres", telefono: "3815550004", email: "ana.torres@mail.com" },
    { nombre: "Sofía", apellido: "Díaz", telefono: "3815550005", email: "sofia.diaz@mail.com" }
  ].map((c, i) => new Contacto({ ...c, id: i + 1 }));
}

// --- Renderizado y eventos ---
const agenda = new Agenda(crearEjemplo());
const listado = document.getElementById('listado');
const dialogo = document.getElementById('dialogoContacto');
const form = document.getElementById('formContacto');
const btnAgregar = document.getElementById('btnAgregar');
const btnCancelar = document.getElementById('btnCancelar');
const buscador = document.getElementById('buscador');

function renderizarContactos(lista) {
  listado.innerHTML = '';
  lista.forEach(contacto => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-nombre">${contacto.apellido} ${contacto.nombre}</span>
      </div>
      <div><span>📞</span> ${contacto.telefono}</div>
      <div><span>✉️</span> ${contacto.email}</div>
      <div class="iconos">
        <button class="icono-editar" title="Editar" data-id="${contacto.id}">✏️</button>
        <button class="icono-borrar" title="Borrar" data-id="${contacto.id}">🗑️</button>
      </div>
    `;
    listado.appendChild(card);
  });

  // Eventos de editar
  listado.querySelectorAll('.icono-editar').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      abrirDialogoEditar(id);
    };
  });

  // Eventos de borrar
  listado.querySelectorAll('.icono-borrar').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      agenda.borrar(id);
      renderizarContactos(agenda.buscar(buscador.value));
    };
  });
}

function abrirDialogoEditar(id) {
  const contacto = agenda.contactos.find(c => c.id == id);
  document.getElementById('tituloDialogo').textContent = 'Editar contacto';
  form.contactoId.value = contacto.id;
  form.nombre.value = contacto.nombre;
  form.apellido.value = contacto.apellido;
  form.telefono.value = contacto.telefono;
  form.email.value = contacto.email;
  dialogo.showModal();
}

function abrirDialogoNuevo() {
  document.getElementById('tituloDialogo').textContent = 'Nuevo contacto';
  form.contactoId.value = '';
  form.nombre.value = '';
  form.apellido.value = '';
  form.telefono.value = '';
  form.email.value = '';
  dialogo.showModal();
}

// Guardar contacto (nuevo o editado)
form.onsubmit = (e) => {
  e.preventDefault();
  const datos = {
    nombre: form.nombre.value,
    apellido: form.apellido.value,
    telefono: form.telefono.value,
    email: form.email.value
  };
  if (form.contactoId.value) {
    agenda.actualizar(Number(form.contactoId.value), datos);
  } else {
    agenda.agregar(new Contacto(datos));
  }
  dialogo.close();
  renderizarContactos(agenda.buscar(buscador.value));
};

// Cancelar
btnCancelar.onclick = () => dialogo.close();

// Agregar nuevo
btnAgregar.onclick = abrirDialogoNuevo;

// Buscar
buscador.oninput = () => renderizarContactos(agenda.buscar(buscador.value));

// Inicial
renderizarContactos(agenda.contactos);
