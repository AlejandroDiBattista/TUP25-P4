// ====== Clase Contacto ======
class Contacto {
  constructor(id, nombre, apellido, telefono, email) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
  }
}

// ====== Clase Agenda ======
class Agenda {
  constructor() {
    this.contactos = [];
    this.cargar();
  }

  // Cargar desde localStorage o inicializar con 10 contactos
  cargar() {
    const data = localStorage.getItem("agenda");
    if (data) {
      this.contactos = JSON.parse(data);
    } else {
      this.contactos = [
        new Contacto(1, "Agustín", "Moreno", "11-4444-1000", "agustin.moreno@example.com"),
        new Contacto(2, "Camila", "Vega", "11-4444-2000", "camila.vega@example.com"),
        new Contacto(3, "Tomás", "Silva", "11-4444-3000", "tomas.silva@example.com"),
        new Contacto(4, "Julieta", "Torres", "11-4444-4000", "julieta.torres@example.com"),
        new Contacto(5, "Nicolás", "Sosa", "11-4444-5000", "nicolas.sosa@example.com"),
        new Contacto(6, "Valeria", "Ramos", "11-4444-6000", "valeria.ramos@example.com"),
        new Contacto(7, "Francisco", "Medina", "11-4444-7000", "francisco.medina@example.com"),
        new Contacto(8, "Carolina", "Herrera", "11-4444-8000", "carolina.herrera@example.com"),
        new Contacto(9, "Lautaro", "Domínguez", "11-4444-9000", "lautaro.dominguez@example.com"),
        new Contacto(10, "Milagros", "Castro", "11-4444-1010", "milagros.castro@example.com"),
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

// ====== Lógica de UI ======
const agenda = new Agenda();
const lista = document.getElementById("listaContactos");
const busqueda = document.getElementById("busqueda");
const dialogo = document.getElementById("dialogoContacto");
const form = document.getElementById("formContacto");
const btnAgregar = document.getElementById("btnAgregar");
const btnCancelar = document.getElementById("btnCancelar");

// Renderizar lista
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

// Buscar en tiempo real
busqueda.addEventListener("input", () => {
  render(agenda.buscar(busqueda.value));
});

// Abrir diálogo para nuevo contacto
btnAgregar.addEventListener("click", () => {
  form.reset();
  document.getElementById("contactoId").value = "";
  document.getElementById("dialogoTitulo").innerText = "Nuevo contacto";
  dialogo.showModal();
});

// Cancelar diálogo
btnCancelar.addEventListener("click", () => dialogo.close());

// Guardar (alta/edición)
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

// Delegar eventos en lista (editar/borrar)
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

// Inicial
render();
