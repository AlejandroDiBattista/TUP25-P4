// Agenda de Contactos - Lógica principal
(function() {
    'use strict';

    // Clase Contacto
    class Contacto {
        constructor(id, nombre, apellido, telefono, email) {
            this.id = id;
            this.nombre = nombre;
            this.apellido = apellido;
            this.telefono = telefono;
            this.email = email;
        }

        // Método para obtener el nombre completo
        getNombreCompleto() {
            return `${this.nombre} ${this.apellido}`;
        }

        // Método para normalizar texto (para búsquedas)
        static normalizeText(text) {
            return text
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
        }

        // Método para verificar si el contacto coincide con el término de búsqueda
        matchesSearch(searchTerm) {
            if (!searchTerm) return true;
            
            const normalizedSearch = Contacto.normalizeText(searchTerm);
            const normalizedName = Contacto.normalizeText(this.nombre);
            const normalizedLastName = Contacto.normalizeText(this.apellido);
            const normalizedFullName = Contacto.normalizeText(this.getNombreCompleto());
            const normalizedPhone = Contacto.normalizeText(this.telefono);
            const normalizedEmail = Contacto.normalizeText(this.email);

            return normalizedName.includes(normalizedSearch) ||
                   normalizedLastName.includes(normalizedSearch) ||
                   normalizedFullName.includes(normalizedSearch) ||
                   normalizedPhone.includes(normalizedSearch) ||
                   normalizedEmail.includes(normalizedSearch);
        }
    }

    // Clase Agenda
    class Agenda {
        constructor() {
            this.contactos = [];
            this.nextId = 1;
        }

        // Agregar contacto
        agregar(nombre, apellido, telefono, email) {
            const contacto = new Contacto(this.nextId++, nombre, apellido, telefono, email);
            this.contactos.push(contacto);
            return contacto;
        }

        // Actualizar contacto
        actualizar(id, nombre, apellido, telefono, email) {
            const contacto = this.contactos.find(c => c.id === id);
            if (contacto) {
                contacto.nombre = nombre;
                contacto.apellido = apellido;
                contacto.telefono = telefono;
                contacto.email = email;
                return contacto;
            }
            return null;
        }

        // Borrar contacto
        borrar(id) {
            const index = this.contactos.findIndex(c => c.id === id);
            if (index !== -1) {
                return this.contactos.splice(index, 1)[0];
            }
            return null;
        }

        // Obtener contacto por ID
        obtenerPorId(id) {
            return this.contactos.find(c => c.id === id);
        }

        // Buscar contactos
        buscar(searchTerm = '') {
            return this.contactos.filter(contacto => contacto.matchesSearch(searchTerm));
        }

        // Obtener todos los contactos ordenados
        obtenerTodos() {
            return [...this.contactos].sort((a, b) => {
                const apellidoA = Contacto.normalizeText(a.apellido);
                const apellidoB = Contacto.normalizeText(b.apellido);
                const nombreA = Contacto.normalizeText(a.nombre);
                const nombreB = Contacto.normalizeText(b.nombre);
                
                const apellidoComparison = apellidoA.localeCompare(apellidoB);
                if (apellidoComparison !== 0) {
                    return apellidoComparison;
                }
                return nombreA.localeCompare(nombreB);
            });
        }

        // Cargar datos de ejemplo
        cargarDatosEjemplo() {
            const ejemplos = [
                { nombre: 'Juan', apellido: 'Pérez', telefono: '+54 381 123-4567', email: 'juan.perez@email.com' },
                { nombre: 'María', apellido: 'García', telefono: '+54 381 234-5678', email: 'maria.garcia@email.com' },
                { nombre: 'Carlos', apellido: 'López', telefono: '+54 381 345-6789', email: 'carlos.lopez@email.com' },
                { nombre: 'Ana', apellido: 'Martínez', telefono: '+54 381 456-7890', email: 'ana.martinez@email.com' },
                { nombre: 'Luis', apellido: 'Rodríguez', telefono: '+54 381 567-8901', email: 'luis.rodriguez@email.com' },
                { nombre: 'Elena', apellido: 'Fernández', telefono: '+54 381 678-9012', email: 'elena.fernandez@email.com' },
                { nombre: 'Miguel', apellido: 'González', telefono: '+54 381 789-0123', email: 'miguel.gonzalez@email.com' },
                { nombre: 'Carmen', apellido: 'Sánchez', telefono: '+54 381 890-1234', email: 'carmen.sanchez@email.com' },
                { nombre: 'Diego', apellido: 'Ramírez', telefono: '+54 381 901-2345', email: 'diego.ramirez@email.com' },
                { nombre: 'Sofía', apellido: 'Torres', telefono: '+54 381 012-3456', email: 'sofia.torres@email.com' }
            ];

            ejemplos.forEach(ejemplo => {
                this.agregar(ejemplo.nombre, ejemplo.apellido, ejemplo.telefono, ejemplo.email);
            });
        }
    }

    // Controlador de la aplicación
    class AgendaApp {
        constructor() {
            this.agenda = new Agenda();
            this.currentSearchTerm = '';
            this.editingContactId = null;
            
            this.initializeElements();
            this.bindEvents();
            this.loadInitialData();
        }

        // Inicializar referencias a elementos del DOM
        initializeElements() {
            this.searchInput = document.getElementById('searchInput');
            this.addContactBtn = document.getElementById('addContactBtn');
            this.contactsList = document.getElementById('contactsList');
            this.contactDialog = document.getElementById('contactDialog');
            this.contactForm = document.getElementById('contactForm');
            this.dialogTitle = document.getElementById('dialogTitle');
            this.closeDialogBtn = document.getElementById('closeDialogBtn');
            this.cancelBtn = document.getElementById('cancelBtn');
            this.saveBtn = document.getElementById('saveBtn');
            this.emptyState = document.getElementById('emptyState');
        }

        // Vincular eventos
        bindEvents() {
            // Búsqueda en tiempo real
            this.searchInput.addEventListener('input', (e) => {
                this.currentSearchTerm = e.target.value;
                this.renderContacts();
            });

            // Botón agregar
            this.addContactBtn.addEventListener('click', () => {
                this.openDialog();
            });

            // Cerrar diálogo
            this.closeDialogBtn.addEventListener('click', () => {
                this.closeDialog();
            });

            this.cancelBtn.addEventListener('click', () => {
                this.closeDialog();
            });

            // Cerrar diálogo al hacer clic fuera
            this.contactDialog.addEventListener('click', (e) => {
                if (e.target === this.contactDialog) {
                    this.closeDialog();
                }
            });

            // Formulario
            this.contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveContact();
            });

            // Cerrar con Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.contactDialog.open) {
                    this.closeDialog();
                }
            });
        }

        // Cargar datos iniciales
        loadInitialData() {
            this.agenda.cargarDatosEjemplo();
            this.renderContacts();
        }

        // Renderizar lista de contactos
        renderContacts() {
            const contacts = this.currentSearchTerm 
                ? this.agenda.buscar(this.currentSearchTerm).sort((a, b) => {
                    const apellidoA = Contacto.normalizeText(a.apellido);
                    const apellidoB = Contacto.normalizeText(b.apellido);
                    const nombreA = Contacto.normalizeText(a.nombre);
                    const nombreB = Contacto.normalizeText(b.nombre);
                    
                    const apellidoComparison = apellidoA.localeCompare(apellidoB);
                    if (apellidoComparison !== 0) {
                        return apellidoComparison;
                    }
                    return nombreA.localeCompare(nombreB);
                  })
                : this.agenda.obtenerTodos();

            if (contacts.length === 0) {
                this.contactsList.style.display = 'none';
                this.emptyState.style.display = 'block';
                return;
            }

            this.contactsList.style.display = 'grid';
            this.emptyState.style.display = 'none';

            this.contactsList.innerHTML = contacts.map(contact => this.createContactCard(contact)).join('');

            // Vincular eventos de las tarjetas
            this.bindCardEvents();
        }

        // Crear HTML de tarjeta de contacto
        createContactCard(contact) {
            return `
                <div class="contact-card" data-id="${contact.id}">
                    <div class="contact-header">
                        <h3 class="contact-name">${this.escapeHtml(contact.getNombreCompleto())}</h3>
                        <div class="contact-actions">
                            <button class="action-btn edit-btn" data-id="${contact.id}" title="Editar contacto">
                                ✏️
                            </button>
                            <button class="action-btn delete-btn" data-id="${contact.id}" title="Eliminar contacto">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="contact-info">
                        <div class="contact-detail">
                            <span class="contact-icon">📞</span>
                            <span>${this.escapeHtml(contact.telefono)}</span>
                        </div>
                        <div class="contact-detail">
                            <span class="contact-icon">✉️</span>
                            <span>${this.escapeHtml(contact.email)}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Vincular eventos de las tarjetas
        bindCardEvents() {
            // Botones de editar
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const contactId = parseInt(btn.dataset.id);
                    this.editContact(contactId);
                });
            });

            // Botones de eliminar
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const contactId = parseInt(btn.dataset.id);
                    this.deleteContact(contactId);
                });
            });
        }

        // Abrir diálogo (agregar o editar)
        openDialog(contactId = null) {
            this.editingContactId = contactId;
            
            if (contactId) {
                // Modo edición
                const contact = this.agenda.obtenerPorId(contactId);
                if (contact) {
                    this.dialogTitle.textContent = 'Editar Contacto';
                    document.getElementById('nombre').value = contact.nombre;
                    document.getElementById('apellido').value = contact.apellido;
                    document.getElementById('telefono').value = contact.telefono;
                    document.getElementById('email').value = contact.email;
                }
            } else {
                // Modo agregar
                this.dialogTitle.textContent = 'Agregar Contacto';
                this.contactForm.reset();
            }

            this.contactDialog.showModal();
            document.getElementById('nombre').focus();
        }

        // Cerrar diálogo
        closeDialog() {
            this.contactDialog.close();
            this.contactForm.reset();
            this.editingContactId = null;
        }

        // Guardar contacto
        saveContact() {
            const formData = new FormData(this.contactForm);
            const nombre = formData.get('nombre').trim();
            const apellido = formData.get('apellido').trim();
            const telefono = formData.get('telefono').trim();
            const email = formData.get('email').trim();

            if (this.editingContactId) {
                // Actualizar
                this.agenda.actualizar(this.editingContactId, nombre, apellido, telefono, email);
            } else {
                // Agregar
                this.agenda.agregar(nombre, apellido, telefono, email);
            }

            this.closeDialog();
            this.renderContacts();
        }

        // Editar contacto
        editContact(contactId) {
            this.openDialog(contactId);
        }

        // Eliminar contacto
        deleteContact(contactId) {
            this.agenda.borrar(contactId);
            this.renderContacts();
        }

        // Escapar HTML para prevenir XSS
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    // Inicializar la aplicación cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
        new AgendaApp();
    });

})();
