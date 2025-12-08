

function Topbar({ searchTerm, onSearchChange }) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      marginBottom: '20px'
    }}>
      <h1 style={{ 
        margin: '0 0 15px 0', 
        fontSize: '24px',
        color: '#333'
      }}>
        Directorio de Alumnos
      </h1>
      <input
        type="text"
        placeholder="Buscar por nombre, teléfono o legajo..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          outline: 'none'
        }}
      />
    </div>
  );
}

export default Topbar;