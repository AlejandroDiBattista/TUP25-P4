'use strict';
// Funciones generales
(() => {
  
  const normalize = (str) =>
    (str ?? "")
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  
  class Contacto {
    constructor({ id, nombre, apellido, telefono, email }) {
      this.id = id ?? crypto.randomUUID();
      this.nombre = nombre;
      this.apellido = apellido;
      this.telefono = telefono;
      this.email = email;
    }

   
    get _nNombre() { return normalize(this.nombre); }
    get _nApellido() { return normalize(this.apellido); }
    get _nTelefono() { return normalize(this.telefono); }
    get _nEmail() { return normalize(this.email); }
  }

  class Agenda {
    #items = [];

    constructor(contactosIniciales = []) {
      this.#items = contactosIniciales.map((c) => new Contacto(c));
      this.#ordenar();
    }

    listar() {
      return [...this.#items];
    }

    buscar(texto) {
      const q = normalize(texto);
      if (!q) return this.listar();

      return this.#items.filter((c) =>
        c._nNombre.includes(q) ||
        c._nApellido.includes(q) ||
        c._nTelefono.includes(q) ||
        c._nEmail.includes(q)
      );
    }

    agregar(data) {
      const c = new Contacto(data);
      this.#items.push(c);
      this.#ordenar();
      return c;
    }

    actualizar(id, data) {
      const idx = this.#items.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      this.#items[idx] = new Contacto({ id, ...data });
      this.#ordenar();
      return true;
    }

    borrar(id) {
      const idx = this.#items.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      this.#items.splice(idx, 1);
      return true;
    }

    #ordenar() {
      this.#items.sort((a, b) => {
        const porApellido = a._nApellido.localeCompare(b._nApellido, "es");
        if (porApellido !== 0) return porApellido;
        return a._nNombre.localeCompare(b._nNombre, "es");
      });
    }
  }

 
  const DATA_INICIAL = [
    { nombre: "Diego", apellido: "Díaz", telefono: "11-5555-8080", email: "diego.diaz@example.com" },
    { nombre: "Valentina", apellido: "Fernández", telefono: "11-5555-9090", email: "valen.fernandez@example.com" },
    { nombre: "María", apellido: "García", telefono: "11-5555-2020", email: "maria.garcia@example.com" },
    { nombre: "Sofía", apellido: "Gómez", telefono: "11-5555-7070", email: "sofia.gomez@example.com" },
    { nombre: "Ana", apellido: "López", telefono: "11-5555-4040", email: "ana.lopez@example.com" },
    { nombre: "Lucía", apellido: "Martínez", telefono: "11-5555-5050", email: "lucia.martinez@example.com" },
    { nombre: "Juan", apellido: "Pérez", telefono: "11-5555-6060", email: "juan.perez@example.com" },
    { nombre: "Carlos", apellido: "Rodríguez", telefono: "11-5555-3030", email: "carlos.rodriguez@example.com" },
    { nombre: "Mateo", apellido: "Ruiz", telefono: "11-5555-1010", email: "mateo.ruiz@example.com" },
    { nombre: "Camila", apellido: "Sánchez", telefono: "11-5555-9091", email: "camila.sanchez@example.com" },
  ];

 
  const agenda = new Agenda(DATA_INICIAL);

 
  const $lista = document.getElementById("lista");
  const $buscador = document.getElementById("buscador");
  const $btnAgregar = document.getElementById("btnAgregar");

  const $dlg = document.getElementById("dlgContacto");
  const $frm = document.getElementById("frmContacto");
  const $dlgTitulo = document.getElementById("dlgTitulo");
  const $btnCancelar = document.getElementById("btnCancelar");

  
  const crearCard = (c) => {
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <header>${c.nombre} ${c.apellido}</header>
      <p class="muted">☎ ${c.telefono}</p>
      <p class="muted">✉ ${c.email}</p>
      <div class="icon-btns">
        <button class="icon-btn editar" data-id="${c.id}" aria-label="Editar ${c.nombre} ${c.apellido}">✏️ Editar</button>
        <button class="icon-btn borrar" data-id="${c.id}" aria-label="Borrar ${c.nombre} ${c.apellido}">🗑️ Borrar</button>
      </div>
    `;
    return el;
  };

  const render = (items) => {
    $lista.replaceChildren();
    items.forEach((c) => $lista.appendChild(crearCard(c)));
  };

  
  render(agenda.listar());

  
  $buscador.addEventListener("input", (e) => {
    const q = e.target.value;
    render(agenda.buscar(q));
  });

  
  $btnAgregar.addEventListener("click", () => {
    $frm.reset();
    $frm.id.value = "";
    $dlgTitulo.textContent = "Nuevo contacto";
    $dlg.showModal();
    $frm.nombre.focus();
  });

 
  $lista.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    if (btn.classList.contains("borrar")) {
      // Borrado directo, sin confirmación
      agenda.borrar(id);
      render(agenda.buscar($buscador.value));
      return;
    }

    if (btn.classList.contains("editar")) {
      const c = agenda.listar().find((x) => x.id === id);
      if (!c) return;
      $frm.id.value = c.id;
      $frm.nombre.value = c.nombre;
      $frm.apellido.value = c.apellido;
      $frm.telefono.value = c.telefono;
      $frm.email.value = c.email;
      $dlgTitulo.textContent = "Editar contacto";
      $dlg.showModal();
      $frm.nombre.focus();
    }
  });

 
  $frm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      nombre: $frm.nombre.value.trim(),
      apellido: $frm.apellido.value.trim(),
      telefono: $frm.telefono.value.trim(),
      email: $frm.email.value.trim(),
    };

    const id = $frm.id.value || null;
    if (id) {
      agenda.actualizar(id, data);
    } else {
      agenda.agregar(data);
    }

    $dlg.close();
    render(agenda.buscar($buscador.value));
    $frm.reset();
  });

 
  $btnCancelar.addEventListener("click", () => {
    $dlg.close();
    $frm.reset();
  });
})();