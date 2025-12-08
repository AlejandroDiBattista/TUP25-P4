import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css'; // O './index.css' si tu archivo se llama así

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);