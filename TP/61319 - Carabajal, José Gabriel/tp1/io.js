const fsp = require("fs").promises;
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("node:process");


async function read(origen = './agenda.json'){
    const data = await fsp.readFile(origen, 'utf-8');
    return data ?? "[]";
}

async function write(texto, destino = './agenda.json'){
  await fsp.writeFile(destino, texto, 'utf-8');
}

async function prompt(mensaje = "") {
  const linea = readline.createInterface({ input, output });
  try {
    const respuesta = await linea.question(mensaje);
    return respuesta.trim();
  } finally {
    linea.close();
  }
}

module.exports = { read, write, prompt };