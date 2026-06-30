"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
};

type CarrinhoItem = {
  id: string;
  quantidade: number;
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
  allow_backorder
`;

const categorias = [
  "Todas",
  "Toners",
  "Tinteiros",
  "Consumíveis",
  "Papelaria",
  "Equipamento de Escritório",
];

const disponibilidades = ["Todos", "Em stock", "Disponível por encomenda"];

const marcas = [
  "Todas",
  "HP",
  "Canon",
  "Brother",
  "Epson",
  "Samsung",
  "Xerox",
  "Lexmark",
  "Konica Minolta",
  "Kyocera",
  "OKI",
  "Panasonic",
  "Apli",
  "Dohe",
  "Milan",
  "Oxford",
  "Carioca",
  "Bismark",
  "Outras",
];

const ordenacoes = [
  "Destaques primeiro",
  "Nome A-Z",
  "Preço crescente",
  "Preço decrescente",
];

function formatarPreco(produto: Produto) {
  if (produto.price_text) return produto.price_text;
  if (produto.price === null) return "Sob consulta";

  return `${Number(produto.price).toFixed(2).replace(".", ",")}€`;
}

function produtoDisponivel(produto: Produto) {
  return produto.stock > 0 || produto.allow_backorder;
}

export default function ProdutosPage() {
  return (
    <Suspense>
      <ProdutosConteudo />
    </Suspense>
  );
}

function ProdutosConteudo() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [temMaisProdutos, setTemMaisProdutos] = useState(false);

  const [aCarregar, setACarregar] = useState(true);
  const [aCarregarMais, setACarregarMais] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const searchParams = useSearchParams();
  const categoriaInicial = searchParams.get("categoria") || "Todas";
  const marcaInicial = searchParams.get("marca") || "Todas";

  const [pesquisaInput, setPesquisaInput] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [categoria, setCategoria] = useState(
    categorias.includes(categoriaInicial) ? categoriaInicial : "Todas"
  );
  const [marca, setMarca] = useState(
    marcas.includes(marcaInicial) ? marcaInicial : "Todas"
  );
  const [disponibilidade, setDisponibilidade] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState("Destaques primeiro");
  const [tipoCartuchoToner, setTipoCartuchoToner] = useState("Todos");

  async function carregarProdutos(reiniciar: boolean) {
    const inicio = reiniciar ? 0 : produtos.length;
    const fim = inicio + PRODUTOS_POR_PAGINA;

    if (reiniciar) {
      setACarregar(true);
    }

    if (!reiniciar) {
      setACarregarMais(true);
    }

    setErro("");

    let query = supabase
      .from("products")
      .select(camposProdutos, { count: "exact" })
      .eq("active", true);

    const termo = pesquisa.trim().replace(/,/g, " ");

    if (termo) {
      query = query.or(
        `name.ilike.%${termo}%,category.ilike.%${termo}%,brand.ilike.%${termo}%,reference.ilike.%${termo}%,sku.ilike.%${termo}%,slug.ilike.%${termo}%`
      );
    }

    if (categoria !== "Todas") {
      query = query.eq("category", categoria);
    }

    if (marca !== "Todas" && marca !== "Outras") {
      query = query.eq("brand", marca);
    }

    if (marca === "Outras") {
      const marcasConhecidas = ["HP", "Canon", "Brother", "Epson", "Samsung", "Xerox", "Lexmark", "Konica Minolta", "Kyocera", "OKI", "Panasonic", "Apli", "Dohe", "Milan", "Oxford", "Carioca", "Bismark"];
      query = query.not("brand", "in", `(${marcasConhecidas.map((m) => `"${m}"`).join(",")})`);
    }

    if (tipoCartuchoToner === "Original") {
      query = query.ilike("name", "%Original%");
    }

    if (tipoCartuchoToner === "Compatível") {
      query = query.or("name.ilike.%Compatível%,name.ilike.%Compativel%,name.ilike.%Genérico%,name.ilike.%Generico%");
    }

    if (disponibilidade === "Em stock") {
      query = query.gt("stock", 0);
    }

    if (disponibilidade === "Disponível por encomenda") {
      query = query.lte("stock", 0).eq("allow_backorder", true);
    }

    if (disponibilidade === "Todos") {
      query = query.or("stock.gt.0,allow_backorder.eq.true");
    }

    if (ordenacao === "Destaques primeiro") {
      query = query
        .order("featured", { ascending: false })
        .order("category", { ascending: true })
        .order("name", { ascending: true });
    }

    if (ordenacao === "Nome A-Z") {
      query = query.order("name", { ascending: true });
    }

    if (ordenacao === "Preço crescente") {
      query = query.order("price", {
        ascending: true,
        nullsFirst: false,
      });
    }

    if (ordenacao === "Preço decrescente") {
      query = query.order("price", {
        ascending: false,
        nullsFirst: false,
      });
    }

    const { data, error, count } = await query.range(inicio, fim);

    if (error) {
      setErro(`Erro ao carregar produtos: ${error.message}`);
      setProdutos([]);
      setTotalProdutos(0);
      setTemMaisProdutos(false);
      setACarregar(false);
      setACarregarMais(false);
      return;
    }

    const produtosRecebidos = (data || []) as Produto[];
    const existemMaisProdutos = produtosRecebidos.length > PRODUTOS_POR_PAGINA;
    const novosProdutos = produtosRecebidos.slice(0, PRODUTOS_POR_PAGINA);

    if (reiniciar) {
      setProdutos(novosProdutos);
      setTemMaisProdutos((count || 0) > novosProdutos.length);
      setTotalProdutos(count || novosProdutos.length);
    } else {
      const produtosAtualizados = [...produtos, ...novosProdutos];

      setProdutos(produtosAtualizados);
      setTemMaisProdutos((count || 0) > produtosAtualizados.length);
      setTotalProdutos(count || produtosAtualizados.length);
    }

    setACarregar(false);
    setACarregarMais(false);
  }

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setPesquisa(pesquisaInput);
    }, 500);

    return () => clearTimeout(temporizador);
  }, [pesquisaInput]);

  useEffect(() => {
    carregarProdutos(true);
  }, [pesquisa, categoria, marca, disponibilidade, ordenacao, tipoCartuchoToner]);

  useEffect(() => {
    function aoMostrarPagina(event: PageTransitionEvent) {
      if (event.persisted) {
        setACarregar(false);
        setACarregarMais(false);
        carregarProdutos(true);
      }
    }

    window.addEventListener("pageshow", aoMostrarPagina);

    return () => {
      window.removeEventListener("pageshow", aoMostrarPagina);
    };
  }, []);

  function adicionarAoCarrinho(produto: Produto) {
    setMensagem("");

    if (!produtoDisponivel(produto)) {
      setMensagem("Este produto não está disponível para encomenda.");
      return;
    }

    if (produto.price === null) {
      setMensagem("Este produto ainda não tem preço definido.");
      return;
    }

    const carrinhoAtual: CarrinhoItem[] = JSON.parse(
      localStorage.getItem("carrinho") || "[]"
    );

    const itemExistente = carrinhoAtual.find((item) => item.id === produto.id);

    let novoCarrinho: CarrinhoItem[];

    if (itemExistente) {
      novoCarrinho = carrinhoAtual.map((item) =>
        item.id === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      );
    } else {
      novoCarrinho = [...carrinhoAtual, { id: produto.id, quantidade: 1 }];
    }

    localStorage.setItem("carrinho", JSON.stringify(novoCarrinho));
    window.dispatchEvent(new Event("storage"));

    setMensagem(`"${produto.name}" foi adicionado ao carrinho.`);
  }

  function limparFiltros() {
    setPesquisaInput("");
    setPesquisa("");
    setCategoria("Todas");
    setMarca("Todas");
    setDisponibilidade("Todos");
    setTipoCartuchoToner("Todos");
    setOrdenacao("Destaques primeiro");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
              Produtos
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Catálogo
            </h1>

            <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
              Encontre toners, tinteiros, consumíveis e papelaria

            </p>
          </div>

          <Link
            href="/carrinho"
            className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Ver carrinho
          </Link>
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

        {aCarregar && produtos.length > 0 && (
          <p className="mt-6 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-800">
            A atualizar produtos...
          </p>
        )}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* Linha 1: filtros */}
          <div className="flex flex-wrap gap-3">
            <input
              value={pesquisaInput}
              onChange={(event) => setPesquisaInput(event.target.value)}
              placeholder="Pesquisar por nome, marca ou referência..."
              className="min-w-[200px] flex-1 rounded-2xl border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-green-700"
            />
            <select
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              className="rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-700"
            >
              {categorias.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={marca}
              onChange={(event) => setMarca(event.target.value)}
              className="rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-700"
            >
              {marcas.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={disponibilidade}
              onChange={(event) => setDisponibilidade(event.target.value)}
              className="rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-700"
            >
              {disponibilidades.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={ordenacao}
              onChange={(event) => setOrdenacao(event.target.value)}
              className="rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-green-700"
            >
              {ordenacoes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* Linha 2: tipo + limpar + contagem */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {["Todas", "Toners", "Tinteiros", "Consumíveis"].includes(categoria) && (
              <>
                <span className="text-xs font-semibold text-slate-500">Tipo:</span>
                {["Todos", "Original", "Compatível"].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setTipoCartuchoToner(tipo)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                      tipoCartuchoToner === tipo
                        ? "border-green-700 bg-green-700 text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:border-green-700 hover:text-green-700"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
                <span className="text-slate-200">|</span>
              </>
            )}
            <button
              type="button"
              onClick={limparFiltros}
              className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-bold text-slate-600 transition hover:border-green-700 hover:text-green-700"
            >
              Limpar filtros
            </button>
            <span className="ml-auto text-sm text-slate-500">
              <span className="font-bold text-slate-900">{produtos.length}</span> de{" "}
              <span className="font-bold text-slate-900">{totalProdutos}</span> produto{totalProdutos === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        {aCarregar && produtos.length === 0 ? (
          <section className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="h-40 animate-pulse bg-slate-100" />
                <div className="flex flex-col gap-3 p-4">
                  <div className="h-4 w-20 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="mt-2 h-8 w-full animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </section>
        ) : !aCarregar && produtos.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black">Nenhum produto encontrado.</h2>

            <p className="mt-3 text-sm text-slate-500">
              Tente limpar os filtros ou pesquisar por outro termo.
            </p>

            <button
              type="button"
              onClick={limparFiltros}
              className="mt-5 rounded-full bg-green-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Limpar filtros
            </button>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {produtos.map((produto) => {
                const disponivel = produtoDisponivel(produto);
                const emStock = produto.stock > 0;
                const semPreco = produto.price === null;

                return (
                  <article
                    key={produto.id}
                    className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <Link
                      href={`/produtos/${produto.slug}`}
                      className="flex h-40 items-center justify-center bg-slate-50 p-5"
                    >
                      {produto.image_url ? (
                        <img
                          src={produto.image_url}
                          alt={produto.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center text-xs font-bold text-slate-400">
                          Sem imagem
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                          {produto.category}
                        </span>
                        {produto.brand && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            {produto.brand}
                          </span>
                        )}
                        {produto.featured && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                            Destaque
                          </span>
                        )}
                      </div>

                      <Link href={`/produtos/${produto.slug}`}>
                        <h2 className="mt-2.5 line-clamp-2 text-sm font-black leading-5 text-slate-950 transition hover:text-green-700">
                          {produto.name}
                        </h2>
                      </Link>

                      {produto.reference && (
                        <p className="mt-1 text-xs text-slate-400">
                          Ref: {produto.reference}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {emStock ? (
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                            Em stock
                          </span>
                        ) : produto.allow_backorder ? (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                            Por encomenda
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                            Indisponível
                          </span>
                        )}
                      </div>

                      <div className="mt-auto pt-3">
                        <p className="text-base font-black text-slate-950">
                          {formatarPreco(produto)}
                        </p>

                        {semPreco ? (
                          <Link
                            href={`/contacto?produto=${encodeURIComponent(produto.name)}`}
                            className="mt-2.5 block w-full rounded-full border border-green-700 px-4 py-2 text-center text-sm font-bold text-green-700 transition hover:bg-green-700 hover:text-white"
                          >
                            Pedir orçamento
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => adicionarAoCarrinho(produto)}
                            disabled={!disponivel}
                            className="mt-2.5 w-full rounded-full bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {disponivel ? "Adicionar" : "Indisponível"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {temMaisProdutos && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => carregarProdutos(false)}
                  disabled={aCarregarMais}
                  className="rounded-full bg-green-700 px-8 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {aCarregarMais ? "A carregar..." : "Carregar mais produtos"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}