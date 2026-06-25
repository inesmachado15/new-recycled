const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const excelPath = path.join(__dirname, "..", "data", "Catalogo.xlsx");
const outputPath = path.join(__dirname, "..", "data", "products.json");

function criarId(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function limparTexto(valor) {
  if (valor === undefined || valor === null) return "";
  return String(valor).trim();
}

function converterPreco(valor) {
  if (valor === undefined || valor === null || valor === "") return null;

  const numero = Number(String(valor).replace(",", "."));

  if (Number.isNaN(numero)) return null;

  return numero;
}

function formatarPreco(preco, precoTextoExcel) {
  const precoTexto = limparTexto(precoTextoExcel);

  if (precoTexto) return precoTexto;

  if (preco === null) return "Sob consulta";

  return `${preco.toFixed(2).replace(".", ",")}€`;
}

function converterAtivo(valor) {
  const texto = limparTexto(valor).toLowerCase();

  if (texto === "não" || texto === "nao" || texto === "false" || texto === "0") {
    return false;
  }

  return true;
}

if (!fs.existsSync(excelPath)) {
  console.error("Erro: não encontrei o ficheiro data/Catalogo.xlsx");
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);

const folhaProdutos =
  workbook.Sheets["Produtos"] || workbook.Sheets[workbook.SheetNames[0]];

if (!folhaProdutos) {
  console.error("Erro: não encontrei nenhuma folha no Excel.");
  process.exit(1);
}

const linhas = XLSX.utils.sheet_to_json(folhaProdutos, {
  defval: "",
});

const produtos = linhas
  .map((linha, index) => {
    const nome = limparTexto(linha.nome);
    const categoria = limparTexto(linha.categoria);
    const referencia = limparTexto(linha.referencia);
    const marca = limparTexto(linha.marca);

    if (!nome) return null;

    const preco = converterPreco(linha.preco);
    const idExcel = limparTexto(linha.id);

    return {
      id: idExcel || criarId(`${nome}-${referencia || index + 1}`),
      nome,
      categoria: categoria || "Sem categoria",
      preco,
      precoTexto: formatarPreco(preco, linha.precoTexto),
      estado: limparTexto(linha.estado) || "Disponível",
      referencia,
      marca: marca || "Genérico",
      imagem: limparTexto(linha.imagem),
      descricao: limparTexto(linha.descricao),
      compatibilidade: limparTexto(linha.compatibilidade),
      ativo: converterAtivo(linha.ativo),
      destaque: limparTexto(linha.destaque).toLowerCase() === "sim",
    };
  })
  .filter(Boolean)
  .filter((produto) => produto.ativo);

fs.writeFileSync(outputPath, JSON.stringify(produtos, null, 2), "utf-8");

console.log(`Catálogo convertido com sucesso.`);
console.log(`${produtos.length} produto(s) exportado(s) para data/products.json`);