/**
 * Completa produtos sem preço e/ou sem descrição no Supabase.
 * - Preço: ceil_to_99(supplier_price × margem), mesmas regras da loja
 * - Descrição: gerada a partir do nome e categoria
 * Uso: node scripts/completar-produtos.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

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

// ── preços ────────────────────────────────────────────────────────────────────

const MARGENS = { Tinteiros: 0.35, Toners: 0.35, "Consumíveis": 0.35 };
const MARGEM_PADRAO = 0.25;

function ceilTo99(valor) {
  return Math.ceil(valor) - 0.01;
}

function calcularPreco(supplierPrice, categoria) {
  const custo = parseFloat(supplierPrice);
  if (!custo || custo <= 0) return null;
  const margem = MARGENS[categoria] ?? MARGEM_PADRAO;
  return ceilTo99(custo * (1 + margem));
}

function formatarTexto(preco) {
  return preco.toFixed(2).replace(".", ",") + "€";
}

// ── descrições ────────────────────────────────────────────────────────────────

const MARCAS = ["HP", "Canon", "Epson", "Brother", "Samsung", "Xerox", "Kyocera",
  "Lexmark", "Ricoh", "OKI", "Stabilo", "Oxford", "BIC", "Pilot", "Pentel",
  "Maped", "Esselte", "Apli", "Carioca", "Staedtler", "Bismark", "Milan",
  "Leitz", "Durable", "Fellowes", "Elba", "Avery", "TP-Link"];

function marcaDaNome(nome) {
  const palavras = nome.split(" ");
  for (const p of palavras.slice(0, 3)) {
    if (MARCAS.includes(p)) return p;
  }
  return palavras[0] || "";
}

function gerarDescricao(nome, categoria) {
  const marca = marcaDaNome(nome);
  const n = nome.toLowerCase();

  if (categoria === "Toners") {
    const original = nome.includes("Original");
    const tipo = original ? "toner original" : "toner compatível";
    let cor = "";
    for (const c of ["Preto", "Ciano", "Magenta", "Amarelo"]) {
      if (nome.includes(c)) { cor = ` ${c.toLowerCase()}`; break; }
    }
    return `${marca} ${tipo}${cor} para impressoras a laser. Garante impressões nítidas e duradouras com qualidade profissional.`;
  }

  if (categoria === "Tinteiros") {
    const original = nome.includes("Original");
    const tipo = original ? "tinteiro original" : "tinteiro compatível";
    let cor = "";
    for (const c of ["Preto", "Ciano", "Magenta", "Amarelo", "Tricolor"]) {
      if (nome.includes(c)) { cor = ` ${c.toLowerCase()}`; break; }
    }
    return `${marca} ${tipo}${cor} para impressoras a jacto de tinta. Cores vivas e impressão precisa para documentos e fotografias.`;
  }

  // Papelaria / Material de Escritório
  if (n.includes("caneta") || n.includes("esferográfica") || n.includes("bic") || n.includes("cristal"))
    return `${nome}. Caneta de escrita suave e precisa para uso diário. Ideal para escritório, escola e uso pessoal.`;

  if (n.includes("marcador") || n.includes("stabilo") || n.includes("fluorescente"))
    return `${nome}. Marcador de tinta vibrante e de secagem rápida. Perfeito para realçar textos e organizar apontamentos.`;

  if (n.includes("caderno") || n.includes("notebook") || n.includes("bloco"))
    return `${nome}. Caderno de qualidade com folhas lisas e encadernação resistente. Ideal para apontamentos no escritório ou escola.`;

  if (n.includes("pasta") || n.includes("porta-doc") || n.includes("portadoc") || n.includes("dossier"))
    return `${nome}. Organização eficiente para os teus documentos. Fabricado em material resistente para uso diário no escritório.`;

  if (n.includes("papel") || n.includes("folha") || n.includes("fotográfi"))
    return `${nome}. Papel de alta qualidade para impressão profissional. Compatível com impressoras laser e jacto de tinta.`;

  if (n.includes("borracha") || n.includes("plástico") || n.includes("eraser"))
    return `${nome}. Borracha de alta qualidade que não danifica o papel. Apaga de forma limpa e precisa.`;

  if (n.includes("régua") || n.includes("esquadro") || n.includes("transferi"))
    return `${nome}. Instrumento de precisão para desenho e medição. Fabricado em material resistente e duradouro.`;

  if (n.includes("calculadora"))
    return `${nome}. Calculadora compacta e precisa para uso diário no escritório ou escola.`;

  if (n.includes("sacola") || n.includes("mochila") || n.includes("bolsa"))
    return `${nome}. Mala prática e resistente para transportar os teus materiais com conforto.`;

  if (n.includes("agrafador") || n.includes("furador") || n.includes("clipper"))
    return `${nome}. Acessório de escritório essencial para organizar e arquivar documentos de forma eficiente.`;

  if (n.includes("rolo") || n.includes("térmico") || n.includes("pos"))
    return `${nome}. Rolo térmico para terminais POS e caixas registadoras. Impressão nítida e resistente.`;

  return `${nome}. Produto de qualidade para uso profissional e de escritório. Ideal para empresas e particulares.`;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  // buscar produtos sem preço OU sem descrição
  const { data: produtos } = await supabase
    .from("products")
    .select("id, name, category, supplier_price, price, description")
    .or("price.is.null,price.eq.0,description.is.null,description.eq.");

  console.log(`📦 ${produtos?.length} produtos a completar`);

  let precosFix = 0, descFix = 0, erros = 0;
  const LOTE = 50;

  for (let i = 0; i < (produtos?.length || 0); i += LOTE) {
    const lote = produtos.slice(i, i + LOTE);

    await Promise.all(lote.map(async (p) => {
      const update = {};

      // preço
      const semPreco = !p.price || p.price === 0;
      if (semPreco && p.supplier_price) {
        const preco = calcularPreco(p.supplier_price, p.category);
        if (preco) {
          update.price = preco;
          update.price_text = formatarTexto(preco);
          precosFix++;
        }
      }

      // descrição
      const semDesc = !p.description || p.description.trim() === "";
      if (semDesc && p.name) {
        update.description = gerarDescricao(p.name, p.category);
        descFix++;
      }

      if (Object.keys(update).length === 0) return;

      const { error } = await supabase.from("products").update(update).eq("id", p.id);
      if (error) erros++;
    }));

    process.stdout.write(`\r  ${Math.min(i + LOTE, produtos.length)}/${produtos.length}...`);
  }

  console.log(`\n\n✅ Preços calculados: ${precosFix}`);
  console.log(`✅ Descrições geradas: ${descFix}`);
  if (erros) console.log(`❌ Erros: ${erros}`);
}

main().catch(console.error);
