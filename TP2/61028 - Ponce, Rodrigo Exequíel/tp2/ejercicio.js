'use strict';


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

  editar(id, datos) {
    let c = this.contactos.find(cto => cto.id === id);
    if (c) {
      c.nombre = datos.nombre;
      c.apellido = datos.apellido;
      c.telefono = datos.telefono;
      c.email = datos.email;
    }
    this.ordenar();
  }

  borrar(id) {
    this.contactos = this.contactos.filter(cto => cto.id !== id);
  }

  buscar(texto) {
    let normalizar = (str) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    texto = normalizar(texto);

    return this.contactos.filter(c =>
      normalizar(c.nombre).includes(texto) ||
      normalizar(c.apellido).includes(texto) ||
      normalizar(c.telefono).includes(texto) ||
      normalizar(c.email).includes(texto)
    );
  }

  ordenar() {
    this.contactos.sort((a, b) => {
      return a.apellido.localeCompare(b.apellido, 'es', {sensitivity:'base'}) ||
             a.nombre.localeCompare(b.nombre, 'es', {sensitivity:'base'});
    });
  }
}


let agenda = new Agenda();
let id = 1;
const contactosIniciales = [
  ["Diego", "Díaz", "11-5555-8080", "diego.diaz@example.com"],
  ["Valentina", "Fernández", "11-5555-9090", "valen.fernandez@example.com"],
  ["María", "García", "11-5555-2020", "maria.garcia@example.com"],
  ["Sofía", "Gómez", "11-5555-7070", "sofia.gomez@example.com"],
  ["Ana", "López", "11-5555-4040", "ana.lopez@example.com"],
  ["Lucía", "Martínez", "11-5555-5050", "lucia.martinez@example.com"],
  ["Juan", "Pérez", "11-5555-3030", "juan.perez@example.com"],
  ["Carlos", "Rodríguez", "11-5555-6060", "carlos.rodriguez@example.com"],
  ["Mateo", "Ruiz", "11-5555-1010", "mateo.ruiz@example.com"],
  ["Laura", "Torres", "11-5555-8081", "laura.torres@example.com"]
];

contactosIniciales.forEach(c => agenda.agregar(new Contacto(id++, ...c)));


const listado = document.getElementById("listadoContactos");
const buscador = document.getElementById("buscador");
const dialogo = document.getElementById("dialogoContacto");
const form = document.getElementById("formContacto");
const btnAgregar = document.getElementById("btnAgregar");

let editandoId = null;

function renderizar(lista = agenda.contactos) {
  listado.innerHTML = "";
  lista.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${c.nombre} ${c.apellido}</h3>
      <p>📞 ${c.telefono}</p>
      <p>✉️ ${c.email}</p>
      <div class="iconos">
        <button class="editar" data-id="${c.id}">✏️</button>
        <button class="borrar" data-id="${c.id}">🗑️</button>
      </div>
    `;
    listado.appendChild(card);
  });
}


btnAgregar.addEventListener("click", () => {
  editandoId = null;
  form.reset();
  document.getElementById("tituloDialogo").textContent = "Agregar contacto";
  dialogo.showModal();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const datos = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value
  };

  if (editandoId) {
    agenda.editar(editandoId, datos);
  } else {
    agenda.agregar(new Contacto(id++, datos.nombre, datos.apellido, datos.telefono, datos.email));
  }

  renderizar();
  dialogo.close();
});

listado.addEventListener("click", (e) => {
  if (e.target.classList.contains("borrar")) {
    agenda.borrar(parseInt(e.target.dataset.id));
    renderizar();
  }
  if (e.target.classList.contains("editar")) {
    editandoId = parseInt(e.target.dataset.id);
    const c = agenda.contactos.find(cto => cto.id === editandoId);
    if (c) {
      document.getElementById("nombre").value = c.nombre;
      document.getElementById("apellido").value = c.apellido;
      document.getElementById("telefono").value = c.telefono;
      document.getElementById("email").value = c.email;
      document.getElementById("tituloDialogo").textContent = "Editar contacto";
      dialogo.showModal();
    }
  }
});

buscador.addEventListener("input", () => {
  renderizar(agenda.buscar(buscador.value));
});


renderizar();
