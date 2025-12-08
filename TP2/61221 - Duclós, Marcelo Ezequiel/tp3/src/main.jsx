import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Montamos la aplicación React en el elemento con id="root"
const root = createRoot(document.getElementById('root'));
root.render(<App />);
