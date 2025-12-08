
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

  actualizar(contactoActualizado) {
    this.contactos = this.contactos.map(c =>
      c.id === contactoActualizado.id ? contactoActualizado : c
    );
    this.ordenar();
  }

  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }

  buscar(texto) {
    const normalizar = s =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const t = normalizar(texto);

    return this.contactos.filter(c =>
      [c.nombre, c.apellido, c.telefono, c.email]
        .some(campo => normalizar(campo).includes(t))
    );
  }

  ordenar() {
    this.contactos.sort((a, b) =>
      a.apellido.localeCompare(b.apellido, "es", { sensitivity: "base" }) ||
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
    );
  }
}
const agenda = new Agenda();
const ejemplos = [
  ["Martina", "Acosta", "3815818527", "martuacosta@mail.com"],
  ["María", "Gómez", "3812222222", "maria@mail.com"],
  ["Carlos", "Rodríguez", "3813333333", "carlos@mail.com"],
  ["Ana", "López", "3814444444", "ana@mail.com"],
  ["Luis", "Martínez", "3815555555", "luis@mail.com"],
  ["Laura", "Fernández", "3816666666", "laura@mail.com"],
  ["Pedro", "García", "3817777777", "pedro@mail.com"],
  ["Sofía", "Ruiz", "3818888888", "sofia@mail.com"],
  ["Diego", "Torres", "3819999999", "diego@mail.com"],
  ["Valeria", "Sánchez", "3811234567", "valeria@mail.com"]
];

ejemplos.forEach((e, i) =>
  agenda.agregar(new Contacto(Date.now() + i, e[0], e[1], e[2], e[3]))
);

const listado = document.getElementById("listadoContactos");
const buscador = document.getElementById("buscador");
const btnAgregar = document.getElementById("btnAgregar");
const dialogo = document.getElementById("dialogoContacto");
const form = document.getElementById("formContacto");
const btnCancelar = document.getElementById("btnCancelar");
const tituloDialogo = document.getElementById("tituloDialogo");

function renderContactos(lista = agenda.contactos) {
  listado.innerHTML = "";
  lista.forEach(c => {
    const card = document.createElement("article");
    card.innerHTML = `
      <header>
        <strong>${c.nombre} ${c.apellido}</strong>
      </header>
      <p>📞 ${c.telefono}</p>
      <p>✉️ ${c.email}</p>
      <footer>
        <button class="editar" data-id="${c.id}">✏️</button>
        <button class="borrar" data-id="${c.id}">🗑️</button>
      </footer>
    `;
    listado.appendChild(card);
  });
}

buscador.addEventListener("input", () => {
  const texto = buscador.value.trim();
  renderContactos(texto ? agenda.buscar(texto) : agenda.contactos);
});

btnAgregar.addEventListener("click", () => {
  form.reset();
  document.getElementById("contactoId").value = "";
  tituloDialogo.textContent = "Nuevo Contacto";
  dialogo.showModal();
});

btnCancelar.addEventListener("click", () => dialogo.close());

form.addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("contactoId").value;
  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const telefono = document.getElementById("telefono").value;
  const email = document.getElementById("email").value;

  if (id) {
    agenda.actualizar(new Contacto(Number(id), nombre, apellido, telefono, email));
  } else {
    agenda.agregar(new Contacto(Date.now(), nombre, apellido, telefono, email));
  }

  renderContactos();
  dialogo.close();
});

listado.addEventListener("click", e => {
  if (e.target.classList.contains("editar")) {
    const id = Number(e.target.dataset.id);
    const c = agenda.contactos.find(c => c.id === id);
    if (c) {
      document.getElementById("contactoId").value = c.id;
      document.getElementById("nombre").value = c.nombre;
      document.getElementById("apellido").value = c.apellido;
      document.getElementById("telefono").value = c.telefono;
      document.getElementById("email").value = c.email;
      tituloDialogo.textContent = "Editar Contacto";
      dialogo.showModal();
    }
  }

  if (e.target.classList.contains("borrar")) {
    const id = Number(e.target.dataset.id);
    agenda.borrar(id);
    renderContactos();
  }
});

renderContactos();
