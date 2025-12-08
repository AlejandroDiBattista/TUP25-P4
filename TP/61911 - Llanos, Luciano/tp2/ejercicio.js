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
  }
  actualizar(id, datos) {
    const i = this.contactos.findIndex(c => c.id === id);
    if (i >= 0) this.contactos[i] = { ...this.contactos[i], ...datos };
  }
  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }
  buscar(texto) {
    const t = texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    return this.contactos.filter(c =>
      [c.nombre, c.apellido, c.telefono, c.email]
        .join(" ")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .includes(t)
    );
  }
  ordenados() {
    return [...this.contactos].sort((a, b) => {
      const ap = a.apellido.localeCompare(b.apellido, "es", { sensitivity: "base" });
      return ap !== 0 ? ap : a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
    });
  }
}

const agenda = new Agenda();
const contactosEjemplo = [

];
contactosEjemplo.forEach((c,i) => agenda.agregar(new Contacto(i+1, ...c)));

const contenedor = document.getElementById("contactos");
const inputBuscar = document.getElementById("buscar");
const dialogo = document.getElementById("dialogo");
const form = document.getElementById("formContacto");
const btnAgregar = document.getElementById("btnAgregar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloDialogo = document.getElementById("dialogoTitulo");

let editandoId = null;

function render() {
  const lista = inputBuscar.value ? agenda.buscar(inputBuscar.value) : agenda.ordenados();
  contenedor.innerHTML = "";
  lista.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${c.nombre} ${c.apellido}</strong>
      <div>📞 ${c.telefono}</div>
      <div>✉️ ${c.email}</div>
      <div class="acciones">
        <button title="Editar">✏️</button>
        <button title="Borrar">🗑️</button>
      </div>
    `;
    const [btnEditar, btnBorrar] = card.querySelectorAll("button");
    btnEditar.onclick = () => abrirDialogo(c);
    btnBorrar.onclick = () => { agenda.borrar(c.id); render(); };
    contenedor.appendChild(card);
  });
}

function abrirDialogo(c=null) {
  if (c) {
    editandoId = c.id;
    tituloDialogo.textContent = "Editar contacto";
    form.id.value = c.id;
    form.nombre.value = c.nombre;
    form.apellido.value = c.apellido;
    form.telefono.value = c.telefono;
    form.email.value = c.email;
  } else {
    editandoId = null;
    tituloDialogo.textContent = "Nuevo contacto";
    form.reset();
  }
  dialogo.showModal();
}

form.onsubmit = e => {
  e.preventDefault();
  const datos = {
    nombre: form.nombre.value,
    apellido: form.apellido.value,
    telefono: form.telefono.value,
    email: form.email.value
  };
  if (editandoId) {
    agenda.actualizar(editandoId, datos);
  } else {
    agenda.agregar(new Contacto(Date.now(), datos.nombre, datos.apellido, datos.telefono, datos.email));
  }
  dialogo.close();
  render();
};

btnAgregar.onclick = () => abrirDialogo();
btnCancelar.onclick = () => dialogo.close();
inputBuscar.oninput = render;

render();
