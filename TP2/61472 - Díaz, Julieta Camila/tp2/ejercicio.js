'use strict';
(() => {
  const norm = (s) =>
    (s ?? "")
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}+/gu, "")
      .toLowerCase()
      .trim();

  // ===== Modelo =====
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
    #items = [];
    constructor(seed = []) {
      this.#items = seed.map((c) => new Contacto(c));
      this.#ordenar();
    }
    #ordenar() {
      this.#items.sort((a, b) => {
        const ap = norm(a.apellido);
        const bp = norm(b.apellido);
        if (ap !== bp) return ap.localeCompare(bp, "es", { sensitivity: "base" });
        return norm(a.nombre).localeCompare(norm(b.nombre), "es", { sensitivity: "base" });
      });
    }
    listar(filtro = "") {
      const f = norm(filtro);
      if (!f) return [...this.#items];
      return this.#items.filter((c) =>
        [c.nombre, c.apellido, c.telefono, c.email].some((v) => norm(v).includes(f))
      );
    }
    agregar(contacto) {
      const nuevo = new Contacto(contacto);
      this.#items.push(nuevo);
      this.#ordenar();
      return nuevo;
    }
    actualizar(id, datos) {
      const idx = this.#items.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      this.#items[idx] = new Contacto({ id, ...datos });
      this.#ordenar();
      return true;
    }
    borrar(id) {
      const idx = this.#items.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      this.#items.splice(idx, 1);
      return true;
    }
  }

  // ===== Datos iniciales =====
  let autoId = 1;
  const uid = () => autoId++;
  const seed = [
    { id: uid(), nombre: "Diego", apellido: "Díaz", telefono: "11-5555-8080", email: "diego.diaz@example.com" },
    { id: uid(), nombre: "Valentina", apellido: "Fernández", telefono: "11-5555-9090", email: "valen.fernandez@example.com" },
    { id: uid(), nombre: "María", apellido: "García", telefono: "11-5555-2020", email: "maria.garcia@example.com" },
    { id: uid(), nombre: "Sofía", apellido: "Gómez", telefono: "11-5555-7070", email: "sofia.gomez@example.com" },
    { id: uid(), nombre: "Ana", apellido: "López", telefono: "11-5555-4040", email: "ana.lopez@example.com" },
    { id: uid(), nombre: "Lucía", apellido: "Martínez", telefono: "11-5555-5050", email: "lucia.martinez@example.com" },
    { id: uid(), nombre: "Juan", apellido: "Pérez", telefono: "11-5555-6060", email: "juan.perez@example.com" },
    { id: uid(), nombre: "Carlos", apellido: "Rodríguez", telefono: "11-5555-7071", email: "carlos.rodriguez@example.com" },
    { id: uid(), nombre: "Mateo", apellido: "Ruiz", telefono: "11-5555-8081", email: "mateo.ruiz@example.com" },
    { id: uid(), nombre: "Elena", apellido: "Torres", telefono: "11-5555-9091", email: "elena.torres@example.com" },
  ];
  const agenda = new Agenda(seed);

  // ===== Referencias UI =====
  const $search = document.getElementById("searchInput");
  const $cards = document.getElementById("cards");
  const $empty = document.getElementById("emptyMsg");
  const $addBtn = document.getElementById("addBtn");
  const $dialog = document.getElementById("contactDialog");
  const $form = document.getElementById("contactForm");
  const $cancelBtn = document.getElementById("cancelBtn");
  const $dialogTitle = document.getElementById("dialogTitle");

  let editingId = null;

  // ===== Render =====
  const render = () => {
    const filtro = $search.value;
    const data = agenda.listar(filtro);
    $cards.innerHTML = "";
    if (data.length === 0) {
      $empty.hidden = false;
      return;
    }
    $empty.hidden = true;
    data.forEach((c) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <header>
          <h3>${c.nombre} ${c.apellido}</h3>
          <div class="icon-row">
            <button class="icon-btn edit" title="Editar">✏️</button>
            <button class="icon-btn delete" title="Borrar">❌</button>
          </div>
        </header>
        <p class="meta">📞 ${c.telefono}</p>
        <p class="meta">✉️ ${c.email}</p>
      `;
      card.querySelector(".edit").addEventListener("click", () => openDialog(c));
      card.querySelector(".delete").addEventListener("click", () => {
        agenda.borrar(c.id);
        render();
      });
      $cards.appendChild(card);
    });
  };

  // ===== Diálogo =====
  const openDialog = (c = null) => {
    if (c) {
      editingId = c.id;
      $dialogTitle.textContent = "Editar contacto";
      $form.nombre.value = c.nombre;
      $form.apellido.value = c.apellido;
      $form.telefono.value = c.telefono;
      $form.email.value = c.email;
    } else {
      editingId = null;
      $dialogTitle.textContent = "Nuevo contacto";
      $form.reset();
    }
    $dialog.showModal();
  };

  $addBtn.addEventListener("click", () => openDialog());
  $cancelBtn.addEventListener("click", () => $dialog.close());
  $form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
      nombre: $form.nombre.value,
      apellido: $form.apellido.value,
      telefono: $form.telefono.value,
      email: $form.email.value,
    };
    if (editingId) agenda.actualizar(editingId, datos);
    else agenda.agregar({ id: uid(), ...datos });
    $dialog.close();
    render();
  });
  $search.addEventListener("input", render);

  // inicial
  render();
})();
