'use strict';
// Funciones generales
class Contacto {
  constructor({id, nombre, apellido, telefono, email}) {
    this.id = Number(id);
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
  }
  getNombreCompleto() {
    return `${this.apellido} ${this.nombre}`;
  }
  incluyeTexto(texto) {
    const normalizar = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const textoNormalizado = normalizar(texto);
    return normalizar(this.nombre).includes(textoNormalizado) ||
           normalizar(this.apellido).includes(textoNormalizado) ||
           normalizar(this.telefono).includes(textoNormalizado) ||
           normalizar(this.email).includes(textoNormalizado);
  }
}
class Agenda {
  constructor() {
    this.contactos = [];
    this.ultimoId = 0;
  }
  agregarContacto(cont) {
    cont.id = ++this.ultimoId;
    this.contactos.push(cont);
  }
    eliminarContacto(id) {
    const index = this.contactos.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contactos.splice(index, 1);
      return true;
    }
}
actualizarContacto(contacto) {
const index=this.contactos.findIndex(c=>c.id===contacto.id);
if(index!==-1){
this.contactos[index]=contacto;
return true;
}
}
traerContacto(id){
return this.contactos.find(c=>c.id===id); }
traerTodosSegun(filtro= ''){ 
    let lista= this.contactos.filter(d=>d.incluyeTexto(filtro));
lista.sort((a,b)=>a.getNombreCompleto().localeCompare(b.getNombreCompleto()));
return lista;
}
}
 let datos= [
        {id:1,nombre:"Juan",apellido:"Pérez",telefono:"123-456-7890",email:"la@gmail.com"},
        {id:2,nombre:"María",apellido:"Gómez",telefono:"987-654-3210",email:"la@gmail.com" },
        {id:3,nombre:"Carlos",apellido:"López",telefono:"555-123-4567",email:"la@gmail.com" },
        {id:4,nombre:"Ana",apellido:"Martínez",telefono:"444-987-6543",email:"la@gmail.com"}
      ];
    let miAgenda= new Agenda();
    datos.forEach(d=>miAgenda.agregarContacto(new Contacto(d)));


// Funciones auxiliares
const $ = (selector) => document.querySelector(selector);

// Elementos del DOM
const dialogo = $("#dialogo");
const botonAgregar = $("#agregar");
const botonCancelar = $("#cancelar");
const form = $("form");
const buscar = $("#buscar");

// Funciones
function Editar(id) {
    const c = miAgenda.traerContacto(+id);
    if(!c) return;
    form.elements["id"].value = c.id;
    form.elements["nombre"].value = c.nombre;
    form.elements["apellido"].value = c.apellido;
    form.elements["telefono"].value = c.telefono;
    form.elements["email"].value = c.email;
    dialogo.showModal();
}

function borrar(id) {
    miAgenda.eliminarContacto(+id);
    GenerarAgenda();
}

function getContactos(cont) {
    return `<article>
        <header>${cont.apellido}, ${cont.nombre}</header>
        <p><i class="fas fa-phone"></i>Teléfono: ${cont.telefono}</p>
        <p><i class="fas fa-envelope"></i>Email: ${cont.email}</p>
        <button id="AC" onclick="Editar(${cont.id})"><i class="fas fa-edit"></i> Editar</button>
        <button id="DE" onclick="borrar(${cont.id})"><i class="fas fa-trash"></i>Borrar</button>
    </article>`;
}

function GenerarAgenda() {
    const filtro = buscar?.value ?? "";
    let html = miAgenda.traerTodosSegun(filtro).map(c => getContactos(c)).join("");
    $("#ListaCont").innerHTML = html;
}

// Event Listeners
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
        id: form.elements["id"].value,
        nombre: form.elements["nombre"].value,
        apellido: form.elements["apellido"].value,
        telefono: form.elements["telefono"].value,
        email: form.elements["email"].value
    };

    const idNum = Number(data.id) || 0;

    if (idNum > 0) {
        miAgenda.actualizarContacto(new Contacto(data));
    } else {
        miAgenda.agregarContacto(new Contacto(data));
    }

    dialogo.close();
    form.reset();
    GenerarAgenda();
});

botonAgregar.addEventListener("click", () => {
    form.reset();
    form.elements["id"].value = "";
    dialogo.showModal();
});

botonCancelar.addEventListener("click", () => {
    dialogo.close();
});

if (buscar) buscar.addEventListener("input", GenerarAgenda);

// Inicialización
window.addEventListener("DOMContentLoaded", GenerarAgenda);

// Exportar al scope global
window.Editar = Editar;
window.borrar = borrar;
window.agenda = miAgenda;
window.GenerarAgenda = GenerarAgenda;