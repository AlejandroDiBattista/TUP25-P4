'use strict';
// =================== CLASES ===================

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

  agregarContacto(contacto) {
    this.contactos.push(contacto);
    this.ordenarContactos();
    this.guardarContactos();
  }

  actualizarContacto(contacto) {
    const index = this.contactos.findIndex(c => c.id === contacto.id);
    if (index !== -1) {
      this.contactos[index] = contacto;
      this.ordenarContactos();
      this.guardarContactos();
    } else {
      console.log("Contacto no encontrado");
    }
  }

  eliminarContacto(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
    this.guardarContactos();
  }

  buscarContacto(texto) {
    const normalizar = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    texto = normalizar(texto);
    return this.contactos.filter(c =>
      [c.nombre, c.apellido, c.telefono, c.email].some(campo =>
        normalizar(campo).includes(texto)
      )
    );
  }

  ordenarContactos() {
    this.contactos.sort((a, b) =>
      a.apellido.localeCompare(b.apellido, "es", { sensitivity: 'base' }) ||
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: 'base' })
    );
  }

  // Persistencia en localStorage
  guardarContactos() {
    localStorage.setItem("agenda", JSON.stringify(this.contactos));
  }

  cargarContactos() {
    const data = JSON.parse(localStorage.getItem("agenda"));
    if (data) {
      this.contactos = data.map(c => new Contacto(c.id, c.nombre, c.apellido, c.telefono, c.email));
    }
  }
}

// =================== DATOS INICIALES ===================
const agenda = new Agenda();
agenda.cargarContactos();

if (agenda.contactos.length === 0) {
  const contactosEjemplo = [
    ["Diego", "Díaz", "11-5555-8080", "diego.diaz@example.com"],
    ["Valentina", "Fernández", "11-5555-9090", "valen.fernandez@example.com"],
    ["María", "García", "11-5555-2020", "maria.garcia@example.com"],
    ["Sofía", "Gómez", "11-5555-7070", "sofia.gomez@example.com"],
    ["Ana", "López", "11-5555-4040", "ana.lopez@example.com"],
    ["Lucía", "Martínez", "11-5555-5050", "lucia.martinez@example.com"],
    ["Juan", "Pérez", "11-5555-6060", "juan.perez@example.com"],
    ["Carlos", "Rodríguez", "11-5555-3030", "carlos.rodriguez@example.com"],
    ["Mateo", "Ruiz", "11-5555-1010", "mateo.ruiz@example.com"],
    ["Laura", "Torres", "11-5555-8081", "laura.torres@example.com"],
  ];
  contactosEjemplo.forEach((c, i) =>
    agenda.agregarContacto(new Contacto(i + 1, c[0], c[1], c[2], c[3]))
  );
  agenda.guardarContactos();
}

// =================== UI ===================
const listaContactos = document.getElementById("listaContactos");
const buscarInput = document.getElementById("buscar");
const btnAgregar = document.getElementById("btnAgregar");
const dialogo = document.getElementById("dialogoContacto");
const form = document.getElementById("formContacto");
const dialogoTitulo = document.getElementById("dialogoTitulo");
const contactoId = document.getElementById("contactoId");

function render(contactos = agenda.contactos) {
  listaContactos.innerHTML = "";
  contactos.forEach(c => {
    const card = document.createElement("article");
    card.innerHTML = `
      <h4>${c.nombre} ${c.apellido}</h4>
      <p>📞 ${c.telefono}</p>
      <p>✉️ ${c.email}</p>
      <footer>
        <button class="editar" data-id="${c.id}" title="Editar">✏️</button>
        <button class="borrar" data-id="${c.id}" title="Borrar">🗑️</button>
      </footer>
    `;
    listaContactos.appendChild(card);
  });

  // Eventos botones
  document.querySelectorAll(".editar").forEach(btn =>
    btn.onclick = () => editarContacto(+btn.dataset.id)
  );
  document.querySelectorAll(".borrar").forEach(btn =>
    btn.onclick = () => { agenda.eliminarContacto(+btn.dataset.id); render(); }
  );
}

function editarContacto(id) {
  const c = agenda.contactos.find(c => c.id === id);
  if (!c) return;
  contactoId.value = c.id;
  document.getElementById("nombre").value = c.nombre;
  document.getElementById("apellido").value = c.apellido;
  document.getElementById("telefono").value = c.telefono;
  document.getElementById("email").value = c.email;
  dialogoTitulo.textContent = "Editar contacto";
  dialogo.showModal();
}

btnAgregar.onclick = () => {
  contactoId.value = "";
  form.reset();
  dialogoTitulo.textContent = "Nuevo contacto";
  dialogo.showModal();
};

form.onsubmit = e => {
  e.preventDefault();
  const id = contactoId.value ? +contactoId.value : Date.now();
  const contacto = new Contacto(
    id,
    document.getElementById("nombre").value,
    document.getElementById("apellido").value,
    document.getElementById("telefono").value,
    document.getElementById("email").value
  );
  if (contactoId.value) {
    agenda.actualizarContacto(contacto);
  } else {
    agenda.agregarContacto(contacto);
  }
  dialogo.close();
  render();
};

buscarInput.oninput = () => {
  const texto = buscarInput.value.trim();
  render(texto ? agenda.buscarContacto(texto) : agenda.contactos);
};

// Inicial
render();