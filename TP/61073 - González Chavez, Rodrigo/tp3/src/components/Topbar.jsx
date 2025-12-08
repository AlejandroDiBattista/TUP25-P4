import React from "react";
import styles from "./Topbar.module.css";

export default function Topbar({ busqueda, setBusqueda }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Alumnos (Programación 4)</h1>
      <input
        type="text"
        placeholder="Buscar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className={styles.input}
      />
    </header>
  );
}
