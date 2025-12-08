'use strict';
// Funciones generales
class Contacto{
    constructor(id, nombre, apellido, telefono, email){
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.email = email;
    }
}

class Agenda{
    constructor(){
        this.contactos = [];
    }

    agregar(contacto){
    this.contactos.push(contacto);
    this.ordenar();
    }

    actualizar(id, datos){
        const i = this.contactos.findIndex(c => c.id === id);
        if (i >= 0){
            this.contactos[i] = { ...this.contactos[i], ...datos};
            this.ordenar();
            }
        }

    borrar(id){
        
        const indice = this.contactos.findIndex(c => c.id === id);
        if  (indice !== -1){
            this.contactos.splice(indice, 1);
        }
    }
    
    buscar(busqueda) {
        const b = this._normalizar(busqueda);
        return this.contactos.filter(c => {
            return (
                this._normalizar(c.nombre).includes(b) ||
                this._normalizar(c.apellido).includes(b) ||
                this._normalizar(c.telefono).includes(b) ||
                this._normalizar(c.email).includes(b)
            );
        });
    }

    ordenar() {
        this.contactos.sort((a, b) => {
        const cmpApellido = this._normalizar(a.apellido)
        .localeCompare(this._normalizar(b.apellido));
      return cmpApellido !== 0
        ? cmpApellido
        : this._normalizar(a.nombre)
          .localeCompare(this._normalizar(b.nombre));
    });
}


    _normalizar(txt){
        return txt
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }
}
// INICIALIZACION
const agenda = new Agenda();

agenda.agregar(new Contacto(1, "Juan", "Pérez", "111-111-111", "juan.perez@mail.com"));
agenda.agregar(new Contacto(2, "María", "Gómez", "222-222-222", "maria.gomez@mail.com"));
agenda.agregar(new Contacto(3, "Carlos", "López", "333-333-333", "carlos.lopez@mail.com"));
agenda.agregar(new Contacto(4, "Lucía", "Martínez", "444-444-444", "lucia.martinez@mail.com"));
agenda.agregar(new Contacto(5, "Diego", "Fernández", "555-555-555", "diego.fernandez@mail.com"));
agenda.agregar(new Contacto(6, "Sofía", "García", "666-666-666", "sofia.garcia@mail.com"));
agenda.agregar(new Contacto(7, "Mateo", "Rodríguez", "777-777-777", "mateo.rodriguez@mail.com"));
agenda.agregar(new Contacto(8, "Valentina", "Hernández", "888-888-888", "valentina.hernandez@mail.com"));
agenda.agregar(new Contacto(9, "Tomás", "Díaz", "999-999-999", "tomas.diaz@mail.com"));
agenda.agregar(new Contacto(10, "Camila", "Torres", "000-000-000", "camila.torres@mail.com"));


// DOM
const lista = document.querySelector("#listaContactos");
const buscador = document.querySelector("#buscador");
const btnAgregar = document.querySelector("#btnAgregar");
const dialogo = document.querySelector("#dialogoContacto");
const form = document.querySelector("#formContacto");
const btnCancelar = document.querySelector("#btnCancelar");
const tituloDialogo = document.querySelector("#tituloDialogo");
const contactoId = document.querySelector("#contactoId");


function render(contactos = agenda.contactos) {
    lista.innerHTML = "";
contactos.forEach(c => {
    const card = document.createElement("article");
    card.innerHTML = `
    <h4>${c.nombre} ${c.apellido}</h4>
    <p> 📞${c.telefono}</p>
    <p> ✉️${c.email}</p>
    <footer>
        <button data-accion="editar" data-id="${c.id}">✏️</button>
        <button data-accion="borrar" data-id="${c.id}">🗑️</button>
    </footer>
    `;
    lista.appendChild(card);
});
}

buscador.addEventListener("input", () =>{
    const texto = buscador.value.trim();
    render(texto ? agenda.buscar(texto) : agenda.contactos);
});

btnAgregar.addEventListener("click", () =>{
    form.reset();
    contactoId.value = "";
    tituloDialogo.textContent = "Nuevo contacto";
    dialogo.showModal();
});

btnCancelar.addEventListener("click", () => dialogo.close());

form.addEventListener("submit", e => {
    e.preventDefault();
    const id = contactoId.value ? parseInt(contactoId.value) : Date.now();
    const datos = {
    nombre: document.querySelector("#nombre").value,
    apellido: document.querySelector("#apellido").value,
    telefono: document.querySelector("#telefono").value,
    email: document.querySelector("#email").value
    };

    if (contactoId.value) {
        agenda.actualizar(id, datos);
    } else {
        agenda.agregar(new Contacto(id, datos.nombre, datos.apellido, datos.telefono, datos.email));
    }

    dialogo.close();
    render();
});

lista.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn)return;
    const id = parseInt(btn.dataset.id);
    if (btn.dataset.accion === "borrar"){
        agenda.borrar(id);
        render();
    } else if (btn.dataset.accion === "editar") {
    const c = agenda.contactos.find(x => x.id === id);
    if (c) {
      contactoId.value = c.id;
      document.querySelector("#nombre").value = c.nombre;
      document.querySelector("#apellido").value = c.apellido;
      document.querySelector("#telefono").value = c.telefono;
      document.querySelector("#email").value = c.email;
      tituloDialogo.textContent = "Editar contacto";
      dialogo.showModal(); 
    }
    }
});

render();