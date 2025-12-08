'use strict';

class Contacto {
  constructor(nombre, apellido, edad, telefono, mail) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.telefono = telefono;
    this.mail = mail;
  }
}

class Agenda {
  constructor(contactosIniciales = []) {
    this.contactos = contactosIniciales.map(c => new Contacto(c.nombre, c.apellido, c.edad, c.telefono, c.mail));
  }

  mostrarFormularioAgregar() {
    document.getElementById('modal-bg').style.display = 'block';
    document.getElementById('formularioAgregar').style.display = 'block';
  }

  cancelarAgregar() {
    document.getElementById('modal-bg').style.display = 'none';
    document.getElementById('formularioAgregar').style.display = 'none';
    document.getElementById('formContactoAgregar').reset();
    document.getElementById('resultadoAgregar').innerText = '';
  }

  normalizar(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  buscarContacto() {
    const termino = this.normalizar(document.getElementById('search').value.trim());
    let resultados;
    if (termino === '') {
      resultados = this.contactos;
    } else {
      resultados = this.contactos.filter(c =>
        this.normalizar(c.nombre).includes(termino) ||
        this.normalizar(c.apellido).includes(termino) ||
        this.normalizar(c.telefono).includes(termino) ||
        this.normalizar(c.mail).includes(termino)
      );
    }
    this.mostrarContactos(resultados);
  }

  mostrarContactos(lista = this.contactos) {
    const contenedor = document.getElementById('listaContactos');
    contenedor.innerHTML = '';
    lista.forEach((c, i) => {
      const card = document.createElement('div');
      card.className = 'contact-card';
      card.innerHTML = `
        <p><strong>${c.nombre} ${c.apellido}</strong><br></p>
        <p>Edad: ${c.edad}</p>
        <p>Tel: ${c.telefono}</p>
        <p>Mail: ${c.mail}</p>
        <button class="btnEditar" data-idx="${i}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen-line-icon lucide-pen-line"><path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg></button>
        <button class="btnEliminar" data-idx="${i}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eraser-icon lucide-eraser"><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/><path d="m5.082 11.09 8.828 8.828"/></svg></button>
      `;
      contenedor.appendChild(card);
    });
    contenedor.querySelectorAll('.btnEditar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.editarContacto(btn.dataset.idx);
      });
    });
    contenedor.querySelectorAll('.btnEliminar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.eliminarContacto(btn.dataset.idx);
      });
    });
  }

  mostrarFormularioEditar(idx) {
    const contacto = this.contactos[idx];
    document.getElementById('modal-bg').style.display = 'block';
    document.getElementById('formularioEditar').style.display = 'block';
    document.getElementById('nombreEditar').value = contacto.nombre;
    document.getElementById('apellidoEditar').value = contacto.apellido;
    document.getElementById('edadEditar').value = contacto.edad;
    document.getElementById('telefonoEditar').value = contacto.telefono;
    document.getElementById('mailEditar').value = contacto.mail;
    document.getElementById('resultadoEditar').innerText = '';
    document.getElementById('formContactoEditar').dataset.idx = idx;
  }

  cancelarEditar() {
    document.getElementById('modal-bg').style.display = 'none';
    document.getElementById('formularioEditar').style.display = 'none';
    document.getElementById('formContactoEditar').reset();
    document.getElementById('resultadoEditar').innerText = '';
  }

  eliminarContacto(idx) {
    this.contactos.splice(idx, 1);
    this.mostrarContactos();
  }

  editarContacto(idx) {
    this.mostrarFormularioEditar(idx);
  }

  agregarContactoDesdeForm(e) {
    e.preventDefault();
    const contacto = new Contacto(
      document.getElementById('nombreAgregar').value,
      document.getElementById('apellidoAgregar').value,
      document.getElementById('edadAgregar').value,
      document.getElementById('telefonoAgregar').value,
      document.getElementById('mailAgregar').value
    );
    this.contactos.push(contacto);
    document.getElementById('resultadoAgregar').innerText = 'Contacto agregado!';
    e.target.reset();
    this.mostrarContactos();
    this.cancelarAgregar();
  }

  editarContactoDesdeForm(e) {
    e.preventDefault();
    const idx = e.target.dataset.idx;
    const contacto = this.contactos[idx];
    contacto.nombre = document.getElementById('nombreEditar').value;
    contacto.apellido = document.getElementById('apellidoEditar').value;
    contacto.edad = document.getElementById('edadEditar').value;
    contacto.telefono = document.getElementById('telefonoEditar').value;
    contacto.mail = document.getElementById('mailEditar').value;
    document.getElementById('resultadoEditar').innerText = 'Contacto editado!';
    e.target.reset();
    this.mostrarContactos();
    this.cancelarEditar();
  }
}


const agenda = new Agenda([]);

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnAgregar').addEventListener('click', () => agenda.mostrarFormularioAgregar());
  document.getElementById('btnCancelarAgregar').addEventListener('click', () => agenda.cancelarAgregar());
  document.getElementById('btnCancelarEditar').addEventListener('click', () => agenda.cancelarEditar());
  document.getElementById('formContactoAgregar').addEventListener('submit', (e) => agenda.agregarContactoDesdeForm(e));
  document.getElementById('formContactoEditar').addEventListener('submit', (e) => agenda.editarContactoDesdeForm(e));
  document.getElementById('search').addEventListener('input', () => agenda.buscarContacto());
  agenda.mostrarContactos();
});

