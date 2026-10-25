/**
 * Atualiza descrições no Supabase a partir de products_com_descricoes.csv
 * Uso: node scripts/atualizar-descricoes.mjs
 *
 * Faz match por campo `reference`. Atualiza: description, compatibility.
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
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  if (k) process.env[k] = v;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Credenciais Supabase não encontradas no .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_PATH = path.join(
  "/Users/inesmachado/Downloads/scraper_papelaria_muchocartucho/output",
  "products_com_descricoes.csv"
);

function parseCSV(content) {
  const lines = content.split("\n").filter((l) => l.trim());
  const headers = lines[0].replace(/\r$/, "").split(",");
  return lines.slice(1).map((line) => {
    // split respeitando vírgulas dentro de aspas
    const vals = [];
    let cur = "";
    let inQuotes = false;
    for (const ch of line.replace(/\r$/, "")) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { vals.push(cur); cur = ""; }
      else { cur += ch; }
    }
    vals.push(cur);
    return Object.fromEntries(headers.map((h, i) => [h.replace(/^﻿/, ""), vals[i] ?? ""]));
  });
}

async function main() {
  console.log("A ler products_com_descricoes.csv...");
  const csv = readFileSync(CSV_PATH, "utf-8");
  const rows = parseCSV(csv);
  console.log(`  ${rows.length} produtos com descrições`);

  let atualizados = 0;
  let naoEncontrados = 0;
  let erros = 0;

  const LOTE = 50;
  for (let i = 0; i < rows.length; i += LOTE) {
    const lote = rows.slice(i, i + LOTE);

    await Promise.all(
      lote.map(async (row) => {
        const ref = (row.reference || "").trim();
        const description = (row.description || "").trim();
        const compatibility = (row.compatibility || "").trim();

        if (!ref || !description) return;

        const { data, error } = await supabase
          .from("products")
          .update({ description, compatibility })
          .eq("reference", ref)
          .select("id");

        if (error) {
          console.error(`  ✗ Erro em ${ref}: ${error.message}`);
          erros++;
        } else if (!data || data.length === 0) {
          naoEncontrados++;
        } else {
          atualizados += data.length;
        }
      })
    );

    process.stdout.write(
      `\r  Progresso: ${Math.min(i + LOTE, rows.length)}/${rows.length}...`
    );
  }

  console.log(`\n\n✓ Concluído: ${atualizados} atualizados | ${naoEncontrados} não encontrados | ${erros} erros`);
}

main().catch(console.error);
