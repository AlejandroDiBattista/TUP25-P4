import fs from "fs/promises";
import readline from "readline";

export function prompt(texto) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(texto, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

export async function read(path) {
    try {
        return JSON.parse(await fs.readFile(path, "utf-8"));
    } catch (err) {
        return [];
    }
}

export async function write(path, data) {
    await fs.writeFile(path, JSON.stringify(data, null, 2));
}
