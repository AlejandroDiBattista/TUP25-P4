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

  getNombreCompleto() {
    return `${this.nombre} ${this.apellido}`;
  }
}

class Agenda {
  constructor(contactos = []) {
    this.contactos = contactos;
    this.ultimoId = contactos.length;
  }

  agregar(contacto) {
    this.ultimoId++;
    contacto.id = this.ultimoId;
    this.contactos.push(contacto);
  }

  actualizar(id, datos) {
    const c = this.contactos.find(c => c.id === id);
    if (c) {
      c.nombre = datos.nombre;
      c.apellido = datos.apellido;
      c.telefono = datos.telefono;
      c.email = datos.email;
    }
  }

  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }

  buscar(texto) {
    const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const t = norm(texto);
    return this.contactos.filter(c =>
      norm(c.nombre).includes(t) ||
      norm(c.apellido).includes(t) ||
      c.telefono.includes(texto) ||
      norm(c.email).includes(t)
    );
  }

  ordenados() {
    return [...this.contactos].sort((a, b) => {
      const cmpA = a.apellido.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const cmpB = b.apellido.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (cmpA === cmpB) {
        return a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
      }
      return cmpA.localeCompare(cmpB, "es", { sensitivity: "base" });
    });
  }
}


const agenda = new Agenda([
  new Contacto(1, "Diego", "Díaz", "1155558080", "diego.diaz@example.com"),
  new Contacto(2, "Valentina", "Fernández", "1155559090", "valen.fernandez@example.com"),
  new Contacto(3, "María", "García", "1155552020", "maria.garcia@example.com"),
  new Contacto(4, "Sofía", "Gómez", "1155557070", "sofia.gomez@example.com"),
  new Contacto(5, "Ana", "López", "1155554040", "ana.lopez@example.com"),
  new Contacto(6, "Lucía", "Martínez", "1155555050", "lucia.martinez@example.com"),
  new Contacto(7, "Juan", "Pérez", "1155553030", "juan.perez@example.com"),
  new Contacto(8, "Carlos", "Rodríguez", "1155551010", "carlos.rodriguez@example.com"),
  new Contacto(9, "Mateo", "Ruiz", "1155556060", "mateo.ruiz@example.com"),
  new Contacto(10, "Camila", "Torres", "1155558081", "camila.torres@example.com"),
]);


const contenedor = document.querySelector("#contactos");
const inputBusqueda = document.querySelector("#busqueda");
const btnAgregar = document.querySelector("#btnAgregar");
const dlg = document.querySelector("#dlgContacto");
const form = document.querySelector("#formContacto");
const dlgTitulo = document.querySelector("#dlgTitulo");

function render(lista) {
  contenedor.innerHTML = "";
  lista.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${c.getNombreCompleto()}</h4>
      <p>📞 ${c.telefono}</p>
      <p>✉️ ${c.email}</p>
      <div class="acciones">
        <button data-id="${c.id}" data-action="editar">✏️</button>
        <button data-id="${c.id}" data-action="borrar">🗑️</button>
      </div>
    `;
    contenedor.appendChild(card);
  });
}


inputBusqueda.addEventListener("input", () => {
  const texto = inputBusqueda.value;
  if (texto) {
    render(agenda.buscar(texto));
  } else {
    render(agenda.ordenados());
  }
});

btnAgregar.addEventListener("click", () => {
  dlgTitulo.textContent = "Agregar contacto";
  form.reset();
  document.querySelector("#contactoId").value = "";
  dlg.showModal();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = parseInt(document.querySelector("#contactoId").value);
  const datos = {
    nombre: document.querySelector("#nombre").value,
    apellido: document.querySelector("#apellido").value,
    telefono: document.querySelector("#telefono").value,
    email: document.querySelector("#email").value,
  };
  if (id) {
    agenda.actualizar(id, datos);
  } else {
    agenda.agregar(new Contacto(null, datos.nombre, datos.apellido, datos.telefono, datos.email));
  }
  dlg.close();
  render(agenda.ordenados());
});

form.addEventListener("reset", () => {
  dlg.close();
});

contenedor.addEventListener("click", (e) => {
  if (e.target.dataset.action === "editar") {
    const c = agenda.contactos.find(x => x.id == e.target.dataset.id);
    dlgTitulo.textContent = "Editar contacto";
    document.querySelector("#contactoId").value = c.id;
    document.querySelector("#nombre").value = c.nombre;
    document.querySelector("#apellido").value = c.apellido;
    document.querySelector("#telefono").value = c.telefono;
    document.querySelector("#email").value = c.email;
    dlg.showModal();
  }
  if (e.target.dataset.action === "borrar") {
    agenda.borrar(parseInt(e.target.dataset.id));
    render(agenda.ordenados());
  }
});


render(agenda.ordenados());

