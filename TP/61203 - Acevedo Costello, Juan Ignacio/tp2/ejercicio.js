// ejercicio.js
class Contacto {
  constructor(nombre, apellido, telefono, email) {
    this.id = null;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
  }
}

class Agenda {
  constructor() {
    this.contacts = [];
    this.nextId = 1;
  }
  add(contacto) {
    contacto.id = this.nextId++;
    this.contacts.push(contacto);
  }
  update(datos) {
    const c = this.contacts.find(c => c.id === datos.id);
    if (c) {
      c.nombre = datos.nombre;
      c.apellido = datos.apellido;
      c.telefono = datos.telefono;
      c.email = datos.email;
    }
  }
  delete(id) {
    this.contacts = this.contacts.filter(c => c.id !== id);
  }
  getSortedContacts() {
    return [...this.contacts].sort((a, b) => {
      const cmp = a.apellido.localeCompare(b.apellido, 'es', {sensitivity: 'base'});
      return cmp !== 0 
        ? cmp 
        : a.nombre.localeCompare(b.nombre, 'es', {sensitivity: 'base'});
    });
  }
}

// Instanciar Agenda y cargar 10 contactos iniciales
const agenda = new Agenda();
const datosIniciales = [
  ["Juan", "Pérez",    "12345678",   "juan@correo.com"],
  ["María", "Gómez",   "87654321",   "maria@correo.com"],
  ["Ana",  "López",    "23456789",   "ana@correo.com"],
  ["José", "González", "34567890",   "jose@correo.com"],
  ["Ángel","Fernández","45678901",   "angel@correo.com"],
  ["Óscar","Ramírez",  "56789012",   "oscar@correo.com"],
  ["Sara", "Núñez",    "67890123",   "sara@correo.com"],
  ["Miguel","Ángel",   "78901234",   "miguel@correo.com"],
  ["Marta","Álvarez",  "89012345",   "marta@correo.com"],
  ["Luis", "Cabrera",  "90123456",   "luis@correo.com"]
];
datosIniciales.forEach(d => agenda.add(new Contacto(d[0], d[1], d[2], d[3])));

const searchInput = document.getElementById('search');
const addBtn       = document.getElementById('addBtn');
const dialog       = document.getElementById('contactDialog');
const form         = document.getElementById('contactForm');
const listContainer= document.getElementById('contactList');
let currentEditId  = null;

// Mostrar contactos iniciales
displayContacts();

// Eventos
searchInput.addEventListener('input', displayContacts);

addBtn.addEventListener('click', () => {
  currentEditId = null;
  form.reset();
  dialog.showModal();
});

document.getElementById('cancelBtn').addEventListener('click', () => {
  form.reset();
  dialog.close();
  currentEditId = null;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const datos = {
    nombre: form.nombre.value,
    apellido: form.apellido.value,
    telefono: form.telefono.value,
    email: form.email.value
  };
  if (currentEditId) {
    datos.id = currentEditId;
    agenda.update(datos);
  } else {
    agenda.add(new Contacto(datos.nombre, datos.apellido, datos.telefono, datos.email));
  }
  form.reset();
  dialog.close();
  currentEditId = null;
  displayContacts();
});

function displayContacts() {
  const term = searchInput.value
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const contactos = agenda.getSortedContacts();
  listContainer.innerHTML = '';

  contactos.forEach(contacto => {
    // Preparar strings normalizados para filtro
    const nom = contacto.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const ape = contacto.apellido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const tel = contacto.telefono.toLowerCase();
    const em  = contacto.email.toLowerCase();

    if ([nom, ape, tel, em].some(campo => campo.includes(term))) {
      // Crear tarjeta de contacto
      const card = document.createElement('article');
      card.className = 'contact-card';

      const hdr = document.createElement('header');
      const h3 = document.createElement('h3');
      h3.textContent = contacto.nombre + ' ' + contacto.apellido;
      hdr.appendChild(h3);
      card.appendChild(hdr);

      const pTel = document.createElement('p');
      pTel.textContent = 'Tel: ' + contacto.telefono;
      card.appendChild(pTel);

      const pEmail = document.createElement('p');
      pEmail.textContent = 'Email: ' + contacto.email;
      card.appendChild(pEmail);

      const actions = document.createElement('div');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.innerHTML = '✏'; 
      editBtn.title = 'Editar';
      editBtn.addEventListener('click', () => {
        // Abrir diálogo con datos cargados
        currentEditId = contacto.id;
        form.nombre.value = contacto.nombre;
        form.apellido.value = contacto.apellido;
        form.telefono.value = contacto.telefono;
        form.email.value = contacto.email;
        dialog.showModal();
      });
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '🗑'; 
      deleteBtn.title = 'Borrar';
      deleteBtn.addEventListener('click', () => {
        agenda.delete(contacto.id);
        displayContacts();
      });

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      card.appendChild(actions);

      listContainer.appendChild(card);
    }
  });
}

addBtn.addEventListener('click', () => {
  currentEditId = null;
  form.reset();
  document.getElementById('dialogTitle').textContent = "Agregar contacto";
  dialog.showModal();
});

editBtn.addEventListener('click', () => {
  currentEditId = contacto.id;
  form.nombre.value = contacto.nombre;
  form.apellido.value = contacto.apellido;
  form.telefono.value = contacto.telefono;
  form.email.value = contacto.email;
  document.getElementById('dialogTitle').textContent = "Editar contacto";
  dialog.showModal();
});
