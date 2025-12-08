class contacto {
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
    this.id = 0;
  }
  agregar(nombre, apellido, telefono, email) {
    const nuevo = new contacto(++this.id, nombre, apellido, telefono, email);
    this.contactos.push(nuevo);
    return nuevo;
  }
  borrar(id) {
    this.contactos = this.contactos.filter(c => c.id !== id);
  }
  editar(id, nombre, apellido, telefono, email) {
    const contacto = this.contactos.find(c => c.id === id);
    if (contacto) {
      contacto.nombre = nombre || contacto.nombre;
      contacto.apellido = apellido || contacto.apellido;
      contacto.telefono = telefono || contacto.telefono;
      contacto.email = email || contacto.email;
    }
  }
  buscar(texto) {
  const normalizar = str =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const criterio = normalizar(texto);

  return this.contactos.filter(c =>
    normalizar(c.nombre).includes(criterio) ||
    normalizar(c.apellido).includes(criterio) ||
    normalizar(c.telefono).includes(criterio) ||
    normalizar(c.email).includes(criterio)
  );
 }
}
function mostrarContactos(contactos) {
  const lista = document.getElementById("lista");
   lista.innerHTML = '';
   if (contactos.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'No se an encontrado contactos.';
    lista.appendChild(msg);
    return;
   }
  contactos.forEach(c => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h4>${c.nombre} ${c.apellido}</h4>
      <p>Tel: ${c.telefono}<br>Email: ${c.email}</p>
      <button data-id="${c.id}" class="editar">✏️</button>
      <button data-id="${c.id}" class="borrar">🗑️</button>
    `;
    lista.appendChild(card);
  });
}
function borrarContacto() {
    document.querySelectorAll('.borrar').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = Number(btn.dataset.id);
            agenda.borrar(id);
            mostrarContactos(agenda.contactos);
            borrarContacto();
        })
    })
}

const btnAgregar = document.getElementById('btnAgregar');
const dlgContacto = document.getElementById('dlgContacto');
const formContacto = document.getElementById('formContacto');
const btnCancelar = document.getElementById('btnCancelar');

btnAgregar.addEventListener('click', () => {
  formContacto.reset();
  document.getElementById('dlgTitulo').textContent = 'Nuevo contacto';
  document.getElementById('contactoId').value = '';
  dlgContacto.showModal();
});

btnCancelar.addEventListener('click', () => {
  dlgContacto.close();
});

formContacto.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('contactoId').value;
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const telefono = document.getElementById('telefono').value;
  const email = document.getElementById('email').value;

  if (id) {
    agenda.editar(Number(id), nombre, apellido, telefono, email);
  } else {
    agenda.agregar(nombre, apellido, telefono, email);
  }
  mostrarContactos(agenda.contactos);
  agregarEventosBorrar();
  agregarEventosEditar();
  dlgContacto.close();
});

function agregarEventosBorrar() {
  document.querySelectorAll('.borrar').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      agenda.borrar(id);
      mostrarContactos(agenda.contactos);
      agregarEventosBorrar();
      agregarEventosEditar();
    };
  });
}

function agregarEventosEditar() {
  document.querySelectorAll('.editar').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const c = agenda.contactos.find(c => c.id === id);
      if (c) {
        document.getElementById('dlgTitulo').textContent = 'Editar contacto';
        document.getElementById('contactoId').value = c.id;
        document.getElementById('nombre').value = c.nombre;
        document.getElementById('apellido').value = c.apellido;
        document.getElementById('telefono').value = c.telefono;
        document.getElementById('email').value = c.email;
        dlgContacto.showModal();
      }
    };
  });
}


const agenda = new Agenda();
agenda.agregar("Maximiliano", "Massey", "2234567890", "maximassey5@gmailcom");
agenda.agregar("Juan", "Perez", "2234567891", "juanperez@gmailcom");
agenda.agregar("Ana", "Gomez", "2234567892", "anagomez@gmailcom");
agenda.agregar("Luis", "Martinez", "2234567893", "luismartinez@gmailcom");
agenda.agregar("Maria", "Lopez", "2234567894", "marialopez@gmailcom");
agenda.agregar("Carlos", "Sanchez", "2234567895", "carlossanchez@gmailcom");
agenda.agregar("Laura", "Fernandez", "2234567896", "laurafernandez@gmailcom");
agenda.agregar("Pedro", "Gonzalez", "2234567897", "pedrogonzalez@gmailcom");
agenda.agregar("Sofia", "Ramirez", "2234567898", "sofiaramirez@gmailcom");
agenda.agregar("Diego", "Torres", "2234567899", "diegotorres@gmailcom");


mostrarContactos(agenda.contactos);

const buscador = document.getElementById('buscador');
buscador.addEventListener('input', () => {
  const texto = buscador.value;
  if (texto.trim() === "") {
    mostrarContactos(agenda.contactos);
  } else {
    const resultados = agenda.buscar(texto);
    mostrarContactos(resultados);
  }
  agregarEventosBorrar();
  agregarEventosEditar();
});