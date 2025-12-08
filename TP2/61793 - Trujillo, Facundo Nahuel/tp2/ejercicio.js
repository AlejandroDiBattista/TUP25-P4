
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
    this.cargar();
  }

  cargar() {
    const data = localStorage.getItem("agenda");
    if (data) {
      this.contactos = JSON.parse(data);
    } else {
      this.contactos = [
        new Contacto(1, "Diego", "Díaz", "3818575", "diego.diaz@gmail.com"),
        new Contacto(2, "Valentina", "Fernández", "23685567", "valen.fernandez@gmail.com"),
        new Contacto(3, "María", "García", "348695", "maria.garcia@gmail.com"),
        new Contacto(4, "Sofía", "Gómez", "38129586", "sofia.gomez@gmail.com"),
        new Contacto(5, "Ana", "López", "8593856", "ana.lopez@gmail.com"),
        new Contacto(6, "Lucía", "Martínez", "5647333", "lucia.martinez@gmail.com"),
        new Contacto(7, "Juan", "Pérez", "429175465", "juan.perez@gmail.com"),
        new Contacto(8, "Carlos", "Rodríguez", "3894564", "carlos.rodriguez@gmail.com"),
        new Contacto(9, "Mateo", "Ruiz", "5324252", "mateo.ruiz@gmail.com"),
        new Contacto(10, "Martina", "Suárez", "38123644", "martina.suarez@gmail.com"),
      ];
      this.guardar();
    }
  }

  guardar() {
    localStorage.setItem("agenda", JSON.stringify(this.contactos));
  }

  agregar(contacto) {
    contacto.id = Date.now();
    this.contactos.push(contacto);
    this.guardar();
  }

  actualizar(contacto) {
    const i = this.contactos.findIndex(c => c.id == contacto.id);
    if (i >= 0) {
      this.contactos[i] = contacto;
      this.guardar();
    }
  }

  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id != id);
    this.guardar();
  }

  buscar(texto) {
    const normalizar = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    texto = normalizar(texto);
    return this.contactos.filter(c =>
      normalizar(c.nombre).includes(texto) ||
      normalizar(c.apellido).includes(texto) ||
      normalizar(c.telefono).includes(texto) ||
      normalizar(c.email).includes(texto)
    );
  }

  listar() {
    return this.contactos.sort((a, b) =>
      a.apellido.localeCompare(b.apellido, "es") ||
      a.nombre.localeCompare(b.nombre, "es")
    );
  }
}

const agenda = new Agenda();
const lista = document.getElementById("listaContactos");
const busqueda = document.getElementById("busqueda");
const dialogo = document.getElementById("dialogoContacto");
const form = document.getElementById("formContacto");
const btnAgregar = document.getElementById("btnAgregar");
const btnCancelar = document.getElementById("btnCancelar");

function render(contactos = agenda.listar()) {
  lista.innerHTML = "";
  contactos.forEach(c => {
    const card = document.createElement("article");
    card.innerHTML = `
      <h4>${c.nombre} ${c.apellido}</h4>
      <p>📞 ${c.telefono}<br>✉️ ${c.email}</p>
      <footer>
        <button class="editar" data-id="${c.id}">✏️</button>
        <button class="borrar" data-id="${c.id}">🗑️</button>
      </footer>
    `;
    lista.appendChild(card);
  });
}

busqueda.addEventListener("input", () => {
  render(agenda.buscar(busqueda.value));
});

btnAgregar.addEventListener("click", () => {
  form.reset();
  document.getElementById("contactoId").value = "";
  document.getElementById("dialogoTitulo").innerText = "Nuevo contacto";
  dialogo.showModal();
});

btnCancelar.addEventListener("click", () => dialogo.close());

form.addEventListener("submit", e => {
  e.preventDefault();
  const contacto = new Contacto(
    document.getElementById("contactoId").value || Date.now(),
    document.getElementById("nombre").value,
    document.getElementById("apellido").value,
    document.getElementById("telefono").value,
    document.getElementById("email").value
  );

  if (agenda.contactos.some(c => c.id == contacto.id)) {
    agenda.actualizar(contacto);
  } else {
    agenda.agregar(contacto);
  }

  dialogo.close();
  render();
});

lista.addEventListener("click", e => {
  if (e.target.classList.contains("editar")) {
    const id = e.target.dataset.id;
    const c = agenda.contactos.find(x => x.id == id);
    if (c) {
      document.getElementById("contactoId").value = c.id;
      document.getElementById("nombre").value = c.nombre;
      document.getElementById("apellido").value = c.apellido;
      document.getElementById("telefono").value = c.telefono;
      document.getElementById("email").value = c.email;
      document.getElementById("dialogoTitulo").innerText = "Editar contacto";
      dialogo.showModal();
    }
  } else if (e.target.classList.contains("borrar")) {
    agenda.borrar(e.target.dataset.id);
    render();
  }
});


render();
