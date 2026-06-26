"use client";

import { useEffect, useState } from "react";
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
  "Papel e Consumíveis",
  "Rolos Térmicos",
  "Material de Escritório",
  "Material Escolar",
  "Limpeza e Higiene",
  "Equipamento de Escritório",
];

const disponibilidades = ["Todos", "Em stock", "Disponível por encomenda"];

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
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [temMaisProdutos, setTemMaisProdutos] = useState(false);

  const [aCarregar, setACarregar] = useState(true);
  const [aCarregarMais, setACarregarMais] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [pesquisaInput, setPesquisaInput] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [disponibilidade, setDisponibilidade] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState("Destaques primeiro");

  async function carregarProdutos(reiniciar: boolean) {
    const inicio = reiniciar ? 0 : produtos.length;
    const fim = inicio + PRODUTOS_POR_PAGINA - 1;

    if (reiniciar) {
      setACarregar(true);
    } else {
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

    const novosProdutos = (data || []) as Produto[];

    if (reiniciar) {
      setProdutos(novosProdutos);
      setTemMaisProdutos((count || 0) > novosProdutos.length);
    } else {
      const produtosAtualizados = [...produtos, ...novosProdutos];
      setProdutos(produtosAtualizados);
      setTemMaisProdutos((count || 0) > produtosAtualizados.length);
    }

    setTotalProdutos(count || 0);
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
    const temporizador = setTimeout(() => {
      carregarProdutos(true);
    }, 300);

    return () => clearTimeout(temporizador);
  }, [pesquisa, categoria, disponibilidade, ordenacao]);

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
    setDisponibilidade("Todos");
    setOrdenacao("Destaques primeiro");
  }

  if (aCarregar) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-900">
        <section className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A carregar produtos...
          </p>
        </section>
      </main>
    );
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
              Encontre consumíveis, material de escritório, material escolar,
              rolos térmicos, equipamentos e artigos de limpeza.
            </p>
          </div>

          <a
            href="/carrinho"
            className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Ver carrinho
          </a>
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

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_220px_150px]">
            <label className="text-sm font-semibold">
              Pesquisar
              <input
                value={pesquisaInput}
                onChange={(event) => setPesquisaInput(event.target.value)}
                placeholder="Nome, marca, referência ou SKU..."
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-normal outline-none transition focus:border-green-700"
              />
            </label>

            <label className="text-sm font-semibold">
              Categoria
              <select
                value={categoria}
                onChange={(event) => setCategoria(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-normal outline-none transition focus:border-green-700"
              >
                {categorias.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold">
              Disponibilidade
              <select
                value={disponibilidade}
                onChange={(event) => setDisponibilidade(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-normal outline-none transition focus:border-green-700"
              >
                {disponibilidades.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold">
              Ordenar por
              <select
                value={ordenacao}
                onChange={(event) => setOrdenacao(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-normal outline-none transition focus:border-green-700"
              >
                {ordenacoes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={limparFiltros}
              className="self-end rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
            >
              Limpar
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            A mostrar{" "}
            <span className="font-bold text-slate-900">{produtos.length}</span>{" "}
            de{" "}
            <span className="font-bold text-slate-900">{totalProdutos}</span>{" "}
            produtos.
          </p>
        </section>

        {produtos.length === 0 ? (
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
                    <a
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
                    </a>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          {produto.category}
                        </span>

                        {produto.featured && (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            Destaque
                          </span>
                        )}
                      </div>

                      <a href={`/produtos/${produto.slug}`}>
                        <h2 className="mt-3 line-clamp-2 text-base font-black leading-5 text-slate-950 transition hover:text-green-700">
                          {produto.name}
                        </h2>
                      </a>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {produto.brand || "Sem marca"} ·{" "}
                        {produto.reference || produto.sku || "Sem referência"}
                      </p>

                      {produto.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                          {produto.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {emStock ? (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                            Em stock
                          </span>
                        ) : produto.allow_backorder ? (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            Por encomenda
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                            Indisponível
                          </span>
                        )}
                      </div>

                      <div className="mt-auto pt-4">
                        <p className="text-lg font-black text-slate-950">
                          {formatarPreco(produto)}
                        </p>

                        <button
                          type="button"
                          onClick={() => adicionarAoCarrinho(produto)}
                          disabled={!disponivel || semPreco}
                          className="mt-3 w-full rounded-full bg-green-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {semPreco
                            ? "Sob consulta"
                            : disponivel
                            ? "Adicionar"
                            : "Indisponível"}
                        </button>
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