'use strict';
// Funciones generales

let $ = (selector) => document.querySelector(selector);

$("#agregar").onclick = () => {
    $("#formulario").reset();
    $("#formulario").elements["id"].value = ""; 
    $("#dialogo").showModal();
};

$("#aceptar").onclick = (e) => {
    e.preventDefault(); 
    let f = $("#formulario");
    let contacto = {
        id: f.elements["id"].value,
        nombre: f.elements["nombre"].value,
        apellido: f.elements["apellido"].value,
        telefono: f.elements["telefono"].value,
        email: f.elements["email"].value
    };

    if (contacto.id) {
        agenda.actualizar(new Contacto(contacto));
        let contactoDOM = document.querySelector(`[data-id="${contacto.id}"]`);
        if (contactoDOM) {
            contactoDOM.outerHTML = GenerarContacto(contacto);
        }
    } else {
        let nuevoContacto = new Contacto(contacto);
        agenda.actualizar(nuevoContacto);
        $("#agenda").innerHTML += GenerarContacto(nuevoContacto);
    }
    $("#dialogo").close();
};

$("#cancelar").onclick = () => $("#dialogo").close();
$("#buscar").oninput = GenerarAgenda;

function editar(id) {
    let contacto = agenda.traer(+id);
    let f = $("#formulario");
    f.elements["nombre"].value = contacto.nombre;
    f.elements["apellido"].value = contacto.apellido;
    f.elements["telefono"].value = contacto.telefono;
    f.elements["email"].value = contacto.email;
    f.elements["id"].value = contacto.id;
    $("#dialogo").showModal();
}

function eliminar(id) {
    agenda.eliminar(id);
    GenerarAgenda();
}

function GenerarContacto({id, nombre, apellido, telefono, email}) {
    return `
    <article data-id="${id}">
        <header>${nombre} ${apellido}</header>
        <p><strong>Tel:</strong> ${telefono}</p>
        <p><strong>Email:</strong> ${email}</p>
        <footer class="grid">
            <button class="secondary" onclick="editar(${id})">Editar</button>
            <button class="contrast" onclick="eliminar(${id})">Eliminar</button>
        </footer>
    </article>`;
}

function GenerarAgenda() {
    let html = "";
    let filtro = $("#buscar").value.toLowerCase();
    for(let contacto of agenda.traerTodos(filtro)) {
        html += GenerarContacto(contacto);
    }
    $("#agenda").innerHTML = html;
}

class Agenda {
    static ultimoId = 0;

    constructor() {
        this.contactos = [];
    }

    actualizar(contacto) {
        if (contacto.id) {
            const index = this.contactos.findIndex(c => c.id === contacto.id);
            if (index !== -1) {
                this.contactos[index] = contacto;
            }
        } else {
            contacto.id = ++Agenda.ultimoId;
            this.contactos.push(contacto);
        }
        return contacto;
    }

    eliminar(id) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index !== -1) {
            this.contactos.splice(index, 1);
        }
    }

    traer(id) {
        return this.contactos.find(c => c.id === id);
    }

    traerTodos(filtro = '') {
        let lista = this.contactos.filter(c => c.includes(filtro));
        lista.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
        return lista;
    }
}

class Contacto {
    constructor({id, nombre, apellido, telefono, email}) {
        this.id = id ? Number(id) : 0;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.email = email;
    }

    get nombreCompleto() {
        return `${this.apellido} ${this.nombre}`;
    }

    includes(texto) {
        texto = texto.toLowerCase();
        return this.nombre.toLowerCase().includes(texto) ||
               this.apellido.toLowerCase().includes(texto) ||
               this.telefono.toLowerCase().includes(texto) ||
               this.email.toLowerCase().includes(texto);
    }
}

let datos = [
    {nombre: "Gonzales", apellido: "Maria", telefono: "32332323", email: "maria@gmail.com"},
    {nombre: "Perez", apellido: "Juan", telefono: "11111111", email: "juan@gmail.com"},
    {nombre: "Lopez", apellido: "Ana", telefono: "22222222", email: "ana@gmail.com"}
];

let agenda = new Agenda();
for (let dato of datos) {
    let contacto = new Contacto(dato);
    agenda.actualizar(contacto);
}

GenerarAgenda();