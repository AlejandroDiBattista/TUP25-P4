import { useState } from 'react';
import { loadAlumnos } from './services/alumnos';
import { includesContacto } from './utils/text';
import Topbar from './components/Topbar';
import ContactSection from './components/ContactSection';

function App() {
  const [contacts, setContacts] = useState(loadAlumnos());
  const [searchText, setSearchText] = useState('');

  const filteredContacts = contacts.filter(contact =>
    includesContacto(contact, searchText)
  );

  const favoritos = filteredContacts.filter(c => c.favorito);
  const noFavoritos = filteredContacts.filter(c => !c.favorito);

  const toggleFavorite = id => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, favorito: !contact.favorito } : contact
    ));
  };

  return (
    <>
      <Topbar searchText={searchText} setSearchText={setSearchText} />
      <ContactSection title="Favoritos" contacts={favoritos} toggleFavorite={toggleFavorite} />
      <ContactSection title="Contactos" contacts={noFavoritos} toggleFavorite={toggleFavorite} />
    </>
  );
}

export default App;