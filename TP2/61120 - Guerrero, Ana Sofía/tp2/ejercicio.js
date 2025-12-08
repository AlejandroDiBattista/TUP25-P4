function normalizeText(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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
  constructor() {
    this._items = [];
    this._nextId = 1;
  }

  seedEjemplos() {
    const ejemplos = [
      { nombre: "Ana", apellido: "García", telefono: "11-5555-1111", email: "ana@example.com" },
      { nombre: "Bruno", apellido: "Pérez", telefono: "11-5555-2222", email: "bruno@example.com" },
      { nombre: "Carla", apellido: "López", telefono: "11-5555-3333", email: "carla@example.com" },
      { nombre: "Diego", apellido: "Martínez", telefono: "11-5555-4444", email: "diego@example.com" },
      { nombre: "Elena", apellido: "Suárez", telefono: "11-5555-5555", email: "elena@example.com" },
      { nombre: "Fabio", apellido: "Domínguez", telefono: "11-5555-6666", email: "fabio@example.com" },
      { nombre: "Gianna", apellido: "Sosa", telefono: "11-5555-7777", email: "gianna@example.com" },
      { nombre: "Hugo", apellido: "Ramos", telefono: "11-5555-8888", email: "hugo@example.com" },
      { nombre: "Ivana", apellido: "Bianchi", telefono: "11-5555-9999", email: "ivana@example.com" },
      { nombre: "Julián", apellido: "Ferreyra", telefono: "11-5555-0000", email: "julian@example.com" }
    ];
    ejemplos.forEach((e) => this.agregar(new Contacto({ id: this._nextId++, ...e })));
  }

  agregar(contacto) {
    if (!(contacto instanceof Contacto)) {
      contacto = new Contacto(contacto);
    }
    if (!contacto.id) {
      contacto.id = this._nextId++;
    }
    this._items.push(contacto);
    return contacto;
  }

  actualizar(id, data) {
    const idx = this._items.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated = new Contacto({ id, ...this._items[idx], ...data });
    this._items[idx] = updated;
    return updated;
  }

  borrar(id) {
    const idx = this._items.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this._items.splice(idx, 1);
    return true;
  }

  filtrar(texto) {
    const q = normalizeText(texto);
    if (!q) return this.ordenados();
    return this.ordenados().filter((c) => {
      return (
        normalizeText(c.nombre).includes(q) ||
        normalizeText(c.apellido).includes(q) ||
        normalizeText(c.telefono).includes(q) ||
        normalizeText(c.email).includes(q)
      );
    });
  }

  ordenados() {
    return [...this._items].sort((a, b) => {
      const apA = normalizeText(a.apellido);
      const apB = normalizeText(b.apellido);
      const noA = normalizeText(a.nombre);
      const noB = normalizeText(b.nombre);
      const byAp = apA.localeCompare(apB);
      return byAp !== 0 ? byAp : noA.localeCompare(noB);
    });
  }

  todos() {
    return this.ordenados();
  }
}

const agenda = new Agenda();

const cardsEl = document.getElementById("cards");
const searchEl = document.getElementById("search");
const addBtn = document.getElementById("addBtn");
const dialogEl = document.getElementById("contactDialog");
const formEl = document.getElementById("contactForm");
const dialogTitleEl = document.getElementById("dialogTitle");
const cancelBtn = document.getElementById("cancelBtn");
const idEl = document.getElementById("contactId");
const nombreEl = document.getElementById("nombre");
const apellidoEl = document.getElementById("apellido");
const telefonoEl = document.getElementById("telefono");
const emailEl = document.getElementById("email");

function render(list) {
  cardsEl.innerHTML = "";
  list.forEach((c) => {
    const article = document.createElement("article");
    article.innerHTML = `
      <header class="card-header">
        <div class="name">${c.nombre} ${c.apellido}</div>
        <div class="actions">
          <button class="icon-btn edit" aria-label="Editar"></button>
          <button class="icon-btn delete" aria-label="Borrar"></button>
        </div>
      </header>
      <p><strong>Tel:</strong> ${c.telefono}</p>
      <p><strong>Email:</strong> ${c.email}</p>
    `;
    const [editBtn, deleteBtn] = article.querySelectorAll(".actions .icon-btn");
    editBtn.addEventListener("click", () => openDialogForEdit(c));
    deleteBtn.addEventListener("click", () => {
      agenda.borrar(c.id);
      refresh();
    });
    cardsEl.appendChild(article);
  });
}

function refresh() {
  const q = searchEl.value;
  const data = agenda.filtrar(q);
  render(data);
}

function openDialogForCreate() {
  dialogTitleEl.textContent = "Nuevo contacto";
  idEl.value = "";
  nombreEl.value = "";
  apellidoEl.value = "";
  telefonoEl.value = "";
  emailEl.value = "";
  dialogEl.showModal();
  nombreEl.focus();
}

function openDialogForEdit(c) {
  dialogTitleEl.textContent = "Editar contacto";
  idEl.value = String(c.id);
  nombreEl.value = c.nombre;
  apellidoEl.value = c.apellido;
  telefonoEl.value = c.telefono;
  emailEl.value = c.email;
  dialogEl.showModal();
  nombreEl.focus();
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    nombre: nombreEl.value.trim(),
    apellido: apellidoEl.value.trim(),
    telefono: telefonoEl.value.trim(),
    email: emailEl.value.trim()
  };
  const existingId = Number(idEl.value || 0);
  if (existingId) {
    agenda.actualizar(existingId, data);
  } else {
    agenda.agregar(new Contacto({ id: null, ...data }));
  }
  dialogEl.close();
  refresh();
});

cancelBtn.addEventListener("click", () => dialogEl.close());
searchEl.addEventListener("input", refresh);
addBtn.addEventListener("click", openDialogForCreate);

agenda.seedEjemplos();
refresh();
+