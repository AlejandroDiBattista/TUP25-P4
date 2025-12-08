(function() {
    'use strict';

    const ICONO_TELEFONO = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1C10.07 21.43 2.57 13.93 2.57 4a1 1 0 0 1 1-1H7a1 1 0 0 1 1 1c0 1.35.27 2.67.76 3.88a1 1 0 0 1-.21 1.11l-2.2 2.2z"/>
</svg>`;

const ICONO_EMAIL = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 18V8l8 5 8-5v10H4z"/>
</svg>`;

const ICONO_EDITAR = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
  <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
</svg>`;

const ICONO_BORRAR = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
  <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z"/>
  <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
</svg>`;



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
            this.idActual = 0;
        }

        agregarContacto(nombre, apellido, telefono, email) {
            const nuevoContacto = new Contacto(++this.idActual, nombre, apellido, telefono, email);
            this.contactos.push(nuevoContacto);
        }

        borrarContacto(id) {
            this.contactos = this.contactos.filter(contacto => contacto.id !== id);
        }

        editarContacto(id, nombre, apellido, telefono, email) {
            const contacto = this.contactos.find(c => c.id === id);
            if (contacto) {
                contacto.nombre = nombre;
                contacto.apellido = apellido;
                contacto.telefono = telefono;
                contacto.email = email;
            }
        }

        obtenerContactos() {
            return this.contactos.sort((a, b) => {
                const apellidoA = this.normalizarTexto(a.apellido);
                const apellidoB = this.normalizarTexto(b.apellido);
                const nombreA = this.normalizarTexto(a.nombre);
                const nombreB = this.normalizarTexto(b.nombre);

                if (apellidoA < apellidoB) return -1;
                if (apellidoA > apellidoB) return 1;
                
                if (nombreA < nombreB) return -1;
                if (nombreA > nombreB) return 1;

                return 0;
            });
        }

        normalizarTexto(texto) {
            return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        }
        guardarEnStorage() {
        localStorage.setItem('agendaContactos', JSON.stringify(this.contactos));
        localStorage.setItem('agendaIdActual', this.idActual.toString());
}

        cargarDeStorage() {
        const contactosGuardados = JSON.parse(localStorage.getItem('agendaContactos')) || [];
        this.idActual = parseInt(localStorage.getItem('agendaIdActual')) || 0;
        this.contactos = contactosGuardados.map(c => new Contacto(c.id, c.nombre, c.apellido, c.telefono, c.email));
}

        cargarDatosIniciales() {
            const datos = [
                { nombre: 'Rodrigo', apellido: 'Jatib', telefono: '381-555-1010', email: 'rodrigo.jatib@example.com' },
                { nombre: 'Micaela', apellido: 'Álvarez', telefono: '381-555-4040', email: 'm.a@example.com' },
                { nombre: 'Santiago', apellido: 'Adolfo', telefono: '381-555-6060', email: 's.ab@example.com' },
                { nombre: 'María', apellido: 'Va', telefono: '381-555-2020', email: 'maria.va@example.com' },
                { nombre: 'Mercedes', apellido: 'Sosa', telefono: '381-556-8080', email: 'mercedes.sosa@example.com' },
                { nombre: 'Carito', apellido: 'Tarragó Ros', telefono: '379-555-7070', email: 'carito.tarragogieco@example.com' },
                { nombre: 'Rubén', apellido: 'Juárez', telefono: '351-555-5050', email: 'album.blanco@example.com' },
                { nombre: 'Pablo', apellido: 'Márquez', telefono: '11-5555-9090', email: 'pablo.marquez@example.com' },
                { nombre: 'Raúl', apellido: 'Carnota', telefono: '11-5555-3030', email: 'solo.luz@example.com' },
                { nombre: 'Javier', apellido: 'Sánchez', telefono: '11-5555-0000', email: 'javier.sanchez@example.com' }
            ];
            datos.forEach(c => this.agregarContacto(c.nombre, c.apellido, c.telefono, c.email));
        }
    }


    const DOM = {
        listaContactos: document.getElementById('lista-contactos'),
        buscador: document.getElementById('buscador'),
        btnAgregar: document.getElementById('btn-agregar'),
        dialogo: document.getElementById('dialogo-contacto'),
        formContacto: document.getElementById('form-contacto'),
        dialogoTitulo: document.getElementById('dialogo-titulo'),
        btnCerrarDialogo: document.getElementById('btn-cerrar-dialogo'),
        btnCancelar: document.getElementById('btn-cancelar'),
        contactoId: document.getElementById('contacto-id'),
        nombre: document.getElementById('nombre'),
        apellido: document.getElementById('apellido'),
        telefono: document.getElementById('telefono'),
        email: document.getElementById('email')
    };

    function renderizarContactos(contactos) {
        DOM.listaContactos.innerHTML = '';
        if (contactos.length === 0) {
            DOM.listaContactos.innerHTML = '<p>No se encontraron contactos.</p>';
            return;
        }

        contactos.forEach(contacto => {
            const card = document.createElement('article');
            card.classList.add('card-contacto');
            card.innerHTML = `
                <div class="card-contenido">
                    <h4>${contacto.nombre} ${contacto.apellido}</h4>
                    <div class="info">
                        <p>${ICONO_TELEFONO}<span>${contacto.telefono}</span></p>
                        <p>${ICONO_EMAIL}<span>${contacto.email}</span></p>
                    </div>
                </div>
                <div class="card-acciones">
                    <button class="btn-editar" data-id="${contacto.id}" aria-label="Editar">${ICONO_EDITAR}</button>
                    <button class="btn-borrar" data-id="${contacto.id}" aria-label="Borrar">${ICONO_BORRAR}</button>
                </div>
            `;
            DOM.listaContactos.appendChild(card);
        });
    }

    const agenda = new Agenda();

    function inicializar() {
        agenda.cargarDatosIniciales();
        agenda.guardarEnStorage();
    renderizarContactos(agenda.obtenerContactos());
    configurarEventos();
}


    function configurarEventos() {
        DOM.buscador.addEventListener('input', manejarBusqueda);
        DOM.btnAgregar.addEventListener('click', mostrarDialogoParaAgregar);
        DOM.formContacto.addEventListener('submit', manejarGuardado);
        DOM.btnCerrarDialogo.addEventListener('click', cerrarDialogo);
        DOM.btnCancelar.addEventListener('click', cerrarDialogo);
        DOM.listaContactos.addEventListener('click', manejarAccionesCard);
    }

    function manejarBusqueda(e) {
        const textoBusqueda = agenda.normalizarTexto(e.target.value);
        const contactosFiltrados = agenda.obtenerContactos().filter(contacto => {
            return agenda.normalizarTexto(contacto.nombre).includes(textoBusqueda) ||
                   agenda.normalizarTexto(contacto.apellido).includes(textoBusqueda) ||
                   agenda.normalizarTexto(contacto.telefono).includes(textoBusqueda) ||
                   agenda.normalizarTexto(contacto.email).includes(textoBusqueda);
        });
        renderizarContactos(contactosFiltrados);
    }

    function mostrarDialogoParaAgregar() {
        DOM.formContacto.reset();
        DOM.contactoId.value = '';
        DOM.dialogoTitulo.textContent = 'Agregar Contacto';
        DOM.dialogo.showModal();
    }
    
    function mostrarDialogoParaEditar(id) {
        const contacto = agenda.contactos.find(c => c.id === id);
        if (contacto) {
            DOM.contactoId.value = contacto.id;
            DOM.nombre.value = contacto.nombre;
            DOM.apellido.value = contacto.apellido;
            DOM.telefono.value = contacto.telefono;
            DOM.email.value = contacto.email;
            DOM.dialogoTitulo.textContent = 'Editar Contacto';
            DOM.dialogo.showModal();
        }
    }
    
    function cerrarDialogo() {
        DOM.dialogo.close();
    }

    function manejarGuardado(e) {
    e.preventDefault();
    const id = parseInt(DOM.contactoId.value);
    const nombre = DOM.nombre.value.trim();
    const apellido = DOM.apellido.value.trim();
    const telefono = DOM.telefono.value.trim();
    const email = DOM.email.value.trim();

    if (id) {
        agenda.editarContacto(id, nombre, apellido, telefono, email);
    } else {
        agenda.agregarContacto(nombre, apellido, telefono, email);
    }

    //agenda.guardarEnStorage();
    renderizarContactos(agenda.obtenerContactos());
    DOM.buscador.value = '';
    cerrarDialogo();
}

    
    function manejarAccionesCard(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        const id = parseInt(target.dataset.id);

        if (target.classList.contains('btn-borrar')) {
            agenda.borrarContacto(id);
            //agenda.guardarEnStorage();
            if (DOM.buscador.value) {
                manejarBusqueda({ target: DOM.buscador });
            } else {
                renderizarContactos(agenda.obtenerContactos());
            }
        } else if (target.classList.contains('btn-editar')) {
            mostrarDialogoParaEditar(id);
        }
    }
    
    document.addEventListener('DOMContentLoaded', inicializar);

})();

const btnTema = document.getElementById('btn-tema');

function aplicarTema(modo) {
    document.body.classList.remove('modo-claro', 'modo-oscuro');
    document.body.classList.add(modo);
    localStorage.setItem('modoTema', modo);
    btnTema.textContent = modo === 'modo-oscuro' ? '☀️' : '🌙';
}

function detectarTemaInicial() {
    const guardado = localStorage.getItem('modoTema');
    if (guardado) {
        aplicarTema(guardado);
    } else {
        const oscuroPorSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
        aplicarTema(oscuroPorSistema ? 'modo-oscuro' : 'modo-claro');
    }
}

btnTema.addEventListener('click', () => {
    const actual = document.body.classList.contains('modo-oscuro') ? 'modo-oscuro' : 'modo-claro';
    const nuevo = actual === 'modo-oscuro' ? 'modo-claro' : 'modo-oscuro';
    aplicarTema(nuevo);
});

document.addEventListener('DOMContentLoaded', () => {
    detectarTemaInicial();
});