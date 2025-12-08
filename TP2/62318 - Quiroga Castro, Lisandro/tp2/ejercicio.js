/* ejercicio.js
   IIFE que implementa Contacto y Agenda, render y UI.
   Cumple TP2: 10 contactos iniciales, búsqueda normalizada, ordenar por apellido+nombre,
   diálogo para alta/edición, borrar sin confirmación, sin persistencia.
*/
(function () {
  "use strict";

  /* -------------------- Modelos -------------------- */
  class Contacto {
    constructor({ id = null, nombre, apellido, telefono, email }) {
      this.id = id || Contacto._generateId();
      this.nombre = nombre;
      this.apellido = apellido;
      this.telefono = telefono;
      this.email = email;
    }

    static _generateId() {
      return (
        "c-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 10000)
      );
    }
  }

  class Agenda {
    constructor(contactos = []) {
      this.contactos = contactos.map((c) => new Contacto(c));
    }

    agregar(datos) {
      const c = new Contacto(datos);
      this.contactos.push(c);
      return c;
    }

    actualizar(id, datos) {
      const idx = this.contactos.findIndex((x) => x.id === id);
      if (idx === -1) return null;
      this.contactos[idx] = new Contacto({ id, ...datos });
      return this.contactos[idx];
    }

    borrar(id) {
      this.contactos = this.contactos.filter((x) => x.id !== id);
    }

    buscar(texto) {
      const q = normalize(texto);
      if (!q) return this.getTodos();
      return this.getTodos().filter((c) => {
        return (
          normalize(c.nombre).includes(q) ||
          normalize(c.apellido).includes(q) ||
          normalize(c.telefono).includes(q) ||
          normalize(c.email).includes(q)
        );
      });
    }

    getTodos() {
      return this.contactos.slice().sort((a, b) => {
        const aApe = normalize(a.apellido);
        const bApe = normalize(b.apellido);
        const cmp = aApe.localeCompare(bApe);
        if (cmp !== 0) return cmp;
        return normalize(a.nombre).localeCompare(normalize(b.nombre));
      });
    }
  }

  /* -------------------- Utilidades -------------------- */
  function normalize(str = "") {
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function esc(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  /* -------------------- Datos de ejemplo (10) -------------------- */
  const SAMPLE = [
    {
      nombre: "Diego",
      apellido: "Díaz",
      telefono: "11-5555-8080",
      email: "diego.diaz@example.com",
    },
    {
      nombre: "Valentina",
      apellido: "Fernández",
      telefono: "11-5555-9090",
      email: "valen.fernandez@example.com",
    },
    {
      nombre: "María",
      apellido: "García",
      telefono: "11-5555-2020",
      email: "maria.garcia@example.com",
    },
    {
      nombre: "Sofía",
      apellido: "Gómez",
      telefono: "11-5555-7070",
      email: "sofia.gomez@example.com",
    },
    {
      nombre: "Ana",
      apellido: "López",
      telefono: "11-5555-4040",
      email: "ana.lopez@example.com",
    },
    {
      nombre: "Lucía",
      apellido: "Martínez",
      telefono: "11-5555-5050",
      email: "lucia.martinez@example.com",
    },
    {
      nombre: "Juan",
      apellido: "Pérez",
      telefono: "11-5555-6060",
      email: "juan.perez@example.com",
    },
    {
      nombre: "Carlos",
      apellido: "Rodríguez",
      telefono: "11-5555-3030",
      email: "carlos.rodriguez@example.com",
    },
    {
      nombre: "Mateo",
      apellido: "Ruiz",
      telefono: "11-5555-1010",
      email: "mateo.ruiz@example.com",
    },
    {
      nombre: "Sabrina",
      apellido: "Alonso",
      telefono: "11-5555-1111",
      email: "sabrina.alonso@example.com",
    },
  ];

  /* -------------------- DOM -------------------- */
  const $search = document.getElementById("search");
  const $btnAdd = document.getElementById("btn-add");
  const $cards = document.getElementById("cards-container");

  const $dialog = document.getElementById("contact-dialog");
  const $form = document.getElementById("contact-form");
  const $btnCancel = document.getElementById("btn-cancel");

  const $id = document.getElementById("contact-id");
  const $nombre = document.getElementById("nombre");
  const $apellido = document.getElementById("apellido");
  const $telefono = document.getElementById("telefono");
  const $email = document.getElementById("email");

  /* -------------------- Estado (Agenda) -------------------- */
  let agenda = new Agenda(SAMPLE);

  /* -------------------- Render -------------------- */

  function svgEdit() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>`;
  }

  function svgDelete() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>`;
  }

  function renderList(list) {
    $cards.innerHTML = "";
    if (!list || list.length === 0) {
      $cards.innerHTML = `<p>No hay contactos que coincidan.</p>`;
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach((c) => {
      const article = document.createElement("article");
      article.className = "card";
      article.dataset.id = c.id;
      article.tabIndex = 0;

      article.innerHTML = `
        <div class="card-top">
          <strong class="card-name">${esc(c.nombre)} ${esc(c.apellido)}</strong>
        </div>

        <div class="card-body">
          <div class="meta"><span class="icon-circle" aria-hidden="true">📞</span><span class="meta-text">${esc(
            c.telefono
          )}</span></div>
          <div class="meta"><span class="icon-circle" aria-hidden="true">✉️</span><span class="meta-text">${esc(
            c.email
          )}</span></div>
        </div>

        <footer class="card-actions" role="group" aria-label="Acciones del contacto">
          <button class="icon-btn edit" data-action="edit" aria-label="Editar contacto">${svgEdit()}</button>
          <button class="icon-btn delete" data-action="delete" aria-label="Borrar contacto">${svgDelete()}</button>
        </footer>
      `;

      frag.appendChild(article);
    });

    $cards.appendChild(frag);
  }

  /* -------------------- Eventos UI -------------------- */

  function refresh() {
    // mantener la búsqueda actual
    const q = $search.value || "";
    const results = agenda.buscar(q);
    renderList(results);
  }

  $search.addEventListener("input", () => refresh());

  $btnAdd.addEventListener("click", () => {
    openForCreate();
  });

  // Delegación de botones en cards
  $cards.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const article = btn.closest(".card");
    if (!article) return;
    const id = article.dataset.id;
    if (action === "edit") openForEdit(id);
    else if (action === "delete") {
      agenda.borrar(id); // borra sin confirmación (requisito)
      refresh();
    }
  });

  // Form submit
  $form.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const data = {
      nombre: $nombre.value.trim(),
      apellido: $apellido.value.trim(),
      telefono: $telefono.value.trim(),
      email: $email.value.trim(),
    };

    const idVal = $id.value || null;
    if (idVal) {
      agenda.actualizar(idVal, data);
    } else {
      agenda.agregar(data);
    }

    $dialog.close();
    resetForm();
    refresh();
  });

  // Cancel
  $btnCancel.addEventListener("click", () => {
    $dialog.close();
    resetForm();
  });

  // ESC cierra dialog (accesibilidad)
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && $dialog.open) {
      $dialog.close();
      resetForm();
    }
  });

  /* -------------------- Dialog helpers -------------------- */
  function openForCreate() {
    $form.querySelector("#dialog-title").textContent = "Agregar contacto";
    $id.value = "";
    $nombre.value = "";
    $apellido.value = "";
    $telefono.value = "";
    $email.value = "";
    $dialog.showModal();
    $nombre.focus();
  }

  function openForEdit(id) {
    const c = agenda.contactos.find((x) => x.id === id);
    if (!c) return;
    $form.querySelector("#dialog-title").textContent = "Editar contacto";
    $id.value = c.id;
    $nombre.value = c.nombre;
    $apellido.value = c.apellido;
    $telefono.value = c.telefono;
    $email.value = c.email;
    $dialog.showModal();
    $nombre.focus();
  }

  function resetForm() {
    $id.value = "";
    $form.reset();
  }

  /* -------------------- Inicialización -------------------- */
  function init() {
    renderList(agenda.getTodos());
  }

  // DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
