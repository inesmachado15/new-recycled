import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
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
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  if (k) process.env[k] = v;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

// Ler referências do CSV
const CSV_PATH = path.join(__dirname, "..", "data", "precos_calculados.csv");
const csv = readFileSync(CSV_PATH, "utf-8");
const lines = csv.split("\n").filter((l) => l.trim());
const headers = lines[0].replace(/\r$/, "").split(";");
const rows = lines.slice(1).map((line) => {
  const vals = line.replace(/\r$/, "").split(";");
  return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
});
const refsCSV = new Set(rows.map((r) => r.referencia.trim()).filter(Boolean));
console.log(`CSV: ${refsCSV.size} referências`);

// Buscar todas as referências do Supabase (paginado)
console.log("A buscar referências do Supabase...");
const refsSupabase = new Set();
let from = 0;
const PAGE = 1000;
while (true) {
  const { data, error } = await supabase
    .from("products")
    .select("reference")
    .range(from, from + PAGE - 1);
  if (error) { console.error(error.message); break; }
  if (!data || data.length === 0) break;
  for (const row of data) refsSupabase.add(row.reference);
  from += PAGE;
  if (data.length < PAGE) break;
}
console.log(`Supabase: ${refsSupabase.size} produtos`);

// Diferença: no CSV mas não no Supabase
const naoEncontrados = [...refsCSV].filter((r) => !refsSupabase.has(r));
console.log(`\nNão encontrados no Supabase: ${naoEncontrados.length}`);

// Guardar lista com detalhes
const detalhes = rows.filter((r) => naoEncontrados.includes(r.referencia.trim()));
const output = path.join(__dirname, "..", "data", "nao-encontrados.csv");
const csvOut = ["referencia;nome;categoria;custo;preco", ...detalhes.map((r) =>
  `${r.referencia};${r.nome};${r.categoria};${r.custo};${r.preco}`
)].join("\n");
writeFileSync(output, csvOut, "utf-8");
console.log(`\n→ Lista guardada em data/nao-encontrados.csv`);
console.log("\nPrimeiros 20:");
for (const r of detalhes.slice(0, 20)) {
  console.log(`  ${r.referencia.padEnd(25)} ${r.nome.substring(0, 50)}`);
}
