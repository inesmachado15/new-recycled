/**
 * Recalcula preços de todos os produtos diretamente do supplier_price na Supabase.
 * Não usa CSV nem faz match por reference — opera por ID, sem risco de duplicados.
 *
 * Rejeita supplier_price < 1€ (valor suspeito/placeholder).
 * Só atualiza se o preço calculado difere do atual em mais de 0.02€.
 *
 * Uso: node scripts/recalcular-precos.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const DRY_RUN = process.argv.includes("--dry-run");
if (DRY_RUN) console.log("🔍 Modo dry-run — sem alterações na base de dados\n");

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

const MARGENS = { Tinteiros: 0.35, Toners: 0.35, "Consumíveis": 0.35 };
const MARGEM_PADRAO = 0.25;
// Custo mínimo por categoria — Toners/Tinteiros/Consumíveis raramente custam menos de 1€
const CUSTO_MINIMO = { Toners: 1.0, Tinteiros: 1.0, "Consumíveis": 1.0 };
const CUSTO_MINIMO_PADRAO = 0.05; // papelaria pode custar centimos

function ceil99(custo, categoria) {
  const m = MARGENS[categoria] ?? MARGEM_PADRAO;
  return Math.ceil(custo * (1 + m)) - 0.01;
}

function formatarTexto(preco) {
  return preco.toFixed(2).replace(".", ",") + "€";
}

async function main() {
  // buscar todos os produtos com supplier_price, paginado
  const todos = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, supplier_price, price")
      .not("supplier_price", "is", null)
      .gt("supplier_price", 0)
      .range(offset, offset + 999);
    if (error) { console.error("Erro ao carregar:", error.message); process.exit(1); }
    todos.push(...data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  console.log(`📦 ${todos.length} produtos com custo carregados\n`);

  const ignorados = [];
  const aAtualizar = [];
  const semMudanca = [];

  for (const p of todos) {
    const custo = parseFloat(p.supplier_price);

    const custoMin = CUSTO_MINIMO[p.category] ?? CUSTO_MINIMO_PADRAO;
    if (custo < custoMin) {
      ignorados.push(p);
      continue;
    }

    const precoCorreto = ceil99(custo, p.category);
    const precoAtual = parseFloat(p.price ?? 0);

    if (Math.abs(precoCorreto - precoAtual) > 0.02) {
      aAtualizar.push({ id: p.id, price: precoCorreto, price_text: formatarTexto(precoCorreto), precoAnterior: precoAtual, custo });
    } else {
      semMudanca.push(p);
    }
  }

  console.log(`✅ Já corretos:      ${semMudanca.length}`);
  console.log(`🔄 A atualizar:      ${aAtualizar.length}`);
  console.log(`⚠️  Custo suspeito (abaixo do mínimo por cat.): ${ignorados.length} — ignorados`);

  if (ignorados.length > 0) {
    console.log("\nProdutos ignorados (custo suspeito):");
    for (const p of ignorados.slice(0, 10)) {
      console.log(`  ${p.supplier_price}€  ${p.name?.slice(0, 60)}`);
    }
    if (ignorados.length > 10) console.log(`  ... e mais ${ignorados.length - 10}`);
  }

  if (DRY_RUN || aAtualizar.length === 0) {
    console.log("\nNada alterado.");
    return;
  }

  // atualizar em lotes de 50
  const LOTE = 50;
  let atualizados = 0, erros = 0;
  for (let i = 0; i < aAtualizar.length; i += LOTE) {
    const lote = aAtualizar.slice(i, i + LOTE);
    await Promise.all(lote.map(async ({ id, price, price_text }) => {
      const { error } = await supabase.from("products").update({ price, price_text }).eq("id", id);
      if (error) erros++;
      else atualizados++;
    }));
    process.stdout.write(`\r  ${Math.min(i + LOTE, aAtualizar.length)}/${aAtualizar.length}...`);
  }

  console.log(`\n\n✅ ${atualizados} preços atualizados`);
  if (erros) console.log(`❌ ${erros} erros`);
}

main().catch(console.error);
