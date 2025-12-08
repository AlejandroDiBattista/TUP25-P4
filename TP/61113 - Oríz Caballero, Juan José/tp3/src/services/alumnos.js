// src/services/alumnos.js
import { parseVcf } from "../utils/text";

export async function loadAlumnos() {
  const resp = await fetch("/alumnos.vcf", { cache: "no-store" });
  if (!resp.ok) throw new Error(`No se pudo cargar /alumnos.vcf (status ${resp.status})`);
  const vcfText = await resp.text();
  return parseVcf(vcfText);
}
