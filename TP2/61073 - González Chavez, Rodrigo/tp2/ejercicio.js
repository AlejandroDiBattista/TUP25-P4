'use strict'

class Contacto {
    constructor(id, nombre, apellido, telefono, email) {
        this.id = id
        this.nombre = nombre
        this.apellido = apellido
        this.telefono = telefono
        this.email = email
    }

    get nombreCompleto() {
        return `${this.apellido}, ${this.nombre}`
    }

}

class Agenda {
    constructor() {
        this.contactos = [
            new Contacto(1, 'Juan', 'Perez', '123456789', 'juan.perez@example.com'),
            new Contacto(2, 'Maria', 'Gomez', '987654321', 'maria.gomez@example.com'),
            new Contacto(3, 'Carlos', 'Lopez', '555555555', 'carlos.lopez@example.com'),
            new Contacto(4, 'Ana', 'Martinez', '444444444', 'ana.martinez@example.com'),
            new Contacto(5, 'Luis', 'Rodriguez', '333333333', 'luis.rodriguez@example.com'),
            new Contacto(6, 'Sofia', 'Garcia', '222222222', 'sofia.garcia@example.com'),
            new Contacto(7, 'Diego', 'Fernandez', '111111111', 'diego.fernandez@example.com'),
            new Contacto(8, 'Laura', 'Hernandez', '666666666', 'laura.hernandez@example.com'),
            new Contacto(9, 'Miguel', 'Sanchez', '777777777', 'miguel.sanchez@example.com'),
            new Contacto(10, 'Elena', 'Ramirez', '888888888', 'elena.ramirez@example.com')
        ]
        this.ultimoId = 10
    }

    agregarContacto(nombre, apellido, telefono, email) {
        const nuevoContacto = new Contacto(
            ++this.ultimoId,
            nombre,
            apellido,
            telefono,
            email
        )
        this.contactos.push(nuevoContacto)
    }

    listarContactos() {
       return this.contactos.sort((a, b) =>
        a.apellido.localeCompare(b.apellido) ||
        a.nombre.localeCompare(b.nombre)
       )
  }


    editarContacto(id, nombre, apellido, telefono, email) {
        const contacto = this.contactos.find(c => c.id === id)
        if (contacto) {
            contacto.nombre = nombre
            contacto.apellido = apellido
            contacto.telefono = telefono
            contacto.email = email
        }
    }

    eliminarContacto(id) {
        this.contactos = this.contactos.filter(c => c.id !== id)
    }

    buscarContacto(termino) {
        function normalizar(str) {
            return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        }
        const resultado = this.contactos.filter(c =>
            normalizar(c.nombre).includes(normalizar(termino)) ||
            normalizar(c.apellido).includes(normalizar(termino)) ||
            normalizar(c.telefono).includes(normalizar(termino)) ||
            normalizar(c.email).includes(normalizar(termino))
        )
        return resultado
    }

}

const agenda = new Agenda()

const lista = document.getElementById('lista-contactos')
const buscador = document.getElementById('buscador')
const formulario = document.getElementById('form-contacto')
const dialogo = document.getElementById('dialogo-contacto')
const btnAgregar = document.getElementById('btn-agregar')
const btnCancelar = document.getElementById('btn-cancelar')
const tituloDialogo = document.getElementById('titulo-dialogo')

function render (contactos = agenda.listarContactos()) {
    lista.innerHTML = ''
    contactos.forEach(c => {
        const card = document.createElement('article')
        card.className = 'card'
        card.innerHTML = `
        <header>
        <h4>${c.nombreCompleto}</h4>
        <small>ID: ${c.id}</small>
        </header>
        <p><strong>Teléfono:</strong> ${c.telefono}</p>
        <p><strong>Email:</strong> ${c.email}</p>
        <footer>
          <button data-accion="editar" data-id="${c.id}">✏️ Editar</button>
          <button data-accion="eliminar" data-id="${c.id}">🗑️ Borrar</button>
        </footer>
        `
        lista.appendChild(card)
    }
    )
}

buscador.addEventListener('input', (e) => {
    const termino = e.target.value
    render(termino ? agenda.buscarContacto(termino) : agenda.listarContactos())
})

btnAgregar.addEventListener('click', () => {
    formulario.reset()
    document.getElementById('contacto-id').value = ''
    tituloDialogo.textContent = 'Agregar Contacto'
    dialogo.showModal()
})

btnCancelar.addEventListener('click', () => {
    dialogo.close()
})

formulario.addEventListener('submit', (e) => {
    e.preventDefault()

    const id = parseInt(document.getElementById('contacto-id').value)
    const nombre = document.getElementById('nombre').value
    const apellido = document.getElementById('apellido').value
    const telefono = document.getElementById('telefono').value
    const email = document.getElementById('email').value

    if (id) {
        agenda.editarContacto(id, nombre, apellido, telefono, email)
    } else {
        agenda.agregarContacto(nombre, apellido, telefono, email)
    }
    dialogo.close()
    render()
})

lista.addEventListener('click', (e) => {
    const accion = e.target.dataset.accion
    const id = parseInt(e.target.dataset.id)

    if (accion === 'eliminar') {
        agenda.eliminarContacto(id)
        render()
    }

    if (accion === 'editar') {
        const c = agenda.contactos.find(c => c.id === id)
        if (c) {
            document.getElementById('contacto-id').value = c.id
            document.getElementById('nombre').value = c.nombre
            document.getElementById('apellido').value = c.apellido
            document.getElementById('telefono').value = c.telefono
            document.getElementById('email').value = c.email
            tituloDialogo.textContent = 'Editar Contacto'
            dialogo.showModal()
        }
    }
})


render()
