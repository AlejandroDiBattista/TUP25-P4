'use strict';
// Funciones generales
(() => {
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
      const idx = this.contactos.findIndex(c => c.id === id);
      if (idx !== -1) {
        this.contactos[idx] = { ...this.contactos[idx], ...datos };
        this.ordenar();
      }
    }

    borrar(id) {
      this.contactos = this.contactos.filter(c => c.id !== id);
    }

    buscar(texto) {
      const normalizar = s => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
      const q = normalizar(texto);
      return this.contactos.filter(c =>
        normalizar(c.nombre).includes(q) ||
        normalizar(c.apellido).includes(q) ||
        normalizar(c.telefono).includes(q) ||
        normalizar(c.email).includes(q)
      );
    }

    ordenar() {
      this.contactos.sort((a, b) => {
        const cmp = a.apellido.localeCompare(b.apellido, "es", { sensitivity: "base" });
        return cmp !== 0 ? cmp : a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
      });
    }
  }

  // --- Variables globales ---
  const agenda = new Agenda();
  const $cards = document.getElementById("cards");
  const $dlg = document.getElementById("dlgContacto");
  const $frm = document.getElementById("frmContacto");
  const $tituloDlg = document.getElementById("dlgTitulo");
  const $btnAgregar = document.getElementById("btnAgregar");
  const $btnCancelar = document.getElementById("btnCancelar");
  const $txtBuscar = document.getElementById("txtBuscar");

  // --- Datos iniciales ---
  const ejemplos = [
    ["Ana", "García", "381111111", "ana@mail.com"],
    ["Luis", "Pérez", "381222222", "luis@mail.com"],
    ["María", "López", "381333333", "maria@mail.com"],
    ["Pedro", "Rodríguez", "381444444", "pedro@mail.com"],
    ["Sofía", "Martínez", "381555555", "sofia@mail.com"],
    ["Carlos", "Ruiz", "381666666", "carlos@mail.com"],
    ["Laura", "Fernández", "381777777", "laura@mail.com"],
    ["Diego", "Sánchez", "381888888", "diego@mail.com"],
    ["Valeria", "Torres", "381999999", "valeria@mail.com"],
    ["Martín", "Silva", "381000000", "martin@mail.com"],
  ];
  ejemplos.forEach(([n, a, t, e], i) => agenda.agregar(new Contacto(i + 1, n, a, t, e)));

  // --- Renderizado ---
  function renderListado(list) {
    $cards.innerHTML = "";

    // 👇 Mensaje si no hay contactos
    if (list.length === 0) {
      const msg = document.createElement("p");
      msg.textContent = "No se encontraron contactos.";
      msg.style.fontStyle = "italic";
      $cards.appendChild(msg);
      return;
    }

    list.forEach(c => {
      const card = document.createElement("article");
      card.innerHTML = `
        <h4>${c.nombre} ${c.apellido}</h4>
        <p>📞 ${c.telefono}<br>✉️ ${c.email}</p>
        <footer>
          <button class="icon-btn edit" data-id="${c.id}" title="Editar">✏️</button>
          <button class="icon-btn delete" data-id="${c.id}" title="Borrar">🗑️</button>
        </footer>
      `;
      $cards.appendChild(card);
    });
  }

  function refrescar() {
    const q = $txtBuscar.value.trim();
    const list = q ? agenda.buscar(q) : agenda.contactos;
    renderListado(list);
  }

  // --- Eventos ---
  $btnAgregar.addEventListener("click", () => {
    $tituloDlg.textContent = "Nuevo Contacto";
    $frm.reset();
    document.getElementById("contactoId").value = "";
    $dlg.showModal();
  });

  $btnCancelar.addEventListener("click", () => $dlg.close());

  $frm.addEventListener("submit", e => {
    e.preventDefault();
    const id = document.getElementById("contactoId").value;
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const email = document.getElementById("email").value.trim();

    // 👇 Validaciones extra
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      alert("Por favor, ingrese un email válido.");
      return;
    }
    if (telefono.length < 5) {
      alert("Por favor, ingrese un teléfono válido.");
      return;
    }

    if (id) {
      agenda.actualizar(parseInt(id), { nombre, apellido, telefono, email });
    } else {
      const nuevoId = agenda.contactos.length ? Math.max(...agenda.contactos.map(c => c.id)) + 1 : 1;
      agenda.agregar(new Contacto(nuevoId, nombre, apellido, telefono, email));
    }
    refrescar();
    $dlg.close();
  });

  $cards.addEventListener("click", e => {
    if (e.target.classList.contains("edit")) {
      const id = parseInt(e.target.dataset.id);
      const c = agenda.contactos.find(x => x.id === id);
      if (c) {
        $tituloDlg.textContent = "Editar Contacto";
        document.getElementById("contactoId").value = c.id;
        document.getElementById("nombre").value = c.nombre;
        document.getElementById("apellido").value = c.apellido;
        document.getElementById("telefono").value = c.telefono;
        document.getElementById("email").value = c.email;
        $dlg.showModal();
      }
    }
    if (e.target.classList.contains("delete")) {
      const id = parseInt(e.target.dataset.id);
      agenda.borrar(id);
      refrescar();
    }
  });

  $txtBuscar.addEventListener("input", refrescar);

  // --- Inicial ---
  refrescar();
})();
