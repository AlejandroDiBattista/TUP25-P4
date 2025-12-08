'use strict';
// Funciones generales

class Contacto {
  constructor(id, nombre, apellido, telefono, correo) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.correo = correo;
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

  actualizar(contacto) {
    const indice = this.contactos.findIndex(c => c.id === contacto.id);
    if (indice !== -1) {
      this.contactos[indice] = contacto;
      this.ordenar();
    }
  }

  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }

  buscar(texto) {
    const normalizar = str =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const t = normalizar(texto);
    return this.contactos.filter(
      c =>
        normalizar(c.nombre).includes(t) ||
        normalizar(c.apellido).includes(t) ||
        normalizar(c.telefono).includes(t) ||
        normalizar(c.correo).includes(t)
    );
  }

  ordenar() {
    this.contactos.sort((a, b) => {
      const ap = a.apellido.localeCompare(b.apellido, "es", {
        sensitivity: "base",
      });
      return ap === 0
        ? a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
        : ap;
    });
  }
}



const agenda = new Agenda();
let enEdicion = null;

const listaEl = document.getElementById("listaContactos");
const dialogo = document.getElementById("dialogoContacto");
const formulario = document.getElementById("formularioContacto");

const inputId = document.getElementById("idContacto");
const inputNombre = document.getElementById("nombre");
const inputApellido = document.getElementById("apellido");
const inputTelefono = document.getElementById("telefono");
const inputCorreo = document.getElementById("correo");



const contactosIniciales = [
  ["Antonela", "Soto", "387-517-0010", "antonelaa@gmail.com"],
  ["Valentina", "Fernández", "381-555-6668", "valen.fernandez@gmail.com"],
  ["María", "Espinosa", "387-590-9279", "maria.espinosa@hotmail.com"],
  ["Martina", "Stoessel", "11-5555-7070", "martina.stoessel@icloud.com"],
  ["Lucas", "Hermano", "385-555-4040", "luca-soto@gmail.com"],
  ["Lucía", "Martínez", "387-125-5556", "lucia.martinez@icloud.com"],
  ["Joaquin", "Pérez", "387-555-6060", "joaqo.perez@hotmail.com"],
  ["Carla", "Herrera", "381-123-3030", "carla.herrera@gmail.com"],
  ["Belen", "Portal", "381-543-1010", "belu.portal@icloud.com"],
  ["Gustavo", "Rueda", "387-5555-8081", "gustavo.rueda@gmail.com"],
];

contactosIniciales.forEach((c, i) => {
  agenda.agregar(new Contacto(i + 1, c[0], c[1], c[2], c[3]));
});
mostrar();

function mostrar(lista = agenda.contactos) {
  listaEl.innerHTML = "";
  lista.forEach(contacto => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    tarjeta.innerHTML = `
      <h3>${contacto.nombre} ${contacto.apellido}</h3>
      <p>📞 ${contacto.telefono}</p>
      <p>📧 ${contacto.correo}</p>
      <div class="acciones">
        <button class="editar">✏</button>
        <button class="borrar">🗑</button>
      </div>
    `;

    tarjeta.querySelector(".editar").onclick = () => editar(contacto);
    tarjeta.querySelector(".borrar").onclick = () => {
      agenda.borrar(contacto.id);
      mostrar();
    };

    listaEl.appendChild(tarjeta);
  });
}

document
  .getElementById("entradaBusqueda")
  .addEventListener("input", e => {
    const texto = e.target.value;
    mostrar(agenda.buscar(texto));
  });


  document.getElementById("btnAgregar").addEventListener("click", () => {
  enEdicion = null;
  formulario.reset();
  document.getElementById("tituloDialogo").textContent = "Agregar contacto";
  dialogo.showModal();
});


formulario.addEventListener("submit", e => {
  e.preventDefault();
  const contacto = new Contacto(
    enEdicion ? enEdicion.id : Date.now(),
    inputNombre.value,
    inputApellido.value,
    inputTelefono.value,
    inputCorreo.value
  );

  if (enEdicion) {
    agenda.actualizar(contacto);
  } else {
    agenda.agregar(contacto);
  }
  mostrar();
  dialogo.close();
});



document
  .getElementById("btnCancelar")
  .addEventListener("click", () => dialogo.close());

function editar(contacto) {
  enEdicion = contacto;
  document.getElementById("tituloDialogo").textContent = "Editar contacto";
  inputId.value = contacto.id;
  inputNombre.value = contacto.nombre;
  inputApellido.value = contacto.apellido;
  inputTelefono.value = contacto.telefono;
  inputCorreo.value = contacto.correo;
  dialogo.showModal();
}