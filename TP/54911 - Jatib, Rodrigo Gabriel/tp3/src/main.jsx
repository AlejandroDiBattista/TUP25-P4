import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '@picocss/pico/css/pico.min.css';
import './styles/custom.css';

const rootElement = document.getElementById('root');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
