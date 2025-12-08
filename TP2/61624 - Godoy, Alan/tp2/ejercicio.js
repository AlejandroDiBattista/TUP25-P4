'use strict';
// Funciones generales
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
      this.idActual = 1;
    }

    agregar(contacto) {
      contacto.id = this.idActual++;
      this.contactos.push(contacto);
    }

    actualizar(contacto) {
      const idx = this.contactos.findIndex(c => c.id === contacto.id);
      if (idx !== -1) this.contactos[idx] = contacto;
    }

    borrar(id) {
      this.contactos = this.contactos.filter(c => c.id !== id);
    }

    listar(filtro = '') {
      const normalizar = (t) =>
        t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const f = normalizar(filtro);
      return this.contactos
        .filter(c =>
          normalizar(c.nombre).includes(f) ||
          normalizar(c.apellido).includes(f) ||
          c.telefono.includes(f) ||
          normalizar(c.email).includes(f)
        )
        .sort((a, b) => {
          const cmp = a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' });
          return cmp !== 0 ? cmp : a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
        });
    }
}

const agenda = new Agenda();
const lista = document.getElementById('listaContactos');
const buscar = document.getElementById('buscar');
const dlg = document.getElementById('dlgContacto');
const form = document.getElementById('formContacto');
const dlgTitulo = document.getElementById('dlgTitulo');
const btnCancelar = document.getElementById('btnCancelar');

let contactoEditando = null;

// Contactos iniciales
[
  ['Diego', 'Díaz', '11-5555-8080', 'diego.diaz@gmail.com'],
].forEach(([n, a, t, e]) => agenda.agregar(new Contacto(null, n, a, t, e)));

function render() {
    lista.innerHTML = '';
    agenda.listar(buscar.value).forEach(c => {
        const card = document.createElement('div');
        card.className = 'card-contacto col-4'; // PicoCSS: 3 por fila
        card.innerHTML = `
            <h4>${c.nombre} ${c.apellido}</h4>
            <p>📞 ${c.telefono}</p>
            <p>✉️ ${c.email}</p>
            <div class="acciones">
                <button title="Editar">✏️</button>
                <button title="Borrar">🗑️</button>
            </div>
        `;
        const [btnEditar, btnBorrar] = card.querySelectorAll('button');
        btnEditar.onclick = () => abrirDialogo(c);
        btnBorrar.onclick = () => { agenda.borrar(c.id); render(); };
        lista.appendChild(card);
    });
}

function abrirDialogo(c = null) {
    contactoEditando = c;
    if (c) {
        dlgTitulo.textContent = 'Editar contacto';
        form.nombre.value = c.nombre;
        form.apellido.value = c.apellido;
        form.telefono.value = c.telefono;
        form.email.value = c.email;
    } else {
        dlgTitulo.textContent = 'Nuevo contacto';
        form.reset();
    }
    dlg.showModal();
}

document.getElementById('btnAgregar').onclick = () => abrirDialogo();
btnCancelar.onclick = () => dlg.close();

form.onsubmit = e => {
    e.preventDefault();
    const datos = new Contacto(
        contactoEditando ? contactoEditando.id : null,
        form.nombre.value.trim(),
        form.apellido.value.trim(),
        form.telefono.value.trim(),
        form.email.value.trim()
    );
    if (contactoEditando) {
        agenda.actualizar(datos);
    } else {
        agenda.agregar(datos);
    }
    dlg.close();
    render();
};

buscar.oninput = render;

render();
