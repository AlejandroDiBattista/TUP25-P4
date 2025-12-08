const fs = require("fs").promises;

const FILE = "./agenda.json";

async function leerAgenda() {
    try {
        const data = await fs.readFile(FILE, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

async function guardarAgenda(contactos) {
    await fs.writeFile(FILE, JSON.stringify(contactos, null, 2));
}

module.exports = { leerAgenda, guardarAgenda };

