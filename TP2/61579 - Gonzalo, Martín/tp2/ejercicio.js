'use strict';
// Funciones generales
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
    const i = this.contactos.findIndex(c => c.id === id);
    if (i >= 0) {
      this.contactos[i] = { ...this.contactos[i], ...datos };
      this.ordenar();
    }
  }

  eliminar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }

  buscar(texto) {
    const normalizar = s => s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const t = normalizar(texto);
    return this.contactos.filter(c =>
      normalizar(c.nombre).includes(t) ||
      normalizar(c.apellido).includes(t) ||
      normalizar(c.telefono).includes(t) ||
      normalizar(c.email).includes(t)
    );
  }

  ordenar() {
    this.contactos.sort((a, b) =>
      a.apellido.localeCompare(b.apellido, "es", { sensitivity: "base" }) ||
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
    );
  }
}

// ---- UI ----
const agenda = new Agenda();
const lista = document.getElementById("listaContactos");
const search = document.getElementById("search");
const dialogo = document.getElementById("dialogo");
const form = document.getElementById("formContacto");
const btnAgregar = document.getElementById("btnAgregar");
const btnCancelar = document.getElementById("btnCancelar");
const dialogoTitulo = document.getElementById("dialogoTitulo");

function render(contactos = agenda.contactos) {
  lista.innerHTML = "";
  contactos.forEach(c => {
    const card = document.createElement("div");
    card.className = "card-contacto";
    card.innerHTML = `
      <h4>${c.nombre} ${c.apellido}</h4>
      <p>📞 ${c.telefono}</p>
      <p>✉️ ${c.email}</p>
      <div class="acciones">
        <button data-id="${c.id}" class="editar">✏️</button>
        <button data-id="${c.id}" class="borrar">🗑️</button>
      </div>
    `;
    lista.appendChild(card);
  });

  document.querySelectorAll(".borrar").forEach(b =>
    b.onclick = () => {
      agenda.eliminar(b.dataset.id);
      render();
    });

  document.querySelectorAll(".editar").forEach(b =>
    b.onclick = () => {
      const c = agenda.contactos.find(x => x.id === b.dataset.id);
      document.getElementById("contactoId").value = c.id;
      document.getElementById("nombre").value = c.nombre;
      document.getElementById("apellido").value = c.apellido;
      document.getElementById("telefono").value = c.telefono;
      document.getElementById("email").value = c.email;
      dialogoTitulo.textContent = "Editar contacto";
      dialogo.showModal();
    });
}

// ---- EVENTOS ----
btnAgregar.onclick = () => {
  form.reset();
  document.getElementById("contactoId").value = "";
  dialogoTitulo.textContent = "Nuevo contacto";
  dialogo.showModal();
};

btnCancelar.onclick = () => dialogo.close();

form.onsubmit = e => {
  e.preventDefault();
  const id = document.getElementById("contactoId").value || crypto.randomUUID();
  const datos = {
    id,
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value
  };

  if (document.getElementById("contactoId").value) {
    agenda.actualizar(id, datos);
  } else {
    agenda.agregar(new Contacto(...Object.values(datos)));
  }
  render();
  dialogo.close();
};

search.oninput = () => {
  const q = search.value.trim();
  render(q ? agenda.buscar(q) : agenda.contactos);
};

// ---- DATOS INICIALES ----
const iniciales = [
  ["1","Diego","Díaz","381-5555-808","diego.diaz@gmial..com"],
  ["2","Valentina","Fernández","381-5555-909","valen.fernandez@gmial..com"],
  ["3","María","García","381-5555-202","maria.garcia@gmial..com"],
  ["4","Sofía","Gómez","381-5555-707","sofia.gomez@gmial..com"],
  ["5","Ana","López","381-5555-404","ana.lopez@gmial..com"],
  ["6","Lucía","Martínez","381-5555-505","lucia.martinez@gmial..com"],
  ["7","Juan","Pérez","381-5555-303","juan.perez@gmial..com"],
  ["8","Carlos","Rodríguez","381-5555-606","carlos.rodriguez@gmial..com"],
  ["9","Mateo","Ruiz","381-5555-101","mateo.ruiz@gmial..com"],
  ["10","Laura","Suárez","381-5555-808","laura.suarez@gmial.com"]
];
iniciales.forEach(c => agenda.agregar(new Contacto(...c)));
render();