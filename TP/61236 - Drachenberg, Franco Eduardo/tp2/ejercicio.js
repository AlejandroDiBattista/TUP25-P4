"use strict";

const iconCommon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="lucide ';
const ICONS = {
  add: `${iconCommon}lucide-user-plus-icon lucide-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6m3-3h-6"/></svg>`,
  delete: `${iconCommon}lucide-trash2-icon lucide-trash-2"><path d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  edit: `${iconCommon}lucide-pencil-icon lucide-pencil"><path d="M21 7a1 1 0 0 0-4-4L4 16a2 2 0 0 0-1 1l-1 4a1 1 0 0 0 1 1l4-1a2 2 0 0 0 1-1zm-6-2 4 4"/></svg>`,
  save: `${iconCommon}lucide-save-icon lucide-save"><path d="M15 3a2 2 0 0 1 2 1l3 3a2 2 0 0 1 1 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7M7 3v4a1 1 0 0 0 1 1h7"/></svg>`,
  phone: `${iconCommon}lucide-phone-icon lucide-phone"><path d="M14 17a1 1 0 0 0 1-1h0a2 2 0 0 1 2-1h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-1 2h0a1 1 0 0 0-1 1 14 14 0 0 0 7 7"/></svg>`,
  email: `${iconCommon}lucide-mail"><path d="m22 7-9 6a2 2 0 0 1-2 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>`,
};

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarTelefono(telefono) {
  // Acepta números con espacios, guiones, paréntesis
  const regex = /^[\d\s\-\(\)\+]+$/;
  return regex.test(telefono) && telefono.replace(/\D/g, "").length >= 7;
}

function validarTextoNoVacio(texto) {
  return texto && texto.trim().length > 0;
}

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

  actualizar(datos) {
    this.#nombre = datos.nombre ?? this.#nombre;
    this.#apellido = datos.apellido ?? this.#apellido;
    this.#telefono = datos.telefono ?? this.#telefono;
    this.#email = datos.email ?? this.#email;
  }

  toJSON() {
    return {
      id: this.#id,
      nombre: this.#nombre,
      apellido: this.#apellido,
      telefono: this.#telefono,
      email: this.#email,
    };
  }
}

class Agenda {
  #contactos = [];
  #proximoId = 1;

  // constructor() {
  //   this.cargarDeLocalStorage();
  // }

  // guardarEnLocalStorage() {
  //   localStorage.setItem("agenda", JSON.stringify(this.#contactos));
  //   localStorage.setItem("proximoId", this.#proximoId);
  // }

  // cargarDeLocalStorage() {
  //   const contactosGuardados = localStorage.getItem("agenda");
  //   const proximoIdGuardado = localStorage.getItem("proximoId");
  //   if (contactosGuardados) {
  //     const contactosSimples = JSON.parse(contactosGuardados);
  //     this.#contactos = contactosSimples.map(
  //       (c) => new Contacto(c.id, c.nombre, c.apellido, c.telefono, c.email)
  //     );
  //     this.#proximoId = proximoIdGuardado
  //       ? Number(proximoIdGuardado)
  //       : this.#contactos.length
  //       ? Math.max(...this.#contactos.map((c) => c.id)) + 1
  //       : 1;
  //   }
  // }

  agregar(nombre, apellido, telefono, email) {
    const nuevoContacto = new Contacto(
      this.#proximoId,
      nombre,
      apellido,
      telefono,
      email
    );
    this.#contactos.push(nuevoContacto);
    this.#proximoId++;
    // this.guardarEnLocalStorage();
    return nuevoContacto;
  }

  buscarPorId(id) {
    return this.#contactos.find((contacto) => contacto.id === id);
  }

  editar(id, nuevosDatos) {
    const contacto = this.buscarPorId(id);
    if (contacto) {
      contacto.actualizar(nuevosDatos);
      // this.guardarEnLocalStorage();
    }
    return !!contacto;
  }

  borrar(id) {
    const index = this.#contactos.findIndex((contacto) => contacto.id === id);
    if (index !== -1) {
      this.#contactos.splice(index, 1);
      // this.guardarEnLocalStorage();
      return true;
    }
    return false;
  }

  listar() {
    return [...this.#contactos].sort((a, b) => {
      const apellidoComp = a.apellido.localeCompare(b.apellido);
      if (apellidoComp !== 0) return apellidoComp;
      return a.nombre.localeCompare(b.nombre);
    });
  }

  buscar(termino) {
    const normalizar = (str) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    };

    const busqueda = normalizar(termino);
    const terminosBusqueda = busqueda.split(" ").filter((t) => t.length > 0);

    if (terminosBusqueda.length === 0) {
      return this.#contactos;
    }

    return this.#contactos.filter((c) => {
      const valores = [c.nombre, c.apellido, c.telefono, c.email];
      return terminosBusqueda.every((term) =>
        normalizar(JSON.stringify(valores)).includes(term)
      );
    });
  }
}

function datosTest() {
  const datos = [
    {
      nombre: "Juan",
      apellido: "Perez",
      telefono: "11-5555-1010",
      email: "juan.perez@example.com",
    },
    {
      nombre: "Maria",
      apellido: "Gomez",
      telefono: "11-5555-2020",
      email: "maria.gomez@example.com",
    },
    {
      nombre: "Carlos",
      apellido: "Rodriguez",
      telefono: "11-5555-3030",
      email: "carlos.rodriguez@example.com",
    },
    {
      nombre: "Ana",
      apellido: "Lopez",
      telefono: "11-5555-4040",
      email: "ana.lopez@example.com",
    },
    {
      nombre: "Pedro",
      apellido: "Martinez",
      telefono: "11-5555-5050",
      email: "pedro.martinez@example.com",
    },
    {
      nombre: "Laura",
      apellido: "Sanchez",
      telefono: "11-5555-6060",
      email: "laura.sanchez@example.com",
    },
    {
      nombre: "Javier",
      apellido: "Fernandez",
      telefono: "11-5555-7070",
      email: "javier.fernandez@example.com",
    },
    {
      nombre: "Sofia",
      apellido: "Diaz",
      telefono: "11-5555-8080",
      email: "sofia.diaz@example.com",
    },
    {
      nombre: "Martin",
      apellido: "Alvarez",
      telefono: "11-5555-9090",
      email: "martin.alvarez@example.com",
    },
    {
      nombre: "Lucia",
      apellido: "Moreno",
      telefono: "11-5555-0000",
      email: "lucia.moreno@example.com",
    },
  ];
  return datos;
}

function renderizarContactos(contactos) {
  const listaContactos = document.getElementById("lista-contactos");
  listaContactos.innerHTML = "";
  contactos.forEach((contacto) => {
    const article = document.createElement("article");
    article.dataset.id = contacto.id;
    article.innerHTML = `
      <header>
        <strong>${contacto.nombre} ${contacto.apellido}</strong>
      </header>
      <p>${ICONS.phone} ${contacto.telefono}</p>
      <p>${ICONS.email} ${contacto.email}</p>
      <footer>
        <button class="btn-editar" title="Editar contacto">${ICONS.edit}</button>
        <button class="btn-borrar" title="Borrar contacto">${ICONS.delete}</button>
      </footer>
    `;
    listaContactos.appendChild(article);
  });
}

function setErrorMessage(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = field.nextElementSibling;
  errorElement.innerText = message;
}

function clearErrorMessages() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((el) => (el.innerText = ""));
}

const btnAgregar = document.getElementById("btn-agregar");
const dialogoContacto = document.getElementById("dialogo-contacto");
const formContacto = document.getElementById("form-contacto");
const btnCancelar = document.getElementById("btn-cancelar");
const btnGuardar = formContacto.parentElement.querySelector('[type="submit"]');
const closeButton = dialogoContacto.querySelector('[rel="prev"]');

btnAgregar.innerHTML = ICONS.add + " Agregar Contacto";
btnGuardar.innerHTML = ICONS.save + " Guardar";

btnAgregar.addEventListener("click", () => {
  clearErrorMessages();
  formContacto.reset();
  delete formContacto.dataset.id;
  dialogoContacto.querySelector("strong").textContent = "Agregar Contacto";
  dialogoContacto.showModal();
});

btnCancelar.addEventListener("click", () => {
  dialogoContacto.close();
});

closeButton.addEventListener("click", () => {
  dialogoContacto.close();
});

formContacto.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrorMessages();
  let isValid = true;

  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const telefono = document.getElementById("telefono").value;
  const email = document.getElementById("email").value;

  if (!validarTextoNoVacio(nombre)) {
    setErrorMessage("nombre", "El nombre es obligatorio.");
    isValid = false;
  }

  if (!validarTextoNoVacio(apellido)) {
    setErrorMessage("apellido", "El apellido es obligatorio.");
    isValid = false;
  }

  if (!validarTelefono(telefono)) {
    setErrorMessage(
      "telefono",
      "Por favor, ingrese un número de teléfono válido."
    );
    isValid = false;
  }

  if (!validarEmail(email)) {
    setErrorMessage("email", "Por favor, ingrese un email válido.");
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  const id = formContacto.dataset.id;

  if (id) {
    agenda.editar(Number(id), { nombre, apellido, telefono, email });
  } else {
    agenda.agregar(nombre, apellido, telefono, email);
  }

  delete formContacto.dataset.id;
  renderizarContactos(agenda.listar());
  dialogoContacto.close();
});

const listaContactos = document.getElementById("lista-contactos");

listaContactos.addEventListener("click", (event) => {
  const btnEditar = event.target.closest(".btn-editar");
  const btnBorrar = event.target.closest(".btn-borrar");

  if (btnBorrar) {
    const article = btnBorrar.closest("article");
    const id = Number(article.dataset.id);
    agenda.borrar(id);
    renderizarContactos(agenda.listar());
  }

  if (btnEditar) {
    clearErrorMessages();
    const article = btnEditar.closest("article");
    const id = Number(article.dataset.id);
    const contacto = agenda.buscarPorId(id);
    if (contacto) {
      document.getElementById("nombre").value = contacto.nombre;
      document.getElementById("apellido").value = contacto.apellido;
      document.getElementById("telefono").value = contacto.telefono;
      document.getElementById("email").value = contacto.email;
      formContacto.dataset.id = contacto.id;
      dialogoContacto.querySelector("strong").textContent = "Editar Contacto";
      dialogoContacto.showModal();
    }
  }
});

const buscador = document.getElementById("buscador");

buscador.addEventListener("input", () => {
  const termino = buscador.value;
  if (termino.length > 0) {
    const resultados = agenda.buscar(termino);
    renderizarContactos(resultados);
  } else {
    renderizarContactos(agenda.listar());
  }
});

const agenda = new Agenda();
if (agenda.listar().length === 0) {
  const datosIniciales = datosTest();
  datosIniciales.forEach((dato) =>
    agenda.agregar(dato.nombre, dato.apellido, dato.telefono, dato.email)
  );
}
renderizarContactos(agenda.listar());
