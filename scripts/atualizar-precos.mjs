/**
 * Atualiza preços no Supabase a partir do ficheiro data/precos_calculados.csv
 * Uso: node scripts/atualizar-precos.mjs
 *
 * Faz match por campo `reference` (referência do produto).
 * Atualiza campos: price (número) e price_text (ex: "18,99€")
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ler .env.local manualmente (suporta valores com = e com aspas)
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx < 0) continue;
  const k = trimmed.slice(0, eqIdx).trim();
  let v = trimmed.slice(eqIdx + 1).trim();
  // remover aspas envolventes se existirem
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  if (k) process.env[k] = v;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Diagnóstico — remover depois de funcionar
console.log("URL:", url ? url.substring(0, 40) + "..." : "❌ NÃO ENCONTRADA");
console.log("KEY:", key ? key.substring(0, 20) + "..." : "❌ NÃO ENCONTRADA");

if (!url || !key) {
  console.error("\n❌ Credenciais não encontradas no .env.local");
  console.error("Verifica se o ficheiro existe em:", envPath);
  process.exit(1);
}

const supabase = createClient(url, key);

const CSV_PATH = path.join(__dirname, "..", "data", "precos_calculados.csv");

async function main() {
  console.log("A ler precos_calculados.csv...");
  const csv = readFileSync(CSV_PATH, "utf-8");
  // CSV com separador ponto-e-vírgula para evitar conflito com vírgula decimal
  const lines = csv.split("\n").filter((l) => l.trim());
  const headers = lines[0].replace(/\r$/, "").split(";");
  const rows = lines.slice(1).map((line) => {
    const vals = line.replace(/\r$/, "").split(";");
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
  console.log(`  ${rows.length} produtos com preço calculado`);

  let atualizados = 0;
  let erros = 0;
  let naoEncontrados = 0;

  // Processar em lotes de 50 para não sobrecarregar a API
  const LOTE = 50;
  for (let i = 0; i < rows.length; i += LOTE) {
    const lote = rows.slice(i, i + LOTE);

    await Promise.all(
      lote.map(async (row) => {
        const ref = (row.referencia || "").trim();
        const preco = parseFloat(row.preco);
        const precoTexto = (row.precoTexto || "").trim();

        if (!ref || isNaN(preco)) return;

        const { data, error } = await supabase
          .from("products")
          .update({ price: preco, price_text: precoTexto })
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
      `\r  Progresso: ${Math.min(i + LOTE, rows.length)}/${rows.length} processados...`
    );
  }

  console.log(
    `\n\n✓ Concluído: ${atualizados} atualizados | ${naoEncontrados} não encontrados | ${erros} erros`
  );
}

main().catch(console.error);
