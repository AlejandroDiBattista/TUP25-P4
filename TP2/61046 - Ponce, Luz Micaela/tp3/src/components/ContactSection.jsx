import React from "react"
import ContactCard from "./ContactCard";

function ContactSection({ title, contacts, toggleFavorito, favoritos }) {

    return (
        <section style={{ padding: "1rem" }}>
            <h2>{title}</h2>
            {contacts.length === 0 ? (
                <p>No hay resultados</p>
            ) : (
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {contacts.map((c, i) => (
                        <ContactCard
                            key={c.id ?? i}
                            alumno={c}
                            toggleFavorito={toggleFavorito}
                            isFavorito={!!c.favoritos}
                        />
                ))}
                </div>
            )}
    </section>

    );
}

export default ContactSection;