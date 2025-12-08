class Contacto {
  constructor({id, nombre, apellido, telefono, email}) {
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
  agregar(datos) {
    const contacto = new Contacto({
      id: ++this.ultimoId,
      ...datos
    });
    this.contactos.push(contacto);
  }
  actualizar(id, datos) {
    const c = this.contactos.find(c => c.id === id);
    if (c) Object.assign(c, datos);
  }
  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
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
    this.contactos.sort((a, b) => {
      const apA = normalizar(a.apellido), apB = normalizar(b.apellido);
      if (apA === apB) return normalizar(a.nombre).localeCompare(normalizar(b.nombre));
      return apA.localeCompare(apB);
    });
  }
}
function normalizar(txt) {
  return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const agenda = new Agenda();
function cargarEjemplo() {
  [
    {nombre:"Diego",apellido:"Díaz",telefono:"11-5555-8080",email:"diego.diaz@example.com"},
    {nombre:"Valentina",apellido:"Fernández",telefono:"11-5555-9090",email:"valen.fernandez@example.com"},
    {nombre:"María",apellido:"García",telefono:"11-5555-2020",email:"maria.garcia@example.com"},
    {nombre:"Sofía",apellido:"Gómez",telefono:"11-5555-7070",email:"sofia.gomez@example.com"},
    {nombre:"Ana",apellido:"López",telefono:"11-5555-4040",email:"ana.lopez@example.com"},
    {nombre:"Lucía",apellido:"Martínez",telefono:"11-5555-5050",email:"lucia.martinez@example.com"},
    {nombre:"Juan",apellido:"Pérez",telefono:"11-5555-6060",email:"juan.perez@example.com"},
    {nombre:"Carlos",apellido:"Rodríguez",telefono:"11-5555-3030",email:"carlos.rodriguez@example.com"},
    {nombre:"Mateo",apellido:"Ruiz",telefono:"11-5555-1010",email:"mateo.ruiz@example.com"},
    {nombre:"Miguel",apellido:"Torres",telefono:"11-5555-2021",email:"miguel.torres@example.com"}
  ].forEach(e => agenda.agregar(e));
  agenda.ordenar();
}
cargarEjemplo();

const listado = document.getElementById('listado');
const buscador = document.getElementById('buscador');
const btnAgregar = document.getElementById('btnAgregar');
const dialogo = document.getElementById('dialogo');
const formulario = document.getElementById('formulario');
const cancelar = document.getElementById('cancelar');
const tituloDialogo = document.getElementById('tituloDialogo');
let modoEdicion = false;

function renderLista(filtro = "") {
  let contactos = filtro ? agenda.buscar(filtro) : agenda.contactos;
  agenda.ordenar();
  listado.innerHTML = contactos.map(c => `
    <article>
      <strong>${c.nombre} ${c.apellido}</strong>
      <div class="contact-info">
        <span>📞 ${c.telefono}</span>
        <span>✉️ ${c.email}</span>
      </div>
      <nav>
        <button class="icon-btn" onclick="editarContacto(${c.id})" aria-label="Editar">✏️</button>
        <button class="icon-btn" onclick="borrarContacto(${c.id})" aria-label="Borrar">🗑️</button>
      </nav>
    </article>
  `).join('');
}
window.editarContacto = function(id) {
  const c = agenda.contactos.find(c => c.id === id);
  if (!c) return;
  formulario.id.value = c.id;
  formulario.nombre.value = c.nombre;
  formulario.apellido.value = c.apellido;
  formulario.telefono.value = c.telefono;
  formulario.email.value = c.email;
  tituloDialogo.textContent = "Editar contacto";
  modoEdicion = true;
  dialogo.showModal();
};
window.borrarContacto = function(id) {
  agenda.borrar(id);
  renderLista(buscador.value);
};
btnAgregar.onclick = () => {
  formulario.reset();
  formulario.id.value = "";
  tituloDialogo.textContent = "Agregar contacto";
  modoEdicion = false;
  dialogo.showModal();
};
cancelar.onclick = () => dialogo.close();
formulario.onsubmit = e => {
  e.preventDefault();
  const datos = {
    nombre: formulario.nombre.value,
    apellido: formulario.apellido.value,
    telefono: formulario.telefono.value,
    email: formulario.email.value
  };
  if (modoEdicion && formulario.id.value) {
    agenda.actualizar(Number(formulario.id.value), datos);
  } else {
    agenda.agregar(datos);
  }
  dialogo.close();
  renderLista(buscador.value);
};
buscador.oninput = () => renderLista(buscador.value);
renderLista();