/**
 * Corrige descrições onde a marca está errada (Canon com "HP toner", etc.)
 * Uso: node scripts/corrigir-marcas-desc.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx < 0) continue;
  const k = trimmed.slice(0, eqIdx).trim();
  let v = trimmed.slice(eqIdx + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (k) process.env[k] = v;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function gerarDescricaoToner(nome) {
  const original = nome.includes("Original");
  const tipo = original ? "toner original" : "toner compatível";
  let cor = "";
  for (const c of ["Preto", "Ciano", "Magenta", "Amarelo"]) {
    if (nome.includes(c)) { cor = ` ${c.toLowerCase()}`; break; }
  }
  const marca = nome.split(" ")[0];
  return `${marca} ${tipo}${cor} para impressoras a laser. Garante impressões nítidas e duradouras com qualidade profissional.`;
}

function gerarDescricaoTinteiro(nome) {
  const original = nome.includes("Original");
  const tipo = original ? "tinteiro original" : "tinteiro compatível";
  let cor = "";
  for (const c of ["Preto", "Ciano", "Magenta", "Amarelo", "Tricolor"]) {
    if (nome.includes(c)) { cor = ` ${c.toLowerCase()}`; break; }
  }
  const marca = nome.split(" ")[0];
  return `${marca} ${tipo}${cor} para impressoras a jacto de tinta. Cores vivas e impressão precisa para documentos e fotografias.`;
}

async function main() {
  // buscar Canon com HP na descrição
  const { data: errados } = await supabase
    .from("products")
    .select("id, name, category, description")
    .ilike("name", "Canon%")
    .ilike("description", "HP toner%");

  console.log(`🔍 ${errados?.length} produtos Canon com descrição errada`);

  let corrigidos = 0;
  for (const prod of errados || []) {
    let novaDesc = "";
    if (prod.category === "Toners") novaDesc = gerarDescricaoToner(prod.name);
    else if (prod.category === "Tinteiros") novaDesc = gerarDescricaoTinteiro(prod.name);
    else novaDesc = `${prod.name}. Produto de qualidade para uso profissional.`;

    const { error } = await supabase
      .from("products")
      .update({ description: novaDesc })
      .eq("id", prod.id);

    if (!error) corrigidos++;
  }

  console.log(`✅ ${corrigidos} descrições corrigidas`);
}

main().catch(console.error);
