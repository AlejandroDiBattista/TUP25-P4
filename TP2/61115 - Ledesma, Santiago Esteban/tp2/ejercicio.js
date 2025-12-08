class Contacto {
  constructor({id, nombre, apellido, telefono, email}) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
  }
  nombreCompleto() {
    return `${this.apellido}, ${this.nombre}`;
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
    this.ordenar();
  }

  actualizar(id, datos) {
    const c = this.contactos.find(x => x.id === id);
    if (c) Object.assign(c, datos);
    this.ordenar();
  }

  borrar(id) {
    const idx = this.contactos.findIndex(x => x.id === id);
    if (idx >= 0) this.contactos.splice(idx, 1);
  }

  buscar(texto) {
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
      const ap = normalizar(a.apellido);
      const bp = normalizar(b.apellido);
      if (ap === bp) return normalizar(a.nombre).localeCompare(normalizar(b.nombre));
      return ap.localeCompare(bp);
    });
  }
}

// --- Utilidades ---
function normalizar(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// --- Datos de ejemplo ---
const ejemplos = [
  {nombre: "Juan", apellido: "Pérez", telefono: "3815551234", email: "jperez@gmail.com"},
  {nombre: "José", apellido: "Gómez", telefono: "3815551235", email: "jgomez@gmail.com"},
  {nombre: "Pedro", apellido: "Sánchez", telefono: "3815551236", email: "psanchez@gmail.com"},
  {nombre: "Ana", apellido: "López", telefono: "3815551237", email: "alopez@gmail.com"},
  {nombre: "María", apellido: "Fernández", telefono: "3815551238", email: "mfernandez@gmail.com"},
  {nombre: "Lucía", apellido: "Martínez", telefono: "3815551239", email: "lmartinez@gmail.com"},
  {nombre: "Carlos", apellido: "Rodríguez", telefono: "3815551240", email: "crodriguez@gmail.com"},
  {nombre: "Sofía", apellido: "Díaz", telefono: "3815551241", email: "sdiaz@gmail.com"},
  {nombre: "Miguel", apellido: "Torres", telefono: "3815551242", email: "mtorres@gmail.com"},
  {nombre: "Laura", apellido: "Romero", telefono: "3815551243", email: "lromero@gmail.com"},
];

// --- Instancia de agenda ---
const agenda = new Agenda();
for (const ej of ejemplos) {
  agenda.agregar(new Contacto(ej));
}

// --- Elementos DOM ---
const $buscador = document.getElementById("buscador");
const $btnAgregar = document.getElementById("btnAgregar");
const $listado = document.getElementById("listadoContactos");
const $dialogo = document.getElementById("dialogoContacto");
const $form = document.getElementById("formContacto");
const $tituloDialogo = document.getElementById("tituloDialogo");
const $btnCancelar = document.getElementById("btnCancelar");
const $contactoId = document.getElementById("contactoId");
const $nombre = document.getElementById("nombre");
const $apellido = document.getElementById("apellido");
const $telefono = document.getElementById("telefono");
const $email = document.getElementById("email");

// --- Renderizado ---
function renderizar(filtro = "") {
  const contactos = filtro ? agenda.buscar(filtro) : agenda.contactos;
  $listado.innerHTML = "";
  if (contactos.length === 0) {
    $listado.innerHTML = `<article><p>No hay contactos para mostrar.</p></article>`;
    return;
  }
  for (const c of contactos) {
    const card = document.createElement("article");
    card.className = "contacto-card";
    card.innerHTML = `
      <header style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 1.1em;">${c.nombre} ${c.apellido}</strong>
        <span>
          <button class="icono-editar" title="Editar" data-id="${c.id}" aria-label="Editar"><svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4.18A3 3 0 0 0 7 7.82V19a2 2 0 0 0 2 2zm0-2V7.82A3 3 0 0 1 7.82 5H19a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5zm2-2h10v-2H7v2zm0-4h10v-2H7v2zm0-4h10V7H7v2z"/></svg></button>
          <button class="icono-borrar" title="Borrar" data-id="${c.id}" aria-label="Borrar"><svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm3.46-7.12a1 1 0 0 1 1.41 0l1.13 1.13l1.13-1.13a1 1 0 1 1 1.41 1.41l-1.13 1.13l1.13 1.13a1 1 0 1 1-1.41 1.41l-1.13-1.13l-1.13 1.13a1 1 0 1 1-1.41-1.41l1.13-1.13l-1.13-1.13a1 1 0 0 1 0-1.41z"/></svg></button>
        </span>
      </header>
      <p><strong>Tel:</strong> ${c.telefono}</p>
      <p><strong>Email:</strong> ${c.email}</p>
    `;
    $listado.appendChild(card);
  }
}

// --- Eventos ---
$buscador.addEventListener("input", () => {
  renderizar($buscador.value);
});

$btnAgregar.addEventListener("click", () => {
  $form.reset();
  $contactoId.value = "";
  $tituloDialogo.textContent = "Agregar contacto";
  $dialogo.showModal();
  $nombre.focus();
});

$listado.addEventListener("click", e => {
  if (e.target.closest(".icono-editar")) {
    const id = Number(e.target.closest("button").dataset.id);
    const c = agenda.contactos.find(x => x.id === id);
    if (c) {
      $contactoId.value = c.id;
      $nombre.value = c.nombre;
      $apellido.value = c.apellido;
      $telefono.value = c.telefono;
      $email.value = c.email;
      $tituloDialogo.textContent = "Editar contacto";
      $dialogo.showModal();
      $nombre.focus();
    }
  }
  if (e.target.closest(".icono-borrar")) {
    const id = Number(e.target.closest("button").dataset.id);
    agenda.borrar(id);
    renderizar($buscador.value);
  }
});

$btnCancelar.addEventListener("click", () => {
  $dialogo.close();
});

$form.addEventListener("submit", e => {
  e.preventDefault();
  const datos = {
    nombre: $nombre.value.trim(),
    apellido: $apellido.value.trim(),
    telefono: $telefono.value.trim(),
    email: $email.value.trim()
  };
  if ($contactoId.value) {
    agenda.actualizar(Number($contactoId.value), datos);
  } else {
    agenda.agregar(new Contacto(datos));
  }
  $dialogo.close();
  renderizar($buscador.value);
});

// --- Inicialización ---
renderizar();