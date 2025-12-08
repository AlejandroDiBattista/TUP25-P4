'use strict';

// ======= HELPERS =======
const normalizeText = (s) =>
    s.toString().trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const byApellidoNombre = (a, b) => {
    const apA = normalizeText(a.apellido);
    const apB = normalizeText(b.apellido);
    const cmpAp = apA.localeCompare(apB);
    if (cmpAp !== 0) return cmpAp;
    return normalizeText(a.nombre).localeCompare(normalizeText(b.nombre));
};

// ======== MODELO =======
class Contacto {
    constructor({ id, nombre, apellido, telefono, email }) {
        // id aleatorio 
        this.id = id ?? crypto.getRandomValues(new Uint32Array(1))[0];
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.email = email;
    }
}

class Agenda {
    #items = [];

    constructor(contactos = []) {
        this.#items = contactos.map((c) => new Contacto(c));
    }

    get todos() {
        return [...this.#items].sort(byApellidoNombre);
    }

    agregar(datos) {
        const nuevo = new Contacto(datos);
        this.#items.push(nuevo);
        return nuevo;
    }

    actualizar(id, datos) {
        const i = this.#items.findIndex((c) => c.id === id);
        if (i === -1) return null;
        this.#items[i] = new Contacto({ ...this.#items[i], ...datos, id });
        return this.#items[i];
    }

    borrar(id) {
        this.#items = this.#items.filter((c) => c.id !== id);
    }

    obtener(id) {
        return this.#items.find((c) => c.id === id) ?? null;
    }

    buscar(texto) {
        const q = normalizeText(texto);
        if (!q) return this.todos;
        return this.#items
            .filter((c) =>
            [c.nombre, c.apellido, c.telefono, c.email]
                .map(normalizeText)
                .some((t) => t.includes(q))
            )
            .sort(byApellidoNombre);
    }
}

// ======= CARGA DE DATOS INCIALES =======  
const datosEjemplo = [
    { nombre: "Enrique",     apellido: "Salinas",      telefono: "3815150600", email: "enriquesal@gmail.com" },
    { nombre: "Laura", apellido: "Salinas", telefono: "3815009832", email: "laura@gmail.com" },
    { nombre: "Marta",     apellido: "Espeche",    telefono: "3815678456", email: "marta@gmail.com" },
    { nombre: "Gabriel",     apellido: "Carabajal",     telefono: "3816542532", email: "gabriel@gmail.com" },
    { nombre: "Nicolas",       apellido: "Carabajal",     telefono: "3818882342", email: "nicolas@gmail.com" },
    { nombre: "Agustin",     apellido: "Lobo",  telefono: "3817665432", email: "agustin@gmail.com" },
    { nombre: "Benjamin",      apellido: "Lobo",     telefono: "3816007890", email: "benjamin@gmail.com" },
    { nombre: "Daniela",    apellido: "Sanchez", telefono: "3817654567", email: "daniela@gmail.com" },
    { nombre: "Lautaro",     apellido: "Ruiz",      telefono: "3813214567", email: "lautaro@gmail.com" },
    { nombre: "Sofia", apellido: "Suárez",    telefono: "3816789090", email: "sofia@gmail.com" },
];

// ======= REFERENCIA AL DOM =======
const buscador       = document.querySelector("#buscador");
const lista          = document.querySelector("#listaContactos");
const dialogo        = document.querySelector("#dialogoContacto");
const tituloDialogo  = document.querySelector("#dialogoTitulo");
const form           = document.querySelector("#formContacto");
const contactoId     = document.querySelector("#contactoId");
const nombre         = document.querySelector("#nombre");
const apellido       = document.querySelector("#apellido");
const telefono       = document.querySelector("#telefono");
const email          = document.querySelector("#email");
const btnAgregar     = document.querySelector("#btnAgregar");
const btnCancelar    = document.querySelector("#btnCancelar");

// ======= INSTANCIA DE AGENDA =======
const agenda = new Agenda(datosEjemplo);

function crearCard(c) {
    const art = document.createElement("article");
    art.className = "card-contacto";
    art.innerHTML = `
        <header><h3>${c.nombre} ${c.apellido}</h3></header>
        <p>📞 ${c.telefono}</p>
        <p>✉️ ${c.email}</p>
        <footer class="acciones">
            <button type="button" class="btn-circ btn-edit editar" title="Editar" aria-label="Editar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"></path>
            <path d="M14.06 6.19l3.75 3.75"></path>
            </svg>
            </button>
            <button type="button" class="btn-circ btn-del borrar" title="Borrar" aria-label="Borrar">
            <svg viewBox="0 0 24 24" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14m-8 4v8m4-8v8"></path>
            </svg>
            </button>
        </footer>
    `;

    art.querySelector(".editar").addEventListener("click", () => abrirEdicion(c.id));
    art.querySelector(".borrar").addEventListener("click", () => {
        agenda.borrar(c.id);
        render();
    });

    return art;
}


function render(filtro = "") {
    const data = filtro ? agenda.buscar(filtro) : agenda.todos;
    lista.innerHTML = "";
    if (data.length === 0) {
        lista.innerHTML = "<p>No hay resultados</p>";
        return;
    }
    data.forEach((c) => lista.appendChild(crearCard(c)));
}

// ======= DIALOGO =======
function abrirNuevo() {
    tituloDialogo.textContent = "Nuevo contacto";
    contactoId.value = "";
    form.reset();
    dialogo.showModal();
    nombre.focus();
}

function abrirEdicion(id) {
    const c = agenda.obtener(id);
    if (!c) return;
    tituloDialogo.textContent = "Editar contacto";
    contactoId.value = c.id;
    nombre.value = c.nombre;
    apellido.value = c.apellido;
    telefono.value = c.telefono;
    email.value = c.email;
    dialogo.showModal();
    nombre.focus();
}

// ======= EVENTOS =======
form.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const datos = {
        nombre: nombre.value.trim(),
        apellido: apellido.value.trim(),
        telefono: telefono.value.trim(),
        email: email.value.trim(),
    };

    const id = contactoId.value ? Number(contactoId.value) : null;

    if (id) agenda.actualizar(id, datos);
    else    agenda.agregar(datos);

    dialogo.close();
    render(buscador.value);
});

btnCancelar.addEventListener("click", () => dialogo.close());
btnAgregar.addEventListener("click", abrirNuevo);
buscador.addEventListener("input", (e) => render(e.target.value));

// ======== PRIMER RENDER =======
render();

