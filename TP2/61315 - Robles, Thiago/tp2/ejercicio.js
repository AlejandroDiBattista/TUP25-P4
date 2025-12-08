'use strict';



let mensajeError = document.getElementById('mensaje-error');

// === CLASES ===

class Agenda {

    constructor(){
        this.contactos = [];
    }

    mostrarContactos(contactos) {
    const divContactos = document.getElementById('contactos');
    divContactos.innerHTML = '';
    contactos.forEach(contacto => {
        divContactos.innerHTML += `
            <article>
                <h2> Contacto ${contacto.id} </h2>
                <h3>${contacto.nombre} ${contacto.apellido}</h3>
                <p>Teléfono: ${contacto.telefono}</p>
                <p>Email: ${contacto.email}</p>
                <button type="button" class="btn-editar" data-id="${contacto.id}">✏️</button>
                <button type="button" class="btn-eliminar" data-id="${contacto.id}">🗑️</button>
            </article>
        `;
    });
}

    agregarContacto(contacto){

        this.contactos.push(contacto);
    }

    eliminarContacto(id){
        this.contactos = this.contactos.filter(contacto => contacto.id !== id);
    }

    editarContacto(id, nuevosDatos){

        const contacto = this.contactos.find(contacto => contacto.id === id);
        
        if(contacto){
            contacto.nombre = nuevosDatos.nombre || contacto.nombre;
            contacto.apellido = nuevosDatos.apellido || contacto.apellido;
            contacto.telefono = nuevosDatos.telefono || contacto.telefono;
            contacto.email = nuevosDatos.email || contacto.email;
        }
    }

    buscarContacto(termino){

        const normalizar = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        termino = normalizar(termino);

        return this.contactos.filter(contacto => 
            normalizar(contacto.nombre).includes(termino) || 
            normalizar(contacto.apellido).includes(termino) || 
            normalizar(contacto.telefono).includes(termino) || 
            normalizar(contacto.email).includes(termino)
        );
    }

}

class Contacto {

    static idAutoincrementable = 1;

    constructor(nombre, apellido, telefono, email){
        this.id = Contacto.idAutoincrementable++;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.email = email;
    }


}

// ===========================


// === INPUTS ===
const inputBuscar = document.getElementById('input-buscar');

// === SPANS / PARRAFOS / TITULOS ===
const numeroContacto = document.getElementById('numero-contacto');
const nombreContacto = document.getElementById('nombre-contacto');
const apellidoContacto = document.getElementById('apellido-contacto');
const telefonoContacto = document.getElementById('telefono-contacto');
const emailContacto = document.getElementById('email-contacto');

// ===========================

// === INSTANCIA PRINCIPAL ===

const agenda = new Agenda();

// === DOM ===

const modalAgregar = document.getElementById('modal-agregar');
const formAgregar  = document.getElementById('form-agregar');
const btnAgregar   = document.getElementById('btn-agregar');
const btnSalir    = document.getElementById('btn-salir');

const btnEditar = document.getElementById('btn-editar');

const modalEditar = document.getElementById('modal-editar');
const formEditar  = document.getElementById('form-editar');
const btnGuardar  = document.getElementById('btn-guardar');
const btnSalirEd  = document.getElementById('btn-salir-ed');

const divContactos = document.getElementById('contactos');

// ===========================


// === FUNCIONES ===

const ordenarContactos = (arr) => arr.slice().sort((a, b) => {
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const cmpApellido = norm(a.apellido).localeCompare(norm(b.apellido));
    if (cmpApellido !== 0) return cmpApellido;
    return norm(a.nombre).localeCompare(norm(b.nombre));
});




// ===============

// === DATOS DE PRUEBA ===

const contacto1 = new Contacto('Juan', 'Pérez', '123456789', 'juan@example.com');
const contacto2 = new Contacto('Ana', 'Gómez', '987654321', 'ana@example.com');
const contacto3 = new Contacto('Luis', 'Martínez', '555666777', 'luis@example.com');
const contacto4 = new Contacto('María', 'Rodríguez', '444555666', 'maria@example.com');
const contacto5 = new Contacto('Carlos', 'López', '222333444', 'carlos@example.com');
const contacto6 = new Contacto('Sofía', 'Fernández', '111222333', 'sofia@example.com');
const contacto7 = new Contacto('Pedro', 'García', '333444555', 'pedro@example.com');
const contacto8 = new Contacto('Valentina', 'Sosa', '777888999', 'valentina@example.com');
const contacto9 = new Contacto('Martín', 'Ruiz', '888999000', 'martinruiz@example.com');
const contacto10 = new Contacto('Lucía', 'Méndez', '999000111', 'luciamendez@example.com');

agenda.agregarContacto(contacto1);
agenda.agregarContacto(contacto2);
agenda.agregarContacto(contacto3);
agenda.agregarContacto(contacto4);
agenda.agregarContacto(contacto5);
agenda.agregarContacto(contacto6);
agenda.agregarContacto(contacto7);
agenda.agregarContacto(contacto8);
agenda.agregarContacto(contacto9);
agenda.agregarContacto(contacto10);

agenda.mostrarContactos(ordenarContactos(agenda.contactos));

// ===========================


// ===== Eventos =====
// Al enviar el formulario de agregar contacto
formAgregar.addEventListener('submit', (e) => {

    e.preventDefault();
    mensajeError.textContent = '';

    const nombre = formAgregar.elements[0].value;
    const apellido = formAgregar.elements[1].value;
    const telefono = formAgregar.elements[2].value;
    const email = formAgregar.elements[3].value;

    if(!nombre || !apellido || !telefono || !email){
        mensajeError.textContent = 'Todos los campos son obligatorios.';
        return;
    }

    if(agenda.contactos.some(c => c.email === email)){
        mensajeError.textContent = 'El email ya está en uso.';
        return;
    }
    
    if(agenda.contactos.some(c => c.telefono === telefono)){
        mensajeError.textContent = 'El teléfono ya está en uso.';
        return;
    }

    if(!/^\S+@\S+\.\S+$/.test(email)){
        mensajeError.textContent = 'El email no es válido.';
        return;
    }

    if(!/^\d{7,15}$/.test(telefono)){
        mensajeError.textContent = 'El teléfono debe tener entre 7 y 15 dígitos.';
        return;
    }

    // Crear nuevo contacto y agregarlo a la agenda

    const nuevoContacto = new Contacto(nombre, apellido, telefono, email);

    agenda.agregarContacto(nuevoContacto);
    agenda.mostrarContactos(ordenarContactos(agenda.contactos));
    modalAgregar.close();
    formAgregar.reset();


});

// ===================

// === BOTONES ===
const btnformAgregar = document.getElementById('btn-form-agregar'); 

// ===========================

// === EVENTOS ===

// Al hacer click en "Agregar contacto", se abre el modal
btnAgregar.addEventListener('click', () => {    
    modalAgregar.showModal();
});

btnSalir.addEventListener('click', () => {
    modalAgregar.close();
    mensajeError.textContent = '';
    formAgregar.reset();
});


divContactos.addEventListener('click', (e) => {
    // Eliminar contacto
    if(e.target.classList.contains('btn-eliminar')){
        const id = parseInt(e.target.getAttribute('data-id'));
        agenda.eliminarContacto(id);
        agenda.mostrarContactos(ordenarContactos(agenda.contactos));
    }
    // Editar contacto
    if(e.target.classList.contains('btn-editar')){
        const id = parseInt(e.target.getAttribute('data-id'));
        const contacto = agenda.contactos.find(c => c.id === id);
        if(contacto){
            formEditar.elements[0].value = contacto.nombre;
            formEditar.elements[1].value = contacto.apellido;
            formEditar.elements[2].value = contacto.telefono;
            formEditar.elements[3].value = contacto.email;
            formEditar.setAttribute('data-id', id);
            modalEditar.showModal();
        }
    }
});

// Evento para guardar cambios en el modal de edición
formEditar.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(formEditar.getAttribute('data-id'));
    const nombre = formEditar.elements[0].value;
    const apellido = formEditar.elements[1].value;
    const telefono = formEditar.elements[2].value;
    const email = formEditar.elements[3].value;
    // Validaciones básicas (puedes agregar más si quieres)
    if(!nombre || !apellido || !telefono || !email){
        document.getElementById('mensaje-error-editar').textContent = 'Todos los campos son obligatorios.';
        return;
    }
    agenda.editarContacto(id, {nombre, apellido, telefono, email});
    agenda.mostrarContactos(ordenarContactos(agenda.contactos));
    modalEditar.close();
    formEditar.reset();
    document.getElementById('mensaje-error-editar').textContent = '';
});

// Botón cancelar del modal de edición
btnSalirEd.addEventListener('click', () => {
    modalEditar.close();
    formEditar.reset();
    document.getElementById('mensaje-error-editar').textContent = '';
});

// Buscador de contactos
inputBuscar.addEventListener('input', (e) => {
    const termino = e.target.value;
    if(termino.trim() === ''){
        agenda.mostrarContactos(ordenarContactos(agenda.contactos));
    } else {
        const resultados = agenda.buscarContacto(termino);
        agenda.mostrarContactos(ordenarContactos(resultados));
    }
});






