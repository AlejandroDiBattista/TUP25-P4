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
    this.idCounter = 1;
    this.cargarEjemplos();
  }

  cargarEjemplos() {
    const datos = [
      ["Ana", "Gómez", "381500111", "ana@gmail.com"],
      ["Juan", "López", "381500222", "juan@gmail.com"],
      ["María", "Pérez", "381500333", "maria@gmail.com"],
      ["Luis", "Sánchez", "381500444", "luis@gmail.com"],
      ["Carla", "Díaz", "381500555", "carla@gmail.com"],
      ["Pedro", "Ramírez", "381500666", "pedro@gmail.com"],
      ["Sofía", "Martínez", "381500777", "sofia@gmail.com"],
      ["Diego", "Flores", "381500888", "diego@gmail.com"],
      ["Lucía", "Torres", "381500999", "lucia@gmail.com"],
      ["Nicolás", "Ruiz", "381501000", "nicolas@gmail.com"]
    ];

    datos.forEach(d => this.agregar(new Contacto(null, d[0], d[1], d[2], d[3])));
  }

  agregar(c) {
    c.id = this.idCounter++;
    this.contactos.push(c);
  }

  actualizar(c) {
    const i = this.contactos.findIndex(x => x.id === c.id);
    if (i >= 0) this.contactos[i] = c;
  }

  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }

  buscar(q) {
    q = normalizar(q);
    return this.contactos.filter(c =>
      normalizar(c.nombre).includes(q) ||
      normalizar(c.apellido).includes(q) ||
      c.telefono.includes(q) ||
      normalizar(c.email).includes(q)
    ).sort(ord);
  }

  todos() {
    return [...this.contactos].sort(ord);
  }
}

function ord(a,b){
  const ap = normalizar(a.apellido);
  const bp = normalizar(b.apellido);
  if (ap === bp) return normalizar(a.nombre).localeCompare(normalizar(b.nombre));
  return ap.localeCompare(bp);
}

function normalizar(s){
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

const agenda = new Agenda();

const cards = document.getElementById("cards");
const search = document.getElementById("search");
const dlg = document.getElementById("dlg");
const form = document.getElementById("form");
const btnAdd = document.getElementById("btnAdd");

const id = document.getElementById("contactId");
const nombre = document.getElementById("nombre");
const apellido = document.getElementById("apellido");
const telefono = document.getElementById("telefono");
const email = document.getElementById("email");

function crearCard(c) {
  const d = document.createElement("article");
  d.className = "card";

  d.innerHTML = `
    <div class="top">
      <div class="name">${c.nombre} ${c.apellido}</div>
      <div class="actions">
        <button class="icon-btn" data-edit="${c.id}">✏️</button>
        <button class="icon-btn" data-del="${c.id}">🗑️</button>
      </div>
    </div>
    <div class="meta">📞 ${c.telefono}</div>
    <div class="meta">✉️ ${c.email}</div>
  `;

  return d;
}

function render() {
  const q = search.value.trim();
  const lista = q ? agenda.buscar(q) : agenda.todos();

  cards.innerHTML = "";

  lista.forEach(c => cards.appendChild(crearCard(c)));
}

btnAdd.addEventListener("click", () => {
  form.reset();
  id.value = "";
  dlg.showModal();
});

cards.addEventListener("click", (e) => {
  if (e.target.dataset.edit) {
    const c = agenda.contactos.find(x => x.id == e.target.dataset.edit);
    id.value = c.id;
    nombre.value = c.nombre;
    apellido.value = c.apellido;
    telefono.value = c.telefono;
    email.value = c.email;
    dlg.showModal();
  }

  if (e.target.dataset.del) {
    agenda.borrar(Number(e.target.dataset.del));
    render();
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const c = new Contacto(
    Number(id.value) || null,
    nombre.value,
    apellido.value,
    telefono.value,
    email.value
  );

  if (c.id) agenda.actualizar(c);
  else agenda.agregar(c);

  dlg.close();
  render();
});

document.getElementById("cancel").addEventListener("click", () => dlg.close());
search.addEventListener("input", render);

render();
