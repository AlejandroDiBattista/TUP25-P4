// =========================
// Modelo
// =========================
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
  
    actualizar(contacto) {
      const i = this.contactos.findIndex(c => c.id === contacto.id);
      if (i !== -1) {
        this.contactos[i] = contacto;
        this.ordenar();
      }
    }
  
    borrar(id) {
      this.contactos = this.contactos.filter(c => c.id !== id);
    }
  
    buscar(texto) {
      const normalizar = s => s.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
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
        const ap = a.apellido.localeCompare(b.apellido, "es", { sensitivity: "base" });
        return ap === 0 ? a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }) : ap;
      });
    }
  }
  
  // =========================
  // Lógica UI
  // =========================
  const agenda = new Agenda();
  let editing = false;
  
  const contactList = document.getElementById("contactList");
  const searchInput = document.getElementById("searchInput");
  const addBtn = document.getElementById("addBtn");
  const dialog = document.getElementById("contactDialog");
  const form = document.getElementById("contactForm");
  const cancelBtn = document.getElementById("cancelBtn");
  const dialogTitle = document.getElementById("dialogTitle");
  const idField = document.getElementById("contactId");
  
  // Renderizado
  function render(list = agenda.contactos) {
    contactList.innerHTML = "";
    list.forEach(c => {
      const card = document.createElement("div");
      card.className = "contact-card";
      card.innerHTML = `
        <div class="contact-info">
          <div class="contact-name">${c.nombre} ${c.apellido}</div>
          <div>${c.telefono} | ${c.email}</div>
        </div>
        <div class="contact-actions">
          <button data-id="${c.id}" class="edit">editar</button>
          <button data-id="${c.id}" class="delete">borrar</button>
        </div>
      `;
      contactList.appendChild(card);
    });
  }
  
  // Inicializar con 10 contactos
  function init() {
    const ejemplos = [
      ["Juan","Pérez","381123456","juan@example.com"],
      ["María","Gómez","381654321","maria@example.com"],
      ["Pedro","López","381987654","pedro@example.com"],
      ["Ana","Martínez","381555555","ana@example.com"],
      ["Lucas","Fernández","381444444","lucas@example.com"],
      ["Sofía","Ramírez","381333333","sofia@example.com"],
      ["Diego","Torres","381222222","diego@example.com"],
      ["Carla","Hernández","381111111","carla@example.com"],
      ["Martín","Ríos","381000000","martin@example.com"],
      ["Laura","Cruz","381999999","laura@example.com"]
    ];
    ejemplos.forEach((e, i) => agenda.agregar(new Contacto(i+1, ...e)));
    render();
  }
  
  // Eventos
  addBtn.addEventListener("click", () => {
    editing = false;
    form.reset();
    idField.value = "";
    dialogTitle.textContent = "Nuevo contacto";
    dialog.showModal();
  });
  
  cancelBtn.addEventListener("click", () => dialog.close());
  
  form.addEventListener("submit", e => {
    e.preventDefault();
    const id = idField.value ? parseInt(idField.value) : Date.now();
    const contacto = new Contacto(
      id,
      form.nombre.value,
      form.apellido.value,
      form.telefono.value,
      form.email.value
    );
    if (editing) agenda.actualizar(contacto);
    else agenda.agregar(contacto);
  
    dialog.close();
    render();
  });
  
  contactList.addEventListener("click", e => {
    if (e.target.classList.contains("edit")) {
      const c = agenda.contactos.find(x => x.id == e.target.dataset.id);
      if (!c) return;
      editing = true;
      dialogTitle.textContent = "Editar contacto";
      idField.value = c.id;
      form.nombre.value = c.nombre;
      form.apellido.value = c.apellido;
      form.telefono.value = c.telefono;
      form.email.value = c.email;
      dialog.showModal();
    }
    if (e.target.classList.contains("delete")) {
      agenda.borrar(parseInt(e.target.dataset.id));
      render();
    }
  });
  
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();
    render(q ? agenda.buscar(q) : agenda.contactos);
  });
  
  init();
