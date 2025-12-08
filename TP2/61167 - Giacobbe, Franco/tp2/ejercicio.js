"use strict";
// Funciones generales

class Contacto {
  constructor({ nombre, apellido, telefono, email }) {
    this.nombre = nombre.toUpperCase();
    this.apellido = apellido.toUpperCase();
    this.telefono = telefono;
    this.email = email.toLowerCase();
  }

  get nombreCompleto() {
    return `${this.apellido} ${this.nombre}`;
  }

  includes(texto) {
    return (
      this.nombre.includes(texto.toUpperCase()) ||
      this.apellido.includes(texto.toUpperCase()) ||
      this.telefono.includes(texto) ||
      this.email.includes(texto.toLowerCase())
    );
  }
}

class Agenda {
  static ultimoId = 0;
  constructor() {
    this.contactos = [];
  }

  actualizar(contacto) {
    if (contacto.id) {
      const index = this.contactos.findIndex((c) => c.id === contacto.id);
      if (index !== -1) {
        this.contactos[index] = contacto;
      }
    } else {
      contacto.id = ++Agenda.ultimoId;
      this.contactos.push(contacto);
    }
  }

  eliminar(id) {
    const index = this.contactos.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.contactos.splice(index, 1);
    }
  }

  traer(id) {
    return this.contactos.find((c) => c.id === id);
  }

  traerTodos(filtro = "") {
    let lista = this.contactos.filter((c) => c.includes(filtro));
    return lista.sort((a, b) =>
      a.nombreCompleto.localeCompare(b.nombreCompleto)
    );
  }
}

let contactosIniciales = [
  {
    nombre: "Franco",
    apellido: "Giacobbe",
    telefono: "1234567890",
    email: "franco.giacobbe@example.com",
  },
  {
    nombre: "Juan",
    apellido: "Pérez",
    telefono: "0987654321",
    email: "juan.perez@example.com",
  },
  {
    nombre: "Ana",
    apellido: "Gómez",
    telefono: "5551234567",
    email: "ana.gomez@example.com",
  },
  {
    nombre: "Luis",
    apellido: "Martínez",
    telefono: "4445556666",
    email: "luis.martinez@example.com",
  },
  {
    nombre: "Solana",
    apellido: "García",
    telefono: "7778889999",
    email: "solana.garcia@example.com",
  },
  {
    nombre: "Martín",
    apellido: "López",
    telefono: "2223334444",
    email: "martin.lopez@example.com",
  },
  {
    nombre: "Valentina",
    apellido: "Martínez",
    telefono: "3334445555",
    email: "valentina.martinez@example.com",
  },
  {
    nombre: "Gonzalo",
    apellido: "Ramírez",
    telefono: "4445556666",
    email: "gonzalo.ramirez@example.com",
  },
  {
    nombre: "Sofía",
    apellido: "Torres",
    telefono: "5556667777",
    email: "sofia.torres@example.com",
  },
  {
    nombre: "Noelia",
    apellido: "Fernández",
    telefono: "6667778888",
    email: "noelia.fernandez@example.com",
  }
];

let agenda = new Agenda();
for (let contacto of contactosIniciales) {
  let c = new Contacto(contacto);
  console.log("c", c);
  agenda.actualizar(c);
}

let $ = (selector) => document.querySelector(selector);

$("#btnAgregarContacto").onclick = () => {
  $("#contactoForm").showModal();
  $(".form-contact header").textContent = "Agregar contacto";
  let formulario = $("#contactoForm form");
  formulario.name.value = "";
  formulario.surname.value = "";
  formulario.phone.value = "";
  formulario.email.value = "";

  formulario.onsubmit = (e) => {
    e.preventDefault();
    let nuevoContacto = new Contacto({
      nombre: formulario.name.value,
      apellido: formulario.surname.value,
      telefono: formulario.phone.value,
      email: formulario.email.value,
    });
    agenda.actualizar(nuevoContacto);
    generarAgenda(agenda.traerTodos());
    $("#contactoForm").close();
  };
};

$("#btnCancelar").onclick = () => {
  $("#contactoForm").close();
};

const editarContacto = (id) => {
  let contacto = agenda.traer(id);
  if (!contacto) return;
  $("#contactoForm").showModal();
  $(".form-contact header").textContent = "Editar contacto";
  let formulario = $("#contactoForm form");
  formulario.name.value = contacto.nombre;
  formulario.surname.value = contacto.apellido;
  formulario.phone.value = contacto.telefono;
  formulario.email.value = contacto.email;

  formulario.onsubmit = (e) => {
    e.preventDefault();
    contacto.nombre = formulario.name.value.toUpperCase();
    contacto.apellido = formulario.surname.value.toUpperCase();
    contacto.telefono = formulario.phone.value;
    contacto.email = formulario.email.value.toLowerCase();
    agenda.actualizar(contacto);
    generarAgenda(agenda.traerTodos());
    $("#contactoForm").close();
  };
};

const inputBusqueda = document.querySelector('input[type="search"][name="search"]');
if (inputBusqueda) {
  inputBusqueda.addEventListener("input", (e) => {
    const filtro = e.target.value;
    generarAgenda(agenda.traerTodos(filtro));
  });
}

const generarAgenda = (datos) => {
  let seccionContactos = $("#contactsSection");
  seccionContactos.innerHTML = "";
  datos.forEach((contacto) => {
    let articulo = document.createElement("article");
    articulo.innerHTML = `
            <header>
                <h2>${contacto.nombreCompleto}</h2>
            </header>
            <p>Tel: ${contacto.telefono}</p>
            <p>Email: ${contacto.email}</p>
            <footer>
                <button type="button" class="edit-button" data-id="${contacto.id}">Editar</button>
                <button type="button" class="delete-button" data-id="${contacto.id}">Eliminar</button>
            </footer>
        `;
    seccionContactos.appendChild(articulo);
  });

  document.querySelectorAll(".edit-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.getAttribute("data-id"));
      editarContacto(id);
    });
  });

  document.querySelectorAll(".delete-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.getAttribute("data-id"));
      agenda.eliminar(id);
      generarAgenda(agenda.traerTodos());
    });
  });
};

generarAgenda(agenda.traerTodos());
console.log(agenda.traerTodos());
