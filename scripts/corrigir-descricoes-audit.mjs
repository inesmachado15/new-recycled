/**
 * Corrige 3 problemas de descrição detetados na auditoria:
 *
 * 1. Produtos "original" (minúscula no nome) descritos como "compatível"
 * 2. Xerox Everyday com referência própria na frase de compatibilidade
 * 3. Produtos com "Konica Minolta" errado na descrição
 *
 * Uso: node scripts/corrigir-descricoes-audit.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const DRY_RUN = process.argv.includes("--dry-run");
if (DRY_RUN) console.log("🔍 Dry-run — sem alterações\n");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8");
for (const line of envContent.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq < 0) continue;
  const k = t.slice(0, eq).trim();
  let v = t.slice(eq + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (k) process.env[k] = v;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── geradores de descrição (versão corrigida com toLowerCase) ────────────────

function marcaDaNome(nome) {
  const MARCAS = ["HP", "Canon", "Epson", "Brother", "Samsung", "Xerox", "Kyocera",
    "Lexmark", "Ricoh", "OKI", "Konica", "Sharp", "Panasonic", "Toshiba",
    "Olivetti", "Utax", "Triumph", "Develop", "TP-Link", "Stabilo",
    "Oxford", "Pilot", "BIC", "Pentel", "Maped", "Esselte"];
  const palavras = nome.split(" ");
  for (const p of palavras.slice(0, 3)) {
    if (MARCAS.includes(p)) return p;
  }
  return palavras[0] || "";
}

function gerarDescricaoToner(nome) {
  const original = nome.toLowerCase().includes("original"); // fix: toLowerCase
  const tipo = original ? "toner original" : "toner compatível";
  const marca = marcaDaNome(nome);
  let cor = "";
  for (const c of ["Preto", "Ciano", "Magenta", "Amarelo"]) {
    if (nome.includes(c)) { cor = ` ${c.toLowerCase()}`; break; }
  }
  return `${marca} ${tipo}${cor} para impressoras a laser. Garante impressões nítidas e duradouras com qualidade profissional.`;
}

function gerarDescricaoTinteiro(nome) {
  const original = nome.toLowerCase().includes("original"); // fix: toLowerCase
  const tipo = original ? "tinteiro original" : "tinteiro compatível";
  const marca = marcaDaNome(nome);
  let cor = "";
  for (const c of ["Preto", "Ciano", "Magenta", "Amarelo", "Tricolor"]) {
    if (nome.includes(c)) { cor = ` ${c.toLowerCase()}`; break; }
  }
  return `${marca} ${tipo}${cor} para impressoras a jacto de tinta. Cores vivas e impressão precisa para documentos e fotografias.`;
}

// ── fix Xerox: remover frase de compatibilidade com referência própria ────────

function corrigirDescricaoXerox(nome, descricao, referencia) {
  // Remove padrões como "Compatível com impressoras X que utilizem a referência 006R..."
  const padroes = [
    /\s*Compatível com impressoras \w[\w\s]* que utilizem a referência \S+\./gi,
    /\s*Compatível com impressoras \w[\w\s]* que utilizem a referência \S+$/gi,
  ];
  let nova = descricao;
  for (const p of padroes) nova = nova.replace(p, "");
  return nova.trim();
}

async function fetchAll(select, filters = {}) {
  const todos = [];
  let offset = 0;
  while (true) {
    let q = supabase.from("products").select(select).range(offset, offset + 999);
    for (const [k, v] of Object.entries(filters)) q = q[k](...(Array.isArray(v) ? v : [v]));
    const { data, error } = await q;
    if (error) throw error;
    todos.push(...data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return todos;
}

async function aplicar(updates, label) {
  if (DRY_RUN) { console.log(`  → ${updates.length} a corrigir (dry-run)`); return 0; }
  let ok = 0, err = 0;
  const LOTE = 50;
  for (let i = 0; i < updates.length; i += LOTE) {
    await Promise.all(updates.slice(i, i + LOTE).map(async ({ id, description }) => {
      const { error } = await supabase.from("products").update({ description }).eq("id", id);
      if (error) err++; else ok++;
    }));
    process.stdout.write(`\r  ${Math.min(i + LOTE, updates.length)}/${updates.length}...`);
  }
  console.log(`\r  ✅ ${ok} corrigidos${err ? ` / ❌ ${err} erros` : ""}`);
  return ok;
}

async function main() {
  let totalCorrigido = 0;

  // ── Fix 1: "original" com "compatível" na descrição ───────────────────────
  console.log("\n🔧 Fix 1: Originais descritos como compatíveis...");

  const toners = await fetchAll("id,name,description,category",
    { ilike: ["description", "%toner compatível%"] });
  const tinteiros = await fetchAll("id,name,description,category",
    { ilike: ["description", "%tinteiro compatível%"] });

  const fix1 = [];
  for (const p of [...toners, ...tinteiros]) {
    if (!p.name.toLowerCase().includes("original")) continue;
    const nova = p.category === "Toners"
      ? gerarDescricaoToner(p.name)
      : gerarDescricaoTinteiro(p.name);
    if (nova !== p.description) fix1.push({ id: p.id, description: nova });
  }
  console.log(`  Encontrados: ${fix1.length}`);
  if (DRY_RUN && fix1.length > 0) {
    console.log("  Exemplo:");
    console.log(`    Nome: ${fix1[0]?.name ?? ""}`);
    const p0 = [...toners, ...tinteiros].find(p => p.id === fix1[0]?.id);
    console.log(`    Antes: ${p0?.description?.slice(0, 80)}`);
    console.log(`    Depois: ${fix1[0]?.description?.slice(0, 80)}`);
  }
  totalCorrigido += await aplicar(fix1, "originais");

  // ── Fix 2: Xerox Everyday com referência própria na descrição ─────────────
  console.log("\n🔧 Fix 2: Xerox Everyday com referência própria na descrição...");

  const xerox = await fetchAll("id,name,reference,description",
    { ilike: ["name", "Xerox Everyday%"] });

  const fix2 = [];
  for (const p of xerox) {
    if (!p.description || !p.reference) continue;
    if (!p.description.toLowerCase().includes(p.reference.toLowerCase())) continue;
    const nova = corrigirDescricaoXerox(p.name, p.description, p.reference);
    if (nova !== p.description) fix2.push({ id: p.id, description: nova });
  }
  console.log(`  Encontrados: ${fix2.length}`);
  if (DRY_RUN && fix2.length > 0) {
    const p0 = xerox.find(p => p.id === fix2[0]?.id);
    console.log(`    Antes:  ${p0?.description?.slice(0, 100)}`);
    console.log(`    Depois: ${fix2[0]?.description?.slice(0, 100)}`);
  }
  totalCorrigido += await aplicar(fix2, "Xerox");

  // ── Fix 3: Konica Minolta errado ──────────────────────────────────────────
  console.log("\n🔧 Fix 3: 'Konica Minolta' errado na descrição...");

  const konica = await fetchAll("id,name,description,category",
    { ilike: ["description", "%Konica Minolta%"] });

  const fix3 = [];
  for (const p of konica) {
    if (p.name.toLowerCase().includes("konica")) continue; // legítimo
    const nova = p.category === "Toners"
      ? gerarDescricaoToner(p.name)
      : p.category === "Tinteiros"
      ? gerarDescricaoTinteiro(p.name)
      : p.description.replace(/Compatível com impressoras Konica Minolta[^.]+\.\s*/gi, "").trim();
    if (nova !== p.description) fix3.push({ id: p.id, description: nova });
  }
  console.log(`  Encontrados: ${fix3.length}`);
  totalCorrigido += await aplicar(fix3, "Konica");

  // ── Resumo ────────────────────────────────────────────────────────────────
  console.log(`\n✅ Total corrigido: ${totalCorrigido} descrições`);
}

main().catch(console.error);
