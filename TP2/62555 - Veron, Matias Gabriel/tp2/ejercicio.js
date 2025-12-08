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

  actualizar(id, datos) {
    const i = this.contactos.findIndex(c => c.id === id);
    if (i !== -1) {
      this.contactos[i] = { ...this.contactos[i], ...datos };
      this.ordenar();
    }
  }

  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }

  buscar(filtro) {
    const normalizar = (txt) =>
      txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const q = normalizar(filtro);
    return this.contactos.filter(c =>
      normalizar(c.nombre).includes(q) ||
      normalizar(c.apellido).includes(q) ||
      normalizar(c.telefono).includes(q) ||
      normalizar(c.email).includes(q)
    );
  }

  ordenar() {
    this.contactos.sort((a, b) =>
      a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' }) ||
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );
  }
}

const agenda = new Agenda();
[
  ["Diego", "Díaz", "11-5555-8080", "diego.diaz@example.com"],
  ["Valentina", "Fernández", "11-5555-9090", "valen.fernandez@example.com"],
  ["María", "García", "11-5555-2020", "maria.garcia@example.com"],
  ["Sofía", "Gómez", "11-5555-7070", "sofia.gomez@example.com"],
  ["Ana", "López", "11-5555-4040", "ana.lopez@example.com"],
  ["Lucía", "Martínez", "11-5555-5050", "lucia.martinez@example.com"],
  ["Juan", "Pérez", "11-5555-3030", "juan.perez@example.com"],
  ["Carlos", "Rodríguez", "11-5555-1010", "carlos.rodriguez@example.com"],
  ["Mateo", "Ruiz", "11-5555-6060", "mateo.ruiz@example.com"],
  ["Laura", "Suárez", "11-5555-8081", "laura.suarez@example.com"]
].forEach((c, i) =>
  agenda.agregar(new Contacto(i+1, c[0], c[1], c[2], c[3]))
);


const lista = document.getElementById("lista-contactos");
const buscador = document.getElementById("buscador");
const dlg = document.getElementById("dlg-contacto");
const form = document.getElementById("form-contacto");
const titulo = document.getElementById("dlg-titulo");


function render(contactos = agenda.contactos) {
  lista.innerHTML = "";
  contactos.forEach(c => {
    const card = document.createElement("article");
    card.innerHTML = `
      <h3>${c.nombre} ${c.apellido}</h3>
      <p>📞 ${c.telefono}<br>📧 ${c.email}</p>
      <footer>
        <button class="editar" data-id="${c.id}">✏️</button>
        <button class="borrar" data-id="${c.id}">🗑️</button>
      </footer>
    `;
    lista.appendChild(card);
  });
}


render();


buscador.addEventListener("input", () => {
  render(agenda.buscar(buscador.value));
});


document.getElementById("btn-agregar").addEventListener("click", () => {
  titulo.textContent = "Agregar contacto";
  form.reset();
  document.getElementById("contacto-id").value = "";
  dlg.showModal();
});


form.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("contacto-id").value;
  const datos = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value,
  };

  if (id) {
    agenda.actualizar(parseInt(id), datos);
  } else {
    const nuevoId = agenda.contactos.length ? Math.max(...agenda.contactos.map(c=>c.id)) + 1 : 1;
    agenda.agregar(new Contacto(nuevoId, datos.nombre, datos.apellido, datos.telefono, datos.email));
  }

  dlg.close();
  render();
});


document.getElementById("btn-cancelar").addEventListener("click", () => dlg.close());


lista.addEventListener("click", (e) => {
  if (e.target.classList.contains("borrar")) {
    agenda.borrar(parseInt(e.target.dataset.id));
    render();
  } else if (e.target.classList.contains("editar")) {
    const c = agenda.contactos.find(c => c.id == e.target.dataset.id);
    if (c) {
      titulo.textContent = "Editar contacto";
      document.getElementById("contacto-id").value = c.id;
      document.getElementById("nombre").value = c.nombre;
      document.getElementById("apellido").value = c.apellido;
      document.getElementById("telefono").value = c.telefono;
      document.getElementById("email").value = c.email;
      dlg.showModal();
    }
  }
});

