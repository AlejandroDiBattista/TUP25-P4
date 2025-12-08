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
    this.ultimoId = 0;
  }

  agregar({nombre, apellido, telefono, email}) {
    const contacto = new Contacto(++this.ultimoId, nombre, apellido, telefono, email);
    this.contactos.push(contacto);
    this.ordenar();
  }

  actualizar(id, datos) {
    const c = this.contactos.find(x => x.id === id);
    if (c) Object.assign(c, datos);
    this.ordenar();
  }

  borrar(id) {
    this.contactos = this.contactos.filter(x => x.id !== id);
  }

  buscar(texto) {
    texto = normalizar(texto);
    return this.contactos.filter(c =>
      normalizar(c.nombre).includes(texto) ||
      normalizar(c.apellido).includes(texto) ||
      normalizar(c.telefono).includes(texto) ||
      normalizar(c.email).includes(texto)
    );
  }

  ordenar() {
    this.contactos.sort((a, b) =>
      normalizar(a.apellido).localeCompare(normalizar(b.apellido)) ||
      normalizar(a.nombre).localeCompare(normalizar(b.nombre))
    );
  }
}

// --- Utilidades ---
function normalizar(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// --- Datos de ejemplo ---
function contactosEjemplo() {
  return [
    {nombre:"Juan",apellido:"Pérez",telefono:"3815551234",email:"jperez@gmail.com"},
    {nombre:"Joaquin",apellido:"Gómez",telefono:"3815551235",email:"jgomez@gmail.com"},
    {nombre:"Pedro",apellido:"Sánchez",telefono:"3815551236",email:"psanchez@gmail.com"},
    {nombre:"Alejandro",apellido:"Sabella",telefono:"3815343458",email:"alejandrosabella@gmail.com"},
    {nombre:"María",apellido:"López",telefono:"3815551237",email:"mlopez@gmail.com"},
    {nombre:"Lautaro",apellido:"Martínez",telefono:"3815551238",email:"lmartinez@gmail.com"},
    {nombre:"Carlos",apellido:"Auzqui",telefono:"3815551239",email:"cauzqui@gmail.com"},
    {nombre:"Ana",apellido:"Torres",telefono:"3815551240",email:"atorres@gmail.com"},
    {nombre:"Miguel",apellido:"Ramírez",telefono:"3815551241",email:"mramirez@gmail.com"},
    {nombre:"Santiago",apellido:"Castro",telefono:"3815551242",email:"scastro@gmail.com"}
  ];
}

// --- Renderizado ---
const agenda = new Agenda();
contactosEjemplo().forEach(c => agenda.agregar(c));

const listaContactos = document.getElementById("listaContactos");
const buscador = document.getElementById("buscador");
const btnAgregar = document.getElementById("btnAgregar");
const dialogo = document.getElementById("dialogoContacto");
const form = document.getElementById("formContacto");
const dialogoTitulo = document.getElementById("dialogoTitulo");
const btnCancelar = document.getElementById("btnCancelar");

function render() {
  const texto = buscador.value;
  const contactos = texto ? agenda.buscar(texto) : agenda.contactos;
  listaContactos.innerHTML = "";
  contactos.forEach(c => listaContactos.appendChild(cardContacto(c)));
}

function cardContacto(c) {
  const card = document.createElement("article");
  card.className = "card-contacto";

  // Header gris con nombre separado
  const header = document.createElement("div");
  header.className = "card-header";
  header.textContent = `${c.apellido}, ${c.nombre}`;

  // Datos con iconos, uno arriba del otro y alineados
  const datos = document.createElement("div");
  datos.className = "card-datos";
  datos.innerHTML = `
    <span>
      <svg class="icono" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C7.61 21 3 16.39 3 11a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.35.27 2.67.76 3.88a1 1 0 0 1-.21 1.11l-2.2 2.2z" fill="#1565c0"/></svg>
      ${c.telefono}
    </span>
    <span>
      <svg class="icono" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 8.25l7.12 6.16a1 1 0 0 0 1.36 0L20 8.25V18H4V8.25z" fill="#1565c0"/></svg>
      ${c.email}
    </span>
    <div class="card-actions">
      <button class="btn-icono" title="Editar" onclick="editarContacto(${c.id})">
        <svg class="icono" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      </button>
      <button class="btn-icono" title="Borrar" onclick="borrarContacto(${c.id})">
        <svg class="icono" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm2 3h14v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm3 2v9h2v-9H8zm4 0v9h2v-9h-2z" fill="#1565c0"/><path d="M9 2h6v2H9V2z" fill="#1565c0"/></svg>
      </button>
    </div>
  `;

  card.appendChild(header);
  card.appendChild(datos);
  return card;
}

// --- Acciones globales ---
window.editarContacto = function(id) {
  const c = agenda.contactos.find(x => x.id === id);
  if (!c) return;
  dialogoTitulo.textContent = "Editar contacto";
  form.contactoId.value = c.id;
  form.nombre.value = c.nombre;
  form.apellido.value = c.apellido;
  form.telefono.value = c.telefono;
  form.email.value = c.email;
  dialogo.showModal();
};

window.borrarContacto = function(id) {
  agenda.borrar(id);
  render();
};

btnAgregar.onclick = () => {
  dialogoTitulo.textContent = "Agregar contacto";
  form.contactoId.value = "";
  form.nombre.value = "";
  form.apellido.value = "";
  form.telefono.value = "";
  form.email.value = "";
  dialogo.showModal();
};

btnCancelar.onclick = () => {
  dialogo.close();
};

form.onsubmit = function(e) {
  e.preventDefault();
  const id = Number(form.contactoId.value);
  const datos = {
    nombre: form.nombre.value.trim(),
    apellido: form.apellido.value.trim(),
    telefono: form.telefono.value.trim(),
    email: form.email.value.trim()
  };
  if (id) {
    agenda.actualizar(id, datos);
  } else {
    agenda.agregar(datos);
  }
  dialogo.close();
  render();
};

buscador.oninput = render;

// Inicializa
render();