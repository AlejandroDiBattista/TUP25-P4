import { promises as fsp } from "fs";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";


export async function read(origen='tp/61338 - Morales, Juan Daniel/tp1/agenda.json'){
    const data = await fsp.readFile(origen, 'utf-8');
    return data ?? "[]";
}

export async function write(texto, destino='tp/61338 - Morales, Juan Daniel/tp1/agenda.json'){
  await fsp.writeFile(destino, texto, 'utf-8');
}

export async function prompt(mensaje = "") {
  const linea = readline.createInterface({ input, output });
  try {
    const respuesta = await linea.question(mensaje);
    return respuesta.trim();
  } finally {
    linea.close();
  }
}