"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Produto = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  category: string;
  brand: string | null;
  reference: string | null;
  description: string | null;
  compatibility: string | null;
  image_url: string | null;
  price: number | null;
  price_text: string | null;
  stock: number;
  min_stock: number;
  active: boolean;
  featured: boolean;
  allow_backorder: boolean;
  created_at: string;
};

type NovoProduto = {
  sku: string;
  name: string;
  category: string;
  brand: string;
  reference: string;
  description: string;
  compatibility: string;
  image_url: string;
  price: string;
  stock: string;
  min_stock: string;
  active: boolean;
  featured: boolean;
  allow_backorder: boolean;
};

type EstatisticasProdutos = {
  total: number;
  ativos: number;
  inativos: number;
  stockBaixo: number;
  semStock: number;
  destaque: number;
  permiteSemStock: number;
};

const PRODUTOS_POR_PAGINA = 40;

const camposProdutos = `
  id,
  slug,
  sku,
  name,
  category,
  brand,
  reference,
  description,
  compatibility,
  image_url,
  price,
  price_text,
  stock,
  min_stock,
  active,
  featured,
  allow_backorder,
  created_at
`;

const categorias = [
  "Toners",
  "Tinteiros",
  "Consumíveis",
  "Papelaria",
];

const filtrosEstado = [
  "Todos",
  "Ativos",
  "Inativos",
  "Stock baixo",
  "Sem stock",
  "Em destaque",
  "Permite sem stock",
];

function obterEmailsAdmin() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function criarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function criarProdutoVazio(): NovoProduto {
  return {
    sku: "",
    name: "",
    category: "Toners",
    brand: "",
    reference: "",
    description: "",
    compatibility: "",
    image_url: "",
    price: "",
    stock: "0",
    min_stock: "0",
    active: true,
    featured: false,
    allow_backorder: false,
  };
}

function formatarPreco(valor: number | null, priceText?: string | null) {
  if (priceText) return priceText;
  if (valor === null) return "Sob consulta";
  return `${Number(valor).toFixed(2).replace(".", ",")}€`;
}

function normalizarPesquisa(valor: string) {
  return valor.trim().replace(/,/g, " ").replace(/\s+/g, " ");
}

export default function AdminProdutosPage() {
  const router = useRouter();
  const primeiroCarregamentoFiltros = useRef(true);

  const [emailUtilizador, setEmailUtilizador] = useState("");
  const [autorizado, setAutorizado] = useState(false);

  const [aCarregar, setACarregar] = useState(true);
  const [aAtualizar, setAAtualizar] = useState(false);
  const [aCarregarMais, setACarregarMais] = useState(false);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [totalProdutosEncontrados, setTotalProdutosEncontrados] = useState(0);
  const [temMaisProdutos, setTemMaisProdutos] = useState(false);

  const [estatisticas, setEstatisticas] = useState<EstatisticasProdutos>({
    total: 0,
    ativos: 0,
    inativos: 0,
    stockBaixo: 0,
    semStock: 0,
    destaque: 0,
    permiteSemStock: 0,
  });

  const [pesquisa, setPesquisa] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [produtoEmEdicaoId, setProdutoEmEdicaoId] = useState<string | null>(
    null
  );

  const [novoProduto, setNovoProduto] = useState<NovoProduto>(
    criarProdutoVazio()
  );

  const [mostrarCriarProduto, setMostrarCriarProduto] = useState(false);
  const [aCriarProduto, setACriarProduto] = useState(false);

  async function contarProdutosStockBaixo() {
    const { data, error } = await supabase
      .from("products")
      .select("id, stock, min_stock");

    if (error) return 0;

    return (data || []).filter(
      (produto) => Number(produto.stock || 0) <= Number(produto.min_stock || 0)
    ).length;
  }

  async function carregarEstatisticasProdutos() {
    const [
      totalResponse,
      ativosResponse,
      inativosResponse,
      semStockResponse,
      destaqueResponse,
      permiteSemStockResponse,
      stockBaixo,
    ] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),

      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("active", true),

      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("active", false),

      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .lte("stock", 0),

      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("featured", true),

      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("allow_backorder", true),

      contarProdutosStockBaixo(),
    ]);

    setEstatisticas({
      total: totalResponse.count || 0,
      ativos: ativosResponse.count || 0,
      inativos: inativosResponse.count || 0,
      stockBaixo,
      semStock: semStockResponse.count || 0,
      destaque: destaqueResponse.count || 0,
      permiteSemStock: permiteSemStockResponse.count || 0,
    });
  }

  function aplicarFiltrosBasicos(query: any) {
    const termo = normalizarPesquisa(pesquisa);

    if (termo) {
      query = query.or(
        `name.ilike.%${termo}%,category.ilike.%${termo}%,brand.ilike.%${termo}%,reference.ilike.%${termo}%,sku.ilike.%${termo}%,slug.ilike.%${termo}%`
      );
    }

    if (filtroCategoria !== "Todas") {
      query = query.eq("category", filtroCategoria);
    }

    if (filtroEstado === "Ativos") {
      query = query.eq("active", true);
    }

    if (filtroEstado === "Inativos") {
      query = query.eq("active", false);
    }

    if (filtroEstado === "Sem stock") {
      query = query.lte("stock", 0);
    }

    if (filtroEstado === "Em destaque") {
      query = query.eq("featured", true);
    }

    if (filtroEstado === "Permite sem stock") {
      query = query.eq("allow_backorder", true);
    }

    return query;
  }

  async function carregarProdutos(reiniciar = true) {
    setErro("");

    if (reiniciar && produtos.length === 0) {
      setACarregar(true);
    }

    if (reiniciar && produtos.length > 0) {
      setAAtualizar(true);
    }

    if (!reiniciar) {
      setACarregarMais(true);
    }

    const inicio = reiniciar ? 0 : produtos.length;
    const fim = inicio + PRODUTOS_POR_PAGINA - 1;

    if (filtroEstado === "Stock baixo") {
      let query = supabase
        .from("products")
        .select(camposProdutos)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      query = aplicarFiltrosBasicos(query);

      const { data, error } = await query;

      if (error) {
        setErro(`Erro ao carregar produtos: ${error.message}`);
        setACarregar(false);
        setAAtualizar(false);
        setACarregarMais(false);
        return;
      }

      const todosFiltrados = ((data || []) as Produto[]).filter(
        (produto) => Number(produto.stock || 0) <= Number(produto.min_stock || 0)
      );

      const pagina = todosFiltrados.slice(inicio, fim + 1);

      if (reiniciar) {
        setProdutos(pagina);
        setTemMaisProdutos(todosFiltrados.length > pagina.length);
      } else {
        setProdutos((atuais) => {
          const atualizados = [...atuais, ...pagina];
          setTemMaisProdutos(todosFiltrados.length > atualizados.length);
          return atualizados;
        });
      }

      setTotalProdutosEncontrados(todosFiltrados.length);
      setACarregar(false);
      setAAtualizar(false);
      setACarregarMais(false);
      return;
    }

    let query = supabase
      .from("products")
      .select(camposProdutos, { count: "exact" })
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    query = aplicarFiltrosBasicos(query);

    const { data, error, count } = await query.range(inicio, fim);

    if (error) {
      setErro(`Erro ao carregar produtos: ${error.message}`);
      setACarregar(false);
      setAAtualizar(false);
      setACarregarMais(false);
      return;
    }

    const novosProdutos = (data || []) as Produto[];
    const total = count || 0;

    if (reiniciar) {
      setProdutos(novosProdutos);
      setTemMaisProdutos(total > novosProdutos.length);
    } else {
      setProdutos((atuais) => {
        const atualizados = [...atuais, ...novosProdutos];
        setTemMaisProdutos(total > atualizados.length);
        return atualizados;
      });
    }

    setTotalProdutosEncontrados(total);
    setACarregar(false);
    setAAtualizar(false);
    setACarregarMais(false);
  }

  async function atualizarPainelProdutos() {
    setAAtualizar(true);

    await Promise.all([
      carregarEstatisticasProdutos(),
      carregarProdutos(true),
    ]);

    setAAtualizar(false);
  }

  useEffect(() => {
    async function carregarPagina() {
      setACarregar(true);
      setErro("");

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        setErro(`Erro ao validar sessão: ${error.message}`);
        setACarregar(false);
        return;
      }

      if (!user) {
        setACarregar(false);
        router.push("/entrar");
        return;
      }

      const email = user.email || "";
      setEmailUtilizador(email);

      const emailsAdmin = obterEmailsAdmin();

      if (!emailsAdmin.includes(email.toLowerCase())) {
        setAutorizado(false);
        setACarregar(false);
        return;
      }

      setAutorizado(true);

      await Promise.all([
        carregarEstatisticasProdutos(),
        carregarProdutos(true),
      ]);

      setACarregar(false);
    }

    carregarPagina();
  }, [router]);

  useEffect(() => {
    if (!autorizado) return;

    if (primeiroCarregamentoFiltros.current) {
      primeiroCarregamentoFiltros.current = false;
      return;
    }

    const temporizador = setTimeout(() => {
      carregarProdutos(true);
    }, 300);

    return () => clearTimeout(temporizador);
  }, [pesquisa, filtroEstado, filtroCategoria, autorizado]);

  function atualizarProdutoLocal(
    produtoId: string,
    campo: keyof Produto,
    valor: string | number | boolean | null
  ) {
    setProdutos((atuais) =>
      atuais.map((produto) =>
        produto.id === produtoId ? { ...produto, [campo]: valor } : produto
      )
    );
  }

  function atualizarNovoProduto(
    campo: keyof NovoProduto,
    valor: string | boolean
  ) {
    setNovoProduto((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  async function criarProduto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setErro("");
    setACriarProduto(true);

    const nome = novoProduto.name.trim();
    const sku = novoProduto.sku.trim();

    if (!nome) {
      setErro("O nome do produto é obrigatório.");
      setACriarProduto(false);
      return;
    }

    if (!sku) {
      setErro("O SKU é obrigatório.");
      setACriarProduto(false);
      return;
    }

    const preco =
      novoProduto.price.trim() === "" ? null : Number(novoProduto.price);

    if (preco !== null && Number.isNaN(preco)) {
      setErro("O preço não é válido.");
      setACriarProduto(false);
      return;
    }

    const stock = Math.max(0, Number(novoProduto.stock || 0));
    const minStock = Math.max(0, Number(novoProduto.min_stock || 0));

    const slugBase = criarSlug(`${sku}-${nome}`);
    const slug = slugBase || criarSlug(nome);

    const priceText =
      preco === null ? "Sob consulta" : `${preco.toFixed(2).replace(".", ",")}€`;

    const { error } = await supabase.from("products").insert({
      sku,
      slug,
      name: nome,
      category: novoProduto.category,
      brand: novoProduto.brand.trim() || null,
      reference: novoProduto.reference.trim() || null,
      description: novoProduto.description.trim() || null,
      compatibility: novoProduto.compatibility.trim() || null,
      image_url: novoProduto.image_url.trim() || null,
      price: preco,
      price_text: priceText,
      stock,
      min_stock: minStock,
      active: novoProduto.active,
      featured: novoProduto.featured,
      allow_backorder: novoProduto.allow_backorder,
    });

    if (error) {
      setErro(`Não foi possível criar o produto: ${error.message}`);
      setACriarProduto(false);
      return;
    }

    setMensagem("Produto criado com sucesso.");
    setNovoProduto(criarProdutoVazio());
    setMostrarCriarProduto(false);

    await Promise.all([
      carregarEstatisticasProdutos(),
      carregarProdutos(true),
    ]);

    setACriarProduto(false);
  }

  async function guardarProduto(produto: Produto) {
    setMensagem("");
    setErro("");

    const precoNormalizado =
      produto.price === null || Number.isNaN(Number(produto.price))
        ? null
        : Number(produto.price);

    const stockNormalizado = Math.max(0, Number(produto.stock || 0));
    const stockMinimoNormalizado = Math.max(0, Number(produto.min_stock || 0));

    const priceText =
      precoNormalizado === null
        ? "Sob consulta"
        : `${precoNormalizado.toFixed(2).replace(".", ",")}€`;

    const skuNormalizado =
      produto.sku && produto.sku.trim() !== "" ? produto.sku.trim() : null;

    const { error } = await supabase
      .from("products")
      .update({
        sku: skuNormalizado,
        name: produto.name,
        category: produto.category,
        brand: produto.brand,
        reference: produto.reference,
        description: produto.description,
        compatibility: produto.compatibility,
        image_url: produto.image_url,
        price: precoNormalizado,
        price_text: priceText,
        stock: stockNormalizado,
        min_stock: stockMinimoNormalizado,
        active: produto.active,
        featured: produto.featured,
        allow_backorder: produto.allow_backorder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", produto.id);

    if (error) {
      setErro(`Não foi possível atualizar o produto: ${error.message}`);
      return;
    }

    setProdutos((atuais) =>
      atuais.map((item) =>
        item.id === produto.id
          ? {
              ...produto,
              sku: skuNormalizado,
              price: precoNormalizado,
              price_text: priceText,
              stock: stockNormalizado,
              min_stock: stockMinimoNormalizado,
            }
          : item
      )
    );

    await carregarEstatisticasProdutos();

    setMensagem("Produto atualizado com sucesso.");
    setProdutoEmEdicaoId(null);
  }

  async function terminarSessao() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function limparFiltros() {
    setPesquisa("");
    setFiltroEstado("Todos");
    setFiltroCategoria("Todas");
  }

  function contarPorEstado(estado: string) {
    if (estado === "Todos") return estatisticas.total;
    if (estado === "Ativos") return estatisticas.ativos;
    if (estado === "Inativos") return estatisticas.inativos;
    if (estado === "Stock baixo") return estatisticas.stockBaixo;
    if (estado === "Sem stock") return estatisticas.semStock;
    if (estado === "Em destaque") return estatisticas.destaque;
    if (estado === "Permite sem stock") return estatisticas.permiteSemStock;

    return 0;
  }

  if (aCarregar) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A carregar produtos...
          </p>
        </section>
      </main>
    );
  }

  if (!autorizado) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
            Acesso restrito
          </p>

          <h1 className="mt-4 text-3xl font-black">Sem permissão</h1>

          <p className="mt-4 text-slate-600">
            Está autenticado com o email{" "}
            <span className="font-bold">{emailUtilizador}</span>, mas este email
            não está autorizado a aceder à gestão de produtos.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/"
              className="rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Voltar ao site
            </a>

            <button
              onClick={terminarSessao}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-red-500 hover:text-red-600"
            >
              Terminar sessão
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <a
              href="/admin"
              className="text-sm font-bold text-green-700 hover:text-green-800"
            >
              ← Voltar ao painel
            </a>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-green-700">
              Administração
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Gestão de produtos
            </h1>

            <p className="mt-4 max-w-2xl text-slate-600">
              Consulte, filtre, pesquise, crie e edite produtos sem carregar
              tudo de uma vez.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setMostrarCriarProduto(!mostrarCriarProduto)}
              className="rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            >
              {mostrarCriarProduto ? "Fechar criação" : "Criar produto"}
            </button>

            <button
              onClick={atualizarPainelProdutos}
              disabled={aAtualizar}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {aAtualizar ? "A atualizar..." : "Atualizar produtos"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Total</p>
            <p className="mt-3 text-4xl font-black">{estatisticas.total}</p>
            <p className="mt-2 text-xs text-slate-500">
              {produtos.length} carregados nesta página
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Ativos</p>
            <p className="mt-3 text-4xl font-black">{estatisticas.ativos}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Destaque</p>
            <p className="mt-3 text-4xl font-black">{estatisticas.destaque}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Stock baixo</p>
            <p className="mt-3 text-4xl font-black">
              {estatisticas.stockBaixo}
            </p>
          </div>
        </div>

        {erro && (
          <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            {erro}
          </p>
        )}

        {mensagem && (
          <p className="mt-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-800">
            {mensagem}
          </p>
        )}

        {mostrarCriarProduto && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Novo produto
              </p>

              <h2 className="mt-3 text-2xl font-black">Criar produto</h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Crie produtos individuais diretamente no painel. Para muitos
                produtos, depois fazemos importação por Excel/CSV.
              </p>
            </div>

            <form onSubmit={criarProduto} className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="text-sm font-semibold">
                  SKU
                  <input
                    value={novoProduto.sku}
                    onChange={(event) =>
                      atualizarNovoProduto("sku", event.target.value)
                    }
                    required
                    placeholder="Ex.: HP603XL-PACK-COMP"
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Nome
                  <input
                    value={novoProduto.name}
                    onChange={(event) =>
                      atualizarNovoProduto("name", event.target.value)
                    }
                    required
                    placeholder="Nome do produto"
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Categoria
                  <select
                    value={novoProduto.category}
                    onChange={(event) =>
                      atualizarNovoProduto("category", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  >
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  Marca
                  <input
                    value={novoProduto.brand}
                    onChange={(event) =>
                      atualizarNovoProduto("brand", event.target.value)
                    }
                    placeholder="Ex.: HP"
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Referência
                  <input
                    value={novoProduto.reference}
                    onChange={(event) =>
                      atualizarNovoProduto("reference", event.target.value)
                    }
                    placeholder="Ex.: 603XL"
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Preço
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoProduto.price}
                    onChange={(event) =>
                      atualizarNovoProduto("price", event.target.value)
                    }
                    placeholder="Ex.: 19.99"
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={novoProduto.stock}
                    onChange={(event) =>
                      atualizarNovoProduto("stock", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Stock mínimo
                  <input
                    type="number"
                    min="0"
                    value={novoProduto.min_stock}
                    onChange={(event) =>
                      atualizarNovoProduto("min_stock", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold">
                  Descrição
                  <textarea
                    rows={4}
                    value={novoProduto.description}
                    onChange={(event) =>
                      atualizarNovoProduto("description", event.target.value)
                    }
                    placeholder="Descrição do produto"
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Compatibilidade
                  <textarea
                    rows={4}
                    value={novoProduto.compatibility}
                    onChange={(event) =>
                      atualizarNovoProduto("compatibility", event.target.value)
                    }
                    placeholder="Compatibilidades, impressoras ou notas técnicas"
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>
              </div>

              <label className="mt-5 block text-sm font-semibold">
                URL da imagem
                <input
                  value={novoProduto.image_url}
                  onChange={(event) =>
                    atualizarNovoProduto("image_url", event.target.value)
                  }
                  placeholder="/produtos/imagem.png ou URL externa"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                />
              </label>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={novoProduto.active}
                    onChange={(event) =>
                      atualizarNovoProduto("active", event.target.checked)
                    }
                  />
                  Produto ativo
                </label>

                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={novoProduto.featured}
                    onChange={(event) =>
                      atualizarNovoProduto("featured", event.target.checked)
                    }
                  />
                  Produto em destaque
                </label>

                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={novoProduto.allow_backorder}
                    onChange={(event) =>
                      atualizarNovoProduto(
                        "allow_backorder",
                        event.target.checked
                      )
                    }
                  />
                  Permitir sem stock
                </label>
              </div>

              <button
                type="submit"
                disabled={aCriarProduto}
                className="mt-6 rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {aCriarProduto ? "A criar produto..." : "Criar produto"}
              </button>
            </form>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                  Produtos
                </p>

                <h2 className="mt-3 text-2xl font-black">Catálogo</h2>

                <p className="mt-3 text-sm text-slate-500">
                  Clique em “Editar” para abrir o formulário completo de cada
                  produto.
                </p>
              </div>

              <p className="text-sm text-slate-500">
                A mostrar{" "}
                <span className="font-bold text-slate-900">
                  {produtos.length}
                </span>{" "}
                de{" "}
                <span className="font-bold text-slate-900">
                  {totalProdutosEncontrados}
                </span>{" "}
                produtos encontrados
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_260px_220px]">
              <label className="text-sm font-semibold">
                Pesquisar produto
                <input
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                  placeholder="Nome, SKU, categoria, marca, referência..."
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                />
              </label>

              <label className="text-sm font-semibold">
                Categoria
                <select
                  value={filtroCategoria}
                  onChange={(event) => setFiltroCategoria(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                >
                  <option value="Todas">Todas</option>
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={limparFiltros}
                className="self-end rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
              >
                Limpar filtros
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {filtrosEstado.map((filtro) => {
                const ativo = filtroEstado === filtro;

                return (
                  <button
                    key={filtro}
                    type="button"
                    onClick={() => setFiltroEstado(filtro)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      ativo
                        ? "bg-green-700 text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:border-green-700 hover:text-green-700"
                    }`}
                  >
                    {filtro}{" "}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                        ativo
                          ? "bg-white text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {contarPorEstado(filtro)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {produtos.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <h3 className="text-xl font-black">
                Nenhum produto encontrado.
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tenta limpar os filtros ou pesquisar por outro nome, SKU, marca
                ou categoria.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <div className="hidden bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-slate-500 lg:grid lg:grid-cols-[1.2fr_1.1fr_1fr_0.7fr_0.7fr_0.8fr_0.7fr] lg:gap-4">
                <span>Produto</span>
                <span>SKU</span>
                <span>Categoria</span>
                <span>Preço</span>
                <span>Stock</span>
                <span>Estado</span>
                <span className="text-right">Ações</span>
              </div>

              <div className="divide-y divide-slate-200 bg-white">
                {produtos.map((produto) => {
                  const stockBaixo = produto.stock <= produto.min_stock;
                  const semStock = produto.stock <= 0;
                  const emEdicao = produtoEmEdicaoId === produto.id;

                  return (
                    <article key={produto.id} className="p-5">
                      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.1fr_1fr_0.7fr_0.7fr_0.8fr_0.7fr] lg:items-center">
                        <div className="flex gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                            {produto.image_url ? (
                              <img
                                src={produto.image_url}
                                alt={produto.name}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">
                                Sem img.
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="font-black text-slate-950">
                              {produto.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {produto.brand || "Sem marca"} ·{" "}
                              {produto.reference || "Sem referência"}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-slate-600">
                          <span className="font-black text-slate-900 lg:hidden">
                            SKU:{" "}
                          </span>
                          {produto.sku || "Sem SKU"}
                        </p>

                        <p className="text-sm text-slate-600">
                          <span className="font-black text-slate-900 lg:hidden">
                            Categoria:{" "}
                          </span>
                          {produto.category}
                        </p>

                        <p className="text-sm font-bold text-slate-900">
                          <span className="font-black text-slate-900 lg:hidden">
                            Preço:{" "}
                          </span>
                          {formatarPreco(produto.price, produto.price_text)}
                        </p>

                        <p
                          className={`text-sm font-bold ${
                            semStock
                              ? "text-red-700"
                              : stockBaixo
                              ? "text-orange-600"
                              : "text-green-700"
                          }`}
                        >
                          <span className="font-black text-slate-900 lg:hidden">
                            Stock:{" "}
                          </span>
                          {produto.stock}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              produto.active
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {produto.active ? "Ativo" : "Inativo"}
                          </span>

                          {semStock && (
                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                              Sem stock
                            </span>
                          )}

                          {!semStock && stockBaixo && (
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                              Stock baixo
                            </span>
                          )}

                          {produto.featured && (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                              Destaque
                            </span>
                          )}

                          {produto.allow_backorder && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                              Sem stock OK
                            </span>
                          )}
                        </div>

                        <div className="flex justify-start lg:justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setProdutoEmEdicaoId(
                                emEdicao ? null : produto.id
                              )
                            }
                            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
                          >
                            {emEdicao ? "Fechar" : "Editar"}
                          </button>
                        </div>
                      </div>

                      {emEdicao && (
                        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                                Edição do produto
                              </p>

                              <h3 className="mt-2 text-xl font-black">
                                {produto.name}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                SKU: {produto.sku || "Sem SKU"} · Slug:{" "}
                                {produto.slug}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => guardarProduto(produto)}
                              className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
                            >
                              Guardar alterações
                            </button>
                          </div>

                          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <label className="text-sm font-semibold">
                              SKU
                              <input
                                value={produto.sku || ""}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "sku",
                                    event.target.value
                                  )
                                }
                                placeholder="Ex.: HP603XL-PACK-COMP"
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                              />
                            </label>

                            <label className="text-sm font-semibold">
                              Nome
                              <input
                                value={produto.name}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "name",
                                    event.target.value
                                  )
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                              />
                            </label>

                            <label className="text-sm font-semibold">
                              Categoria
                              <select
                                value={produto.category}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "category",
                                    event.target.value
                                  )
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                              >
                                {categorias.map((categoria) => (
                                  <option key={categoria} value={categoria}>
                                    {categoria}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="text-sm font-semibold">
                              Marca
                              <input
                                value={produto.brand || ""}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "brand",
                                    event.target.value
                                  )
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                              />
                            </label>

                            <label className="text-sm font-semibold">
                              Referência
                              <input
                                value={produto.reference || ""}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "reference",
                                    event.target.value
                                  )
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                              />
                            </label>

                            <label className="text-sm font-semibold">
                              Preço
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={produto.price ?? ""}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "price",
                                    event.target.value === ""
                                      ? null
                                      : Number(event.target.value)
                                  )
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                              />
                            </label>

                            <label className="text-sm font-semibold">
                              Stock
                              <input
                                type="number"
                                min="0"
                                value={produto.stock}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "stock",
                                    Number(event.target.value)
                                  )
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                              />
                            </label>

                            <label className="text-sm font-semibold">
                              Stock mínimo
                              <input
                                type="number"
                                min="0"
                                value={produto.min_stock}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "min_stock",
                                    Number(event.target.value)
                                  )
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                              />
                            </label>
                          </div>

                          <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="text-sm font-semibold">
                              Descrição
                              <textarea
                                rows={4}
                                value={produto.description || ""}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "description",
                                    event.target.value
                                  )
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                              />
                            </label>

                            <label className="text-sm font-semibold">
                              Compatibilidade
                              <textarea
                                rows={4}
                                value={produto.compatibility || ""}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "compatibility",
                                    event.target.value
                                  )
                                }
                                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                              />
                            </label>
                          </div>

                          <label className="mt-5 block text-sm font-semibold">
                            URL da imagem
                            <input
                              value={produto.image_url || ""}
                              onChange={(event) =>
                                atualizarProdutoLocal(
                                  produto.id,
                                  "image_url",
                                  event.target.value
                                )
                              }
                              placeholder="/produtos/imagem.png ou URL externa"
                              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                            />
                          </label>

                          <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <label className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-bold">
                              <input
                                type="checkbox"
                                checked={produto.active}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "active",
                                    event.target.checked
                                  )
                                }
                              />
                              Produto ativo
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-bold">
                              <input
                                type="checkbox"
                                checked={produto.featured}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "featured",
                                    event.target.checked
                                  )
                                }
                              />
                              Produto em destaque
                            </label>

                            <label className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-bold">
                              <input
                                type="checkbox"
                                checked={produto.allow_backorder}
                                onChange={(event) =>
                                  atualizarProdutoLocal(
                                    produto.id,
                                    "allow_backorder",
                                    event.target.checked
                                  )
                                }
                              />
                              Permitir sem stock
                            </label>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {temMaisProdutos && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => carregarProdutos(false)}
                disabled={aCarregarMais}
                className="rounded-full bg-green-700 px-8 py-4 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {aCarregarMais ? "A carregar..." : "Carregar mais produtos"}
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}