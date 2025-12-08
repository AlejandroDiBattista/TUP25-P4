"use strict";

class Contacto {
  constructor(id, nombre, apellido, telefono = "", email = "") {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
  }

  displayName() {
    return `${this.nombre} ${this.apellido}`;
  }

  contiene(texto) {
    if (!texto) return true;
    const t = normalize(texto);
    return (
      normalize(this.nombre).includes(t) ||
      normalize(this.apellido).includes(t) ||
      normalize(this.telefono).includes(t) ||
      normalize(this.email).includes(t)
    );
  }
}

class Agenda {
  constructor() {
    this.contactos = [];
    this._nextId = 1;
  }

  agregar(contacto) {
    contacto.id = this._nextId++;
    this.contactos.push(contacto);
  }

  actualizar(id, datos) {
    const c = this.contactos.find((x) => x.id === id);
    if (!c) return false;
    c.nombre = datos.nombre;
    c.apellido = datos.apellido;
    c.telefono = datos.telefono;
    c.email = datos.email;
    return true;
  }

  borrar(id) {
    this.contactos = this.contactos.filter((c) => c.id !== id);
  }

  listar() {
    return [...this.contactos].sort((a, b) => {
      const ap = normalize(a.apellido).localeCompare(normalize(b.apellido));
      if (ap !== 0) return ap;
      return normalize(a.nombre).localeCompare(normalize(b.nombre));
    });
  }
}

function normalize(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const searchInput = $("#search");
const btnAgregar = $("#btnAgregar");
const listado = $("#listado");
const dialog = document.getElementById("dialogContacto");
const form = document.getElementById("formContacto");
const dialogTitle = document.getElementById("dialogTitle");
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const telefonoInput = document.getElementById("telefono");
const emailInput = document.getElementById("email");
const btnCancelar = document.getElementById("btnCancelar");

const agenda = new Agenda();

function seed() {
  const ejemplos = [
    ["Leo", "Ramos", "11-2345-6789", "leo.ra@example.com"],
    ["Mia", "Suárez", "11-9876-5432", "mia.su@example.com"],
    ["Tomás", "Vega", "11-1122-3344", "t.vega@example.com"],
    ["Luz", "Morán", "11-5566-7788", "luz.mo@example.com"],
    ["Nico", "Paz", "11-4433-2211", "nico.p@example.com"],
    ["Sol", "Álvarez", "11-6677-8899", "sol.al@example.com"],
    ["Fran", "Silva", "11-7788-9900", "fran.s@example.com"],
    ["Dana", "Cruz", "11-9090-8080", "dana.cr@example.com"],
    ["Ian", "Funes", "11-3030-4040", "ian.fu@example.com"],
    ["Cami", "Luna", "11-5050-6060", "cami.l@example.com"],
  ];
  ejemplos.forEach(([n, a, t, e]) =>
    agenda.agregar(new Contacto(null, n, a, t, e))
  );
}

seed();

function crearCard(contacto) {
  const article = document.createElement("article");
  article.className = "card";
  article.setAttribute("data-id", contacto.id);

  const h3 = document.createElement("h4");
  h3.textContent = contacto.displayName();

  const pTel = document.createElement("p");
  pTel.className = "muted contact-info";
  pTel.innerHTML = `<span class="icon">☎</span><span class="info-text">${
    contacto.telefono || ""
  }</span>`;

  const pMail = document.createElement("p");
  pMail.className = "muted contact-info";
  pMail.innerHTML = `<span class="icon">✉</span><span class="info-text">${
    contacto.email || ""
  }</span>`;

  const contButtons = document.createElement("div");
  contButtons.className = "card-buttons";

  const btnEdit = document.createElement("button");
  btnEdit.className = "card-btn-edit";
  btnEdit.title = "Editar";
  btnEdit.innerHTML = `<i class="fa-solid fa-pen" aria-hidden="true"></i>`;
  btnEdit.addEventListener("click", () => abrirDialogEditar(contacto.id));

  const btnDelete = document.createElement("button");
  btnDelete.className = "card-btn-delete";
  btnDelete.title = "Borrar";
  btnDelete.innerHTML = `<i class="fa-solid fa-eraser" aria-hidden="true"></i>`;
  btnDelete.addEventListener("click", () => {
    agenda.borrar(contacto.id);
    render();
  });

  contButtons.appendChild(btnEdit);
  contButtons.appendChild(btnDelete);

  const header = document.createElement("div");
  header.className = "card-header";
  header.appendChild(h3);

  const body = document.createElement("div");
  body.className = "card-body";
  body.appendChild(pTel);
  body.appendChild(pMail);
  body.appendChild(contButtons);

  article.appendChild(header);
  article.appendChild(body);

  return article;
}

function render() {
  const q = searchInput.value;
  const visibles = agenda.listar().filter((c) => c.contiene(q));
  listado.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "grid-cards";
  visibles.forEach((c) => grid.appendChild(crearCard(c)));
  listado.appendChild(grid);
}

function abrirDialogAgregar() {
  dialogTitle.textContent = "Agregar contacto";
  form.dataset.editId = "";
  nombreInput.value = "";
  apellidoInput.value = "";
  telefonoInput.value = "";
  emailInput.value = "";
  dialog.showModal();
}

function abrirDialogEditar(id) {
  const c = agenda.contactos.find((x) => x.id === id);
  if (!c) return;
  dialogTitle.textContent = "Editar contacto";
  form.dataset.editId = id;
  nombreInput.value = c.nombre;
  apellidoInput.value = c.apellido;
  telefonoInput.value = c.telefono;
  emailInput.value = c.email;
  dialog.showModal();
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const idStr = form.dataset.editId;
  const datos = {
    nombre: nombreInput.value.trim(),
    apellido: apellidoInput.value.trim(),
    telefono: telefonoInput.value.trim(),
    email: emailInput.value.trim(),
  };
  if (idStr) {
    const id = Number(idStr);
    agenda.actualizar(id, datos);
  } else {
    agenda.agregar(
      new Contacto(
        null,
        datos.nombre,
        datos.apellido,
        datos.telefono,
        datos.email
      )
    );
  }
  dialog.close();
  render();
});

btnAgregar.addEventListener("click", abrirDialogAgregar);
btnCancelar.addEventListener("click", () => dialog.close());
searchInput.addEventListener("input", () => render());

render();
