'use strict';
// Funciones generales
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

function crearEjemplo() {
  return [
    { nombre: "Roberto", apellido: "Gonzalez", telefono: "3814340111", email: "robertogonzales@mail.com" },
    { nombre: "Marta", apellido: "Gómez", telefono: "3813430222", email: "marta.gomez@mail.com" },
    { nombre: "Luis", apellido: "Figueroa", telefono: "3815650333", email: "luis.figueroa@mail.com" },
    { nombre: "Ana", apellido: "lopez", telefono: "3817880444", email: "ana.lopez@mail.com" },
    { nombre: "Sofía", apellido: "Martinez", telefono: "3819690555", email: "sofia.diaz@mail.com" }
  ].map((c, i) => new Contacto({ ...c, id: i + 1 }));
}

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

  listado.querySelectorAll('.icono-editar').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      abrirDialogoEditar(id);
    };
  });

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

btnCancelar.onclick = () => dialogo.close();

btnAgregar.onclick = abrirDialogoNuevo;

buscador.oninput = () => renderizarContactos(agenda.buscar(buscador.value));

renderizarContactos(agenda.contactos);