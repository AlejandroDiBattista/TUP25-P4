"use strict";
// Funciones generales

class Contacto {
  #id;
  #nombre;
  #apellido;
  #telefono;
  #email;

  constructor(id, nombre, apellido, telefono, email) {
    this.#id = id;
    this.#nombre = nombre;
    this.#apellido = apellido;
    this.#telefono = telefono;
    this.#email = email;
  }

  get id() {
    return this.#id;
  }

  get nombre() {
    return this.#nombre;
  }

  get apellido() {
    return this.#apellido;
  }
  get telefono() {
    return this.#telefono;
  }
  get email() {
    return this.#email;
  }
  set nombre(nombre) {
    this.#nombre = nombre;
  }
  set apellido(apellido) {
    this.#apellido = apellido;
  }
  set telefono(telefono) {
    this.#telefono = telefono;
  }
  set email(email) {
    this.#email = email;
  }
}

const contactosEjemplo = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    telefono: "1134567890",
    email: "juan.perez@mail.com",
  },
  {
    id: 2,
    nombre: "María",
    apellido: "Gómez",
    telefono: "1145678901",
    email: "maria.gomez@mail.com",
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Fernández",
    telefono: "1156789012",
    email: "carlos.frndez@mail.com",
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "Martínez",
    telefono: "1167890123",
    email: "ana.martinez@mail.com",
  },
  {
    id: 5,
    nombre: "Luis",
    apellido: "Rodríguez",
    telefono: "1178901234",
    email: "luis.rodriguez@mail.com",
  },
  {
    id: 6,
    nombre: "Sofía",
    apellido: "López",
    telefono: "1189012345",
    email: "sofia.lopez@mail.com",
  },
  {
    id: 7,
    nombre: "Diego",
    apellido: "García",
    telefono: "1190123456",
    email: "diego.garcia@mail.com",
  },
  {
    id: 8,
    nombre: "Laura",
    apellido: "Sánchez",
    telefono: "1101234567",
    email: "laura.sanchez@mail.com",
  },
  {
    id: 9,
    nombre: "Martín",
    apellido: "Díaz",
    telefono: "1123456789",
    email: "martin.diaz@mail.com",
  },
  {
    id: 10,
    nombre: "Camila",
    apellido: "Torres",
    telefono: "1132109876",
    email: "camila.torres@mail.com",
  },
];

class Agenda {
  #contactos;
  constructor(contactos) {
    this.#contactos = contactos;
  }

  get verContactos() {
    return this.#contactos;
  }

  crearContacto() {
    const form = document.getElementById("formulario-contacto");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const id = this.#contactos.length + 1;
      const nombre = document.getElementById("nombre").value;
      const apellido = document.getElementById("apellido").value;
      const telefono = document.getElementById("telefono").value;
      const email = document.getElementById("email").value;
      const nuevoContacto = new Contacto(id, nombre, apellido, telefono, email);
      this.#contactos.push(nuevoContacto);
      console.log("Contacto guardado exitosamente.", nuevoContacto);
      localStorage.setItem("contactos", JSON.stringify(contactos));
      toggleModal("modal-contacto");
      agenda.cargarContactos();
    });
  }

  eliminarContacto(i) {
    this.#contactos.splice(i, 1);
    localStorage.setItem("contactos", JSON.stringify(this.#contactos));
    agenda.cargarContactos();
    console.log("Contacto eliminado:", this.#contactos[i]);
  }

  abrirEditar(idContacto) {
  const contacto = this.#contactos.find(c => c.id === idContacto);
  if (!contacto) {
    console.log("Contacto no encontrado");
    return;
  }

  document.getElementById("edit-id").value = contacto.id;
  document.getElementById("edit-nombre").value = contacto.nombre;
  document.getElementById("edit-apellido").value = contacto.apellido;
  document.getElementById("edit-telefono").value = contacto.telefono;
  document.getElementById("edit-email").value = contacto.email;

  document.getElementById("form-editar").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const id = Number(document.getElementById("edit-id").value);
    const contacto = agenda.verContactos.find(c => c.id === id);
    if (!contacto) return;
  
    // Guardamos los nuevos valores usando los setters
    contacto.nombre = document.getElementById("nombre").value;
    contacto.apellido = document.getElementById("apellido").value;
    contacto.telefono = document.getElementById("telefono").value;
    contacto.email = document.getElementById("email").value;
  
    // Persistimos en localStorage
    localStorage.setItem("contactos", JSON.stringify(agenda.verContactos));
  
    // Cerramos modal y recargamos la lista
    toggleModal("modal-editar");
    agenda.cargarContactos();
  
    console.log("Contacto actualizado:", contacto);
  });
  toggleModal("modal-editar");
}

// Listener del formulario del modal para guardar cambios

  buscarContacto() {
    const inputBusqueda = document.getElementById("busqueda");

    inputBusqueda.addEventListener("input", function () {
      const termino = this.value.toLowerCase();

      // Filtramos los contactos
      const filtrados = contactos.filter(
        (c) =>
          c.nombre.toLowerCase().includes(termino) ||
          c.apellido.toLowerCase().includes(termino) ||
          c.telefono.includes(termino) ||
          c.email.toLowerCase().includes(termino)
      );

      // Mostramos solo los filtrados
      const lista = document.getElementById("lista-contactos");
      lista.innerHTML = filtrados
        .map(
          (c, i) => `
    <article>
      <h3>${c.apellido} ${c.nombre}</h3>
      <p>📞 ${c.telefono}<br>📧 ${c.email}</p>
      <button onclick="agenda.abrirEditar(${c.id})">Editar</button>
      <button onclick="eliminarContacto(${i})">Borrar</button>
    </article>
  `
        )
        .join("");
    });
  }

  cargarContactos() {
    try {
      const lista = document.getElementById("lista-contactos");
      lista.innerHTML = "";

      lista.innerHTML = contactos
        .map(
          (c, i) => `
    <article>
      <h3>${c.apellido} ${c.nombre}</h3>
      <p>📞 ${c.telefono}<br>📧 ${c.email}</p>
      <button onclick="toggleModal('modal-editar', ${c.id})">Editar</button>
      <button onclick="agenda.eliminarContacto(${i})">Eliminar</button>
    </article>
  `
        )
        .join("");
    } catch (error) {
      console.log(`Hubo un problema cargando los datos: ${error}`);
    }
  }
}
console.log("Contactos en memoria:", contactosEjemplo);

const agenda = new Agenda(contactosEjemplo);

const contactos = agenda.verContactos;

agenda.cargarContactos();
agenda.crearContacto();
agenda.buscarContacto();
