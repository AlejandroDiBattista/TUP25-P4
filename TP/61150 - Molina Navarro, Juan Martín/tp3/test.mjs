import { parseVcf } from './src/services/alumnos.js';
import fs from 'node:fs';
const text = fs.readFileSync('./src/alumnos.vcf','utf8');
const arr = parseVcf(text);
console.log('count', arr.length);
console.log(arr.slice(0,3));
