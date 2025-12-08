// ====== MODELO ======
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
    const index = this.contactos.findIndex(c => c.id === contactoActualizado.id);
    if (index !== -1) {
      this.contactos[index] = contactoActualizado;
      this.ordenar();
    }
  }

  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }

  buscar(texto) {
    const normalizar = (str) =>
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtro = normalizar(texto);
    return this.contactos.filter(c =>
      normalizar(c.nombre).includes(filtro) ||
      normalizar(c.apellido).includes(filtro) ||
      normalizar(c.telefono).includes(filtro) ||
      normalizar(c.email).includes(filtro)
    );
  }

  ordenar() {
    this.contactos.sort((a, b) => {
      const ap = a.apellido.localeCompare(b.apellido, "es", { sensitivity: "base" });
      return ap !== 0 ? ap : a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
    });
  }
}

// ====== CONTROLADOR / VISTA ======
const agenda = new Agenda();

// Contactos iniciales
const contactosEjemplo = [
  ["Cristian", "Pérez", "111-111", "Cristian@mail.com"],
  ["Ana", "Gimenez", "222-222", "ana@mail.com"],
  ["Pedro", "Gómez", "333-333", "pedro@mail.com"],
  ["Juana", "Martínez", "444-444", "lucia@mail.com"],
  ["Diego", "Suárez", "555-555", "diego@mail.com"],
  ["Julieta", "Fernández", "666-666", "carla@mail.com"],
  ["Marcos", "Palermo", "777-777", "marcos@mail.com"],
  ["Micaela", "Torres", "888-888", "sofia@mail.com"],
  ["Mateo", "Ramírez", "999-999", "mateo@mail.com"],
  ["Valentina", "Salle", "101-101", "valen@mail.com"],
];

contactosEjemplo.forEach((c, i) => {
  agenda.agregar(new Contacto(i + 1, ...c));
});

// Elementos del DOM
const listaContactos = document.getElementById("listaContactos");
const buscador = document.getElementById("buscador");
const dialogo = document.getElementById("dialogoContacto");
const form = document.getElementById("formContacto");
const btnAgregar = document.getElementById("btnAgregar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloDialogo = document.getElementById("tituloDialogo");

// Renderizar contactos
function render(contactos) {
  listaContactos.innerHTML = "";
  contactos.forEach(c => {
    const card = document.createElement("article");
    card.innerHTML = `
      <header>
        <strong>${c.nombre} ${c.apellido}</strong>
      </header>
      <p>📞 ${c.telefono}</p>
      <p>📧 ${c.email}</p>
      <footer>
        <button data-id="${c.id}" class="editar">✏️</button>
        <button data-id="${c.id}" class="borrar">🗑️</button>
      </footer>
    `;
    listaContactos.appendChild(card);
  });
}

// Eventos
buscador.addEventListener("input", () => {
  const texto = buscador.value.trim();
  const filtrados = texto ? agenda.buscar(texto) : agenda.contactos;
  render(filtrados);
});

btnAgregar.addEventListener("click", () => {
  form.reset();
  document.getElementById("contactoId").value = "";
  tituloDialogo.textContent = "Nuevo Contacto";
  dialogo.showModal();
});

btnCancelar.addEventListener("click", () => dialogo.close());

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("contactoId").value;
  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const telefono = document.getElementById("telefono").value;
  const email = document.getElementById("email").value;

  if (id) {
    agenda.actualizar(new Contacto(parseInt(id), nombre, apellido, telefono, email));
  } else {
    const nuevoId = Date.now();
    agenda.agregar(new Contacto(nuevoId, nombre, apellido, telefono, email));
  }

  dialogo.close();
  render(agenda.contactos);
});

listaContactos.addEventListener("click", (e) => {
  if (e.target.classList.contains("borrar")) {
    const id = parseInt(e.target.dataset.id);
    agenda.borrar(id);
    render(agenda.contactos);
  }
  if (e.target.classList.contains("editar")) {
    const id = parseInt(e.target.dataset.id);
    const c = agenda.contactos.find(ct => ct.id === id);
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
});

// Render inicial
render(agenda.contactos);
