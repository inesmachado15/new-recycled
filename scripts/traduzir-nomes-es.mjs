/**
 * Traduz nomes de produtos em espanhol para português.
 * Usa substituição de padrões comuns — sem API.
 *
 * Uso: node scripts/traduzir-nomes-es.mjs [--dry-run]
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

// ── dicionário ES → PT (ordem importa: mais específico primeiro) ─────────────
const TRADUCOES = [
  // impressão / tinteiros / toners
  [/\bCartucho de Tinta\b/gi, "Cartucho de Tinta"],
  [/\bCartucho de Toner\b/gi, "Cartucho de Toner"],
  [/\bTambor de Imagen\b/gi, "Tambor de Imagem"],
  [/\bTambor de Imagen Remanufacturado\b/gi, "Tambor de Imagem Remanufacturado"],
  [/\bTambor de imagen\b/gi, "Tambor de imagem"],
  [/\bUnidad de Imagen\b/gi, "Unidade de Imagem"],
  [/\bUnidad de imagen\b/gi, "Unidade de imagem"],
  [/\bKit de Mantenimiento\b/gi, "Kit de Manutenção"],
  [/\bKit de mantenimiento\b/gi, "Kit de manutenção"],
  [/\bKit de Limpieza\b/gi, "Kit de Limpeza"],
  [/\bDepósito de Residuos\b/gi, "Depósito de Resíduos"],
  [/\bDeposito de residuos\b/gi, "Depósito de resíduos"],
  [/\bTinta de Secado Rapido\b/gi, "Tinta de Secagem Rápida"],
  [/\bTinta de secado rapido\b/gi, "Tinta de secagem rápida"],
  [/\bTinta de Secado Rápido\b/gi, "Tinta de Secagem Rápida"],
  [/\boriginal\b/g, "original"],
  [/\bCompatible\b/g, "Compatível"],
  [/\bcompatible\b/g, "compatível"],
  [/\bRemanufacturado\b/g, "Remanufacturado"],
  [/\bremanufacturado\b/g, "remanufacturado"],
  [/\bNegro\b/g, "Preto"],
  [/\bnegro\b/g, "preto"],
  [/\bCian\b/g, "Ciano"],
  [/\bcian\b/g, "ciano"],
  [/\bAmarillo\b/g, "Amarelo"],
  [/\bamarillo\b/g, "amarelo"],
  [/\bAzul\b/g, "Azul"],
  [/\bRojo\b/g, "Vermelho"],
  [/\brojo\b/g, "vermelho"],
  [/\bTricolor\b/g, "Tricolor"],
  [/\bAlta Capacidad\b/gi, "Alta Capacidade"],
  [/\balta capacidad\b/gi, "alta capacidade"],
  [/\bAlta capacidad\b/gi, "Alta capacidade"],
  [/\bCapacidad\b/g, "Capacidade"],
  [/\bcapacidad\b/g, "capacidade"],
  [/\bpáginas\b/g, "páginas"],
  // papelaria / escritório
  [/\bEsferográfica\b/g, "Esferográfica"],
  [/\bEsferografica\b/g, "Esferográfica"],
  [/\besferográfica\b/g, "esferográfica"],
  [/\besferografica\b/g, "esferográfica"],
  [/\bRetractil\b/g, "Retrátil"],
  [/\bretractil\b/g, "retrátil"],
  [/\bRetráctil\b/g, "Retrátil"],
  [/\bretráctil\b/g, "retrátil"],
  [/\bPunta\b/g, "Ponta"],
  [/\bpunta\b/g, "ponta"],
  [/\bFina\b/g, "Fina"],
  [/\bMedia\b/g, "Média"],
  [/\bmedia\b/g, "média"],
  [/\bGruesa\b/g, "Grossa"],
  [/\bgruesa\b/g, "grossa"],
  [/\bColores\b/g, "Cores"],
  [/\bcolores\b/g, "cores"],
  [/\bColor\b/g, "Cor"],
  [/\bcolor\b/g, "cor"],
  [/\bColores Surtidos\b/gi, "Cores Sortidas"],
  [/\bcolores surtidos\b/gi, "cores sortidas"],
  [/\bSurtido\b/g, "Sortido"],
  [/\bsurtido\b/g, "sortido"],
  [/\bSurtidos\b/g, "Sortidos"],
  [/\bsurtidos\b/g, "sortidos"],
  [/\bMarcador\b/g, "Marcador"],
  [/\bFluorescente\b/g, "Fluorescente"],
  [/\bfluorescente\b/g, "fluorescente"],
  [/\bPermanente\b/g, "Permanente"],
  [/\bpermanente\b/g, "permanente"],
  [/\bBolígrafo\b/g, "Esferográfica"],
  [/\bboligrafo\b/g, "esferográfica"],
  [/\bBolígrafo\b/g, "Esferográfica"],
  [/\bLápiz\b/g, "Lápis"],
  [/\blápiz\b/g, "lápis"],
  [/\blapiz\b/g, "lápis"],
  [/\bLápices\b/g, "Lápis"],
  [/\blápices\b/g, "lápis"],
  [/\blapices\b/g, "lápis"],
  [/\bGrafito\b/g, "Grafite"],
  [/\bgrafito\b/g, "grafite"],
  [/\bRotulador\b/g, "Marcador"],
  [/\brotulador\b/g, "marcador"],
  [/\bResaltador\b/g, "Marcador fluorescente"],
  [/\bresaltador\b/g, "marcador fluorescente"],
  [/\bCarpeta\b/g, "Pasta"],
  [/\bcarpeta\b/g, "pasta"],
  [/\bArchivador\b/g, "Dossier"],
  [/\barchivador\b/g, "dossier"],
  [/\bCuaderno\b/g, "Caderno"],
  [/\bcuaderno\b/g, "caderno"],
  [/\bBloc\b/g, "Bloco"],
  [/\bbloc\b/g, "bloco"],
  [/\bHojas\b/g, "Folhas"],
  [/\bhojas\b/g, "folhas"],
  [/\bFolio\b/g, "Folha A4"],
  [/\bfolio\b/g, "folha A4"],
  [/\bFolios\b/g, "Folhas A4"],
  [/\bfolios\b/g, "folhas A4"],
  [/\bGrapadora\b/g, "Agrafador"],
  [/\bgrapadora\b/g, "agrafador"],
  [/\bPerforadora\b/g, "Furador"],
  [/\bperforadora\b/g, "furador"],
  [/\bTijeras\b/g, "Tesouras"],
  [/\btijeras\b/g, "tesouras"],
  [/\bCinta\b/g, "Fita"],
  [/\bcinta\b/g, "fita"],
  [/\bAdhesiva\b/g, "Adesiva"],
  [/\badhesiva\b/g, "adesiva"],
  [/\bAdhesivo\b/g, "Adesivo"],
  [/\badhesivo\b/g, "adesivo"],
  [/\bPegamento\b/g, "Cola"],
  [/\bpegamento\b/g, "cola"],
  [/\bCalculadora\b/g, "Calculadora"],
  [/\bSacapuntas\b/g, "Afia-lápis"],
  [/\bsacapuntas\b/g, "afia-lápis"],
  [/\bBorrador\b/g, "Borracha"],
  [/\bborrador\b/g, "borracha"],
  [/\bClips\b/g, "Clipes"],
  [/\bclips\b/g, "clipes"],
  [/\bGrapa\b/g, "Agrafos"],
  [/\bgrapha\b/g, "agrafos"],
  [/\bGrapas\b/g, "Agrafos"],
  [/\bgrapas\b/g, "agrafos"],
  [/\bSubrayador\b/g, "Marcador fluorescente"],
  [/\bsubrayador\b/g, "marcador fluorescente"],
  [/\bNotasAdhesivas\b/gi, "Notas Adesivas"],
  [/\bNotas Adhesivas\b/gi, "Notas Adesivas"],
  [/\bnotas adhesivas\b/gi, "notas adesivas"],
  [/\bPost-it\b/gi, "Post-it"],
  [/\bSobre\b/g, "Envelope"],
  [/\bSobres\b/g, "Envelopes"],
  [/\bsobres\b/g, "envelopes"],
  [/\bCartulina\b/g, "Cartolina"],
  [/\bcartulina\b/g, "cartolina"],
  [/\bCartulinas\b/g, "Cartolinas"],
  [/\bcartulinas\b/g, "cartolinas"],
  [/\bBolsa\b/g, "Saco"],
  [/\bbolsa\b/g, "saco"],
  [/\bBolsas\b/g, "Sacos"],
  [/\bbolsas\b/g, "sacos"],
  [/\bAcolchada\b/g, "Acolchoado"],
  [/\bacolchada\b/g, "acolchoado"],
  [/\bFelicitación\b/g, "Cartão de Parabéns"],
  [/\bfelicitación\b/g, "cartão de parabéns"],
  [/\bNavidad\b/g, "Natal"],
  [/\bnavidad\b/g, "natal"],
  [/\bde Navidad\b/gi, "de Natal"],
  // tecnologia
  [/\bImpresora\b/g, "Impressora"],
  [/\bimpresora\b/g, "impressora"],
  [/\bImpresoras\b/g, "Impressoras"],
  [/\bimpresoras\b/g, "impressoras"],
  [/\bEscáner\b/g, "Scanner"],
  [/\bescáner\b/g, "scanner"],
  [/\bEscaner\b/g, "Scanner"],
  [/\bescaner\b/g, "scanner"],
  [/\bMonitor\b/g, "Monitor"],
  [/\bTeclado\b/g, "Teclado"],
  [/\bteclado\b/g, "teclado"],
  [/\bRatón\b/g, "Rato"],
  [/\bratón\b/g, "rato"],
  [/\bRaton\b/g, "Rato"],
  [/\braton\b/g, "rato"],
  [/\binalámbrico\b/gi, "sem fios"],
  [/\bInalámbrico\b/g, "Sem fios"],
  [/\bInalámbrico\b/g, "Sem fios"],
  [/\bSin [Hh]ilos\b/g, "Sem fios"],
  [/\bConexión\b/g, "Ligação"],
  [/\bconexión\b/g, "ligação"],
  // adjetivos / medidas comuns
  [/\bFormato Clásico\b/gi, "Formato Clássico"],
  [/\bformato clásico\b/gi, "formato clássico"],
  [/\bFormato Clásico\b/g, "Formato Clássico"],
  [/\bCompacto\b/g, "Compacto"],
  [/\bcompacto\b/g, "compacto"],
  [/\bPequeño\b/g, "Pequeno"],
  [/\bpequeño\b/g, "pequeno"],
  [/\bGrande\b/g, "Grande"],
  [/\bMediano\b/g, "Médio"],
  [/\bmediano\b/g, "médio"],
  [/\bEstandar\b/gi, "Standard"],
  [/\bEstándar\b/g, "Standard"],
  [/\bProfesional\b/g, "Profissional"],
  [/\bprofesional\b/g, "profissional"],
  [/\bEconómico\b/g, "Económico"],
  [/\beconómico\b/g, "económico"],
  [/\bEcológico\b/g, "Ecológico"],
  [/\becológico\b/g, "ecológico"],
  [/\bFácil\b/g, "Fácil"],
  [/\bfácil\b/g, "fácil"],
  [/\bRápido\b/g, "Rápido"],
  [/\brápido\b/g, "rápido"],
  [/\bRapido\b/g, "Rápido"],
  [/\brapido\b/g, "rápido"],
  [/\bSecado\b/g, "Secagem"],
  [/\bsecado\b/g, "secagem"],
  [/\bForma\b/g, "Forma"],
  [/\bforma\b/g, "forma"],
  [/\bNuevo\b/g, "Novo"],
  [/\bnuevo\b/g, "novo"],
  [/\bPaquete\b/g, "Pacote"],
  [/\bpaquete\b/g, "pacote"],
  [/\bPaquete de\b/gi, "Pacote de"],
  [/\bUnidades\b/g, "Unidades"],
  [/\bunidades\b/g, "unidades"],
  [/\bUnidad\b/g, "Unidade"],
  [/\bunidad\b/g, "unidade"],
  [/\bCaja\b/g, "Caixa"],
  [/\bcaja\b/g, "caixa"],
  [/\bCajas\b/g, "Caixas"],
  [/\bcajas\b/g, "caixas"],
  [/\bPack\b/g, "Pack"],
  [/\bpack\b/g, "pack"],
  [/\bHecho de\b/gi, "Feito de"],
  [/\bhecho de\b/gi, "feito de"],
  [/\bMaterial Reciclado\b/gi, "Material Reciclado"],
  [/\bPapel Reciclado\b/gi, "Papel Reciclado"],
  [/\bRecargable\b/g, "Recarregável"],
  [/\brecargable\b/g, "recarregável"],
  [/\bRecargables\b/g, "Recarregáveis"],
  [/\brecargables\b/g, "recarregáveis"],
  [/\bRecargas\b/g, "Recargas"],
  [/\brecargas\b/g, "recargas"],
  // papelaria — termos que faltavam
  [/\bde Envelopemesa\b/gi, "de Mesa"],
  [/\bEnvelopemesa\b/gi, "Mesa"],
  [/\bde Sobremesa\b/gi, "de Mesa"],
  [/\bSobremesa\b/gi, "Mesa"],
  [/\bDigitos\b/g, "Dígitos"],
  [/\bdigitos\b/g, "dígitos"],
  [/\bRemanufacturado\b/g, "Remanufaturado"],
  [/\bremanufacturado\b/g, "remanufaturado"],
  [/\bRaiz Cuadrada\b/gi, "Raiz Quadrada"],
  [/\bHasta (\d)/g, "Até $1"],
  [/\bhasta (\d)/g, "até $1"],
  [/\bApagado Automático\b/gi, "Desligamento Automático"],
  [/\bApagado Automatico\b/gi, "Desligamento Automático"],
  [/\bDibujo\b/g, "Desenho"],
  [/\bdibujo\b/g, "desenho"],
  [/\bCierre\b/g, "Fecho"],
  [/\bcierre\b/g, "fecho"],
  [/\bEscritorio\b/g, "Secretária"],
  [/\bescritorio\b/g, "secretária"],
  [/\bIncluye\b/g, "Inclui"],
  [/\bincluye\b/g, "inclui"],
  [/\bPantalla\b/g, "Ecrã"],
  [/\bpantalla\b/g, "ecrã"],
  [/\bSeñalización\b/gi, "Sinalização"],
  [/\bSeñalizacion\b/gi, "Sinalização"],
  [/\bsenaliz\w+/gi, (m) => "Sinaliz" + m.slice(8)],
  [/\bTamaño\b/g, "Tamanho"],
  [/\btamaño\b/g, "tamanho"],
  [/\bTamano\b/g, "Tamanho"],
  [/\btamano\b/g, "tamanho"],
  [/\bBlancas\b/g, "Brancas"],
  [/\bblancas\b/g, "brancas"],
  [/\bBlancos\b/g, "Brancos"],
  [/\bblancos\b/g, "brancos"],
  [/\bBlanca\b/g, "Branca"],
  [/\bblanca\b/g, "branca"],
  [/\bBlanco\b/g, "Branco"],
  [/\bblanco\b/g, "branco"],
  [/\bCantos Romos\b/gi, "Cantos Arredondados"],
  [/\bCantos Rectos\b/gi, "Cantos Retos"],
  [/\b([Ss])in Marco\b/g, "$1em Moldura"],
  [/\bTaladro Perforador\b/gi, "Furador"],
  [/\bTaladro\b/g, "Furador"],
  [/\btaladro\b/g, "furador"],
  [/\bPerforador\b/g, "Furador"],
  [/\bperforador\b/g, "furador"],
  [/\bPortátil\b/g, "Portátil"],
  [/\bPortatil\b/g, "Portátil"],
  [/\bportatil\b/g, "portátil"],
  [/\bCuadrícula\b/gi, "Quadrícula"],
  [/\bCuadricula\b/gi, "Quadrícula"],
  [/\bCastellano\b/g, "Castelhano"],
  [/\bcastellano\b/g, "castelhano"],
  [/\bCremallera\b/g, "Fecho de Correr"],
  [/\bcremallera\b/g, "fecho de correr"],
  [/\bCremalleras\b/g, "Fechos de Correr"],
  [/\bcremalleras\b/g, "fechos de correr"],
  [/\bBolsillo\b/g, "Bolso"],
  [/\bbolsillo\b/g, "bolso"],
  [/\bBolsillos\b/g, "Bolsos"],
  [/\bbolsillos\b/g, "bolsos"],
  [/\bTapa\b/g, "Capa"],
  [/\btapa\b/g, "capa"],
  [/\bTapas\b/g, "Capas"],
  [/\btapas\b/g, "capas"],
  [/\bCuerpo\b/g, "Corpo"],
  [/\bcuerpo\b/g, "corpo"],
  [/\bPlástico\b/g, "Plástico"],
  [/\bPlastico\b/g, "Plástico"],
  [/\bplastico\b/g, "plástico"],
  [/\bCompartimentos\b/g, "Compartimentos"],
  [/\bOrdenador\b/g, "Computador"],
  [/\bordenador\b/g, "computador"],
  [/\bEstuche Portatodo\b/gi, "Estojo"],
  [/\bEstuche\b/g, "Estojo"],
  [/\bestuche\b/g, "estojo"],
  [/\bPortatodo\b/g, "Estojo"],
  [/\bportatodo\b/g, "estojo"],
  [/\bAtril\b/g, "Suporte"],
  [/\batril\b/g, "suporte"],
  [/\bDiseño\b/g, "Design"],
  [/\bdiseño\b/g, "design"],
  [/\bTejido\b/g, "Tecido"],
  [/\btejido\b/g, "tecido"],
  [/\bTrazo\b/g, "Traço"],
  [/\btrazo\b/g, "traço"],
  [/\blos\b/g, "os"],
  [/\bLos\b/g, "Os"],
  [/\bNuevos\b/g, "Novos"],
  [/\bnuevos\b/g, "novos"],
  [/\bNuevo\b/g, "Novo"],
  [/\bnuevo\b/g, "novo"],
  [/\bAcabado\b/g, "Acabamento"],
  [/\bacabado\b/g, "acabamento"],
  [/\bBrillante\b/g, "Brilhante"],
  [/\bbrillante\b/g, "brilhante"],
  [/\bBrillantes\b/g, "Brilhantes"],
  [/\bbrillantes\b/g, "brilhantes"],
  [/\bMagnetica\b/g, "Magnética"],
  [/\bmagnetica\b/g, "magnética"],
  [/\bDestruidor\b/gi, "Trituradora"],
  [/\bDestruidora\b/g, "Trituradora"],
  [/\bdestruidora\b/g, "trituradora"],
  [/\bImpresión\b/g, "Impressão"],
  [/\bImpresion\b/g, "Impressão"],
  [/\bimpresion\b/g, "impressão"],
  [/\bAlimentación\b/g, "Alimentação"],
  [/\bAlimentacion\b/g, "Alimentação"],
  [/\balimentacion\b/g, "alimentação"],
  [/\bFunción\b/g, "Função"],
  [/\bFuncion\b/g, "Função"],
  [/\bfuncion\b/g, "função"],
  [/\bConexión\b/g, "Ligação"],
  [/\bConexion\b/g, "Ligação"],
  [/\bconexion\b/g, "ligação"],
  [/\bMemoria\b/g, "Memória"],
  [/\bmemoria\b/g, "memória"],
  [/\b([Cc])on ([A-Z])/g, (_, c, next) => (c === 'C' ? 'Com ' : 'com ') + next],
  [/\b([Ss])in ([A-Z])/g, (_, s, next) => (s === 'S' ? 'Sem ' : 'sem ') + next],
  [/\b([Yy]) ([A-Z])/g, (_, y, next) => (y === 'Y' ? 'e ' : 'e ') + next],
  [/\bCuarto\b/g, "Quarto"],
  [/\bcuarto\b/g, "quarto"],
  [/\bAgrafador de Grafo\b/gi, "Agrafador"],
  [/\bMarcas de Formato\b/gi, "Marcas de Formato"],
  [/\bPorpunto\b/gi, "Ponteiro"],
  [/\bPizarra\b/g, "Quadro"],
  [/\bpizarra\b/g, "quadro"],
  [/\bMagnetíca\b/gi, "Magnética"],
  [/\bAlmofada de carimbo\b/gi, "Almofada de Carimbo"],
];

function traduzir(nome) {
  let n = nome;
  for (const [re, pt] of TRADUCOES) n = n.replace(re, pt);
  return n;
}

function precisaTraduzir(nome) {
  // palavras espanholas que nunca aparecem em português
  const indicadores = [
    /\bRetractil\b/i, /\bRetráctil\b/i, /\bNegro\b/i, /\bAmarillo\b/i,
    /\bCian\b/i, /\bColores\b/i, /\bImpresora\b/i, /\bTambor de Imagen\b/i,
    /\bBoligrafo\b/i, /\bBolígrafo\b/i, /\bRotulador\b/i, /\bResaltador\b/i,
    /\bTijeras\b/i, /\bGrapadora\b/i, /\bPerforadora\b/i, /\bCarpeta\b/i,
    /\bCuaderno\b/i, /\bHojas\b/i, /\bFolios?\b/i, /\bCartulina\b/i,
    /\bSacapuntas\b/i, /\bBorrador\b/i, /\bGrapas\b/i, /\bSobres?\b/i,
    /\bRatón\b/i, /\bRaton\b/i, /\bTeclado\b/i, /\bInalámbrico\b/i,
    /\binalámbrico\b/i, /\bClásico\b/i, /\bPegamento\b/i, /\bAdhesiv/i,
    /\bSecado\b/i, /\bRapido\b/i, /\bPunta\b/i, /\bColor\b/i,
    /\bCompatible\b/i, /\bPaquete\b/i, /\bUnidades\b/i, /\bNavidad\b/i,
    /\bFelicitac/i, /\bAcolchada\b/i,
    /\bEnvelopemesa\b/i, /\bSobremesa\b/i, /\bDigitos\b/, /\bRemanufacturado\b/i,
    /\bRaiz Cuadrada\b/i, /\bHasta \d/i, /\bApagado Auto/i, /\bDibujo\b/i,
    /\bCierre\b/i, /\bEscritorio\b/i, /\bIncluye\b/i, /\bPantalla\b/i,
    /\bSeñaliz/i, /\bTamaño\b/i, /\bTamano\b/i, /\bBlanc[ao]s?\b/i,
    /\bCantos Romos\b/i, /\bCantos Rectos\b/i, /\bsin Marco\b/i,
    /\bTaladro\b/i, /\bPerforador\b/i, /\bCuadricula\b/i, /\bCastellano\b/i,
    /\bCremallera\b/i, /\bBolsillo\b/i, /\bTapa\b/i, /\bOrdenador\b/i,
    /\bPortatodo\b/i, /\bAtril\b/i, /\bImpresion\b/i, /\bAlimentacion\b/i,
    /\bFuncion\b/i, /\bConexion\b/i, /\bMemoria\b/i, /\bCuarto\b/i,
    /\bPizarra\b/i, /\b[Cc]on [A-Z]/,
  ];
  return indicadores.some(re => re.test(nome));
}

async function main() {
  // buscar todos os produtos
  const todos = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.from("products")
      .select("id,name").range(offset, offset + 999);
    if (error) throw error;
    todos.push(...data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  const aTradutor = [];
  for (const p of todos) {
    if (!precisaTraduzir(p.name)) continue;
    const nova = traduzir(p.name);
    if (nova !== p.name) aTradutor.push({ id: p.id, name: nova, original: p.name });
  }

  console.log(`📦 ${todos.length} produtos verificados`);
  console.log(`🌐 ${aTradutor.length} nomes com espanhol detectado\n`);

  if (DRY_RUN) {
    console.log("Exemplos:");
    for (const p of aTradutor.slice(0, 10)) {
      console.log(`  Antes:  ${p.original}`);
      console.log(`  Depois: ${p.name}\n`);
    }
    return;
  }

  let ok = 0, err = 0;
  const LOTE = 50;
  for (let i = 0; i < aTradutor.length; i += LOTE) {
    await Promise.all(aTradutor.slice(i, i + LOTE).map(async ({ id, name }) => {
      const { error } = await supabase.from("products").update({ name }).eq("id", id);
      if (error) err++; else ok++;
    }));
    process.stdout.write(`\r  ${Math.min(i + LOTE, aTradutor.length)}/${aTradutor.length}...`);
  }
  console.log(`\n✅ ${ok} nomes traduzidos${err ? ` / ❌ ${err} erros` : ""}`);
}

main().catch(console.error);
