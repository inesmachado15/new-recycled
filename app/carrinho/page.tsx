"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CarrinhoItem = {
  id: string;
  quantidade: number;
};

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

type ProdutoNoCarrinho = Produto & {
  quantidade: number;
};

function formatarPreco(valor: number | null | undefined) {
  return `${Number(valor || 0).toFixed(2).replace(".", ",")}€`;
}

function formatarPrecoProduto(produto: Produto) {
  if (produto.price_text) return produto.price_text;
  if (produto.price === null) return "Sob consulta";

  return formatarPreco(Number(produto.price));
}

function produtoDisponivel(produto: Produto) {
  return produto.active && (produto.stock > 0 || produto.allow_backorder);
}

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


function calcularPortes(produtos: ProdutoNoCarrinho[]) {
  const subtotal = produtos.reduce((soma, produto) => {
    if (produto.price === null) return soma;
    return soma + Number(produto.price) * produto.quantidade;
  }, 0);

  if (subtotal === 0) {
    return { portes: 0, portesSobConsulta: false, total: 0 };
  }

  const portes = subtotal >= 60 ? 0 : 3.75;

  return {
    portes,
    portesSobConsulta: false,
    total: subtotal + portes,
  };
}

export default function CarrinhoPage() {
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarCarrinho() {
      setACarregar(true);
      setErro("");

      const carrinhoGuardado: CarrinhoItem[] = JSON.parse(
        localStorage.getItem("carrinho") || "[]"
      );

      setCarrinho(carrinhoGuardado);

      if (carrinhoGuardado.length === 0) {
        setProdutos([]);
        setACarregar(false);
        return;
      }

      const ids = carrinhoGuardado.map((item) => item.id);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", ids);

      if (error) {
        setErro(`Erro ao carregar carrinho: ${error.message}`);
        setACarregar(false);
        return;
      }

      setProdutos((data || []) as Produto[]);
      setACarregar(false);
    }

    carregarCarrinho();
  }, []);

  const produtosNoCarrinho: ProdutoNoCarrinho[] = useMemo(() => {
    return carrinho.flatMap((item) => {
      const produto = produtos.find(
        (produtoAtual) => produtoAtual.id === item.id
      );

      if (!produto) return [];

      return [
        {
          ...produto,
          quantidade: item.quantidade,
        },
      ];
    });
  }, [carrinho, produtos]);

  const produtosRemovidos = carrinho.filter(
    (item) => !produtos.some((produto) => produto.id === item.id)
  );

  const subtotal = produtosNoCarrinho.reduce((soma, produto) => {
    if (produto.price === null) return soma;
    return soma + Number(produto.price) * produto.quantidade;
  }, 0);

  const resultadoPortes = calcularPortes(produtosNoCarrinho);
  const portes = resultadoPortes.portes;
  const portesSobConsulta = resultadoPortes.portesSobConsulta;
  const total = resultadoPortes.total;

  const problemasCarrinho = produtosNoCarrinho.flatMap((produto) => {
    const problemas: string[] = [];

    if (!produto.active) {
      problemas.push(`"${produto.name}" já não está ativo.`);
    }

    if (produto.price === null) {
      problemas.push(`"${produto.name}" não tem preço definido.`);
    }

    if (!produto.allow_backorder && produto.quantidade > produto.stock) {
      problemas.push(
        `"${produto.name}" só tem ${produto.stock} unidade(s) em stock.`
      );
    }

    if (!produtoDisponivel(produto)) {
      problemas.push(`"${produto.name}" não está disponível para encomenda.`);
    }

    return problemas;
  });

  if (produtosRemovidos.length > 0) {
    problemasCarrinho.push(
      "Há produtos no carrinho que já não existem na base de dados."
    );
  }

  const podeFinalizar =
    produtosNoCarrinho.length > 0 && problemasCarrinho.length === 0;

  function guardarCarrinho(novoCarrinho: CarrinhoItem[]) {
    setCarrinho(novoCarrinho);
    localStorage.setItem("carrinho", JSON.stringify(novoCarrinho));
    window.dispatchEvent(new Event("storage"));
  }

  function alterarQuantidade(produto: ProdutoNoCarrinho, novaQuantidade: number) {
    setMensagem("");

    if (novaQuantidade <= 0) {
      removerProduto(produto.id);
      return;
    }

    if (!produto.allow_backorder && novaQuantidade > produto.stock) {
      setMensagem(
        `Não é possível adicionar mais unidades de "${produto.name}". Stock disponível: ${produto.stock}.`
      );
      return;
    }

    const novoCarrinho = carrinho.map((item) =>
      item.id === produto.id ? { ...item, quantidade: novaQuantidade } : item
    );

    guardarCarrinho(novoCarrinho);
  }

  function removerProduto(produtoId: string) {
    setMensagem("");

    const novoCarrinho = carrinho.filter((item) => item.id !== produtoId);
    guardarCarrinho(novoCarrinho);

    setMensagem("Produto removido do carrinho.");
  }

  function limparCarrinho() {
    setMensagem("");
    guardarCarrinho([]);
    setMensagem("Carrinho limpo.");
  }

  function corrigirQuantidades() {
    setMensagem("");

    const carrinhoCorrigido = carrinho
      .filter((item) => {
        const produto = produtos.find(
          (produtoAtual) => produtoAtual.id === item.id
        );

        if (!produto) return false;
        if (!produto.active) return false;
        if (produto.price === null) return false;
        if (!produtoDisponivel(produto)) return false;

        return true;
      })
      .map((item) => {
        const produto = produtos.find(
          (produtoAtual) => produtoAtual.id === item.id
        );

        if (!produto) return item;

        if (item.quantidade > 99) {
          return { ...item, quantidade: 99 };
        }

        return item;
      })
      .filter((item) => item.quantidade > 0);

    guardarCarrinho(carrinhoCorrigido);
    setMensagem("Carrinho corrigido com base no stock atual.");
  }

  if (aCarregar) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A carregar carrinho...
          </p>
        </section>
      </main>
    );
  }

  if (carrinho.length === 0 || produtosNoCarrinho.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-5xl rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">
            Carrinho
          </p>

          <h1 className="mt-4 text-4xl font-black">O carrinho está vazio.</h1>

          <p className="mt-3 text-slate-600">
            Adicione produtos ao carrinho antes de avançar para checkout.
          </p>

          <a
            href="/produtos"
            className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Ver produtos
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <a
          href="/produtos"
          className="text-sm font-bold text-green-700 hover:text-green-800"
        >
          ← Continuar a comprar
        </a>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
              Carrinho
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              A sua encomenda
            </h1>

            <p className="mt-4 max-w-2xl text-slate-600">
              Confirme os produtos, quantidades, stock disponível e total antes
              de avançar para checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={limparCarrinho}
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-red-500 hover:text-red-600"
          >
            Limpar carrinho
          </button>
        </div>

        {erro && (
          <p className="mt-8 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
            {erro}
          </p>
        )}

        {mensagem && (
          <p className="mt-8 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-800">
            {mensagem}
          </p>
        )}

        {problemasCarrinho.length > 0 && (
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-black text-amber-900">
              Atenção: o carrinho precisa de ser revisto.
            </p>

            <div className="mt-3 space-y-2">
              {problemasCarrinho.map((problema) => (
                <p key={problema} className="text-sm leading-6 text-amber-800">
                  • {problema}
                </p>
              ))}
            </div>

            <button
              type="button"
              onClick={corrigirQuantidades}
              className="mt-5 rounded-full bg-amber-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
            >
              Corrigir carrinho automaticamente
            </button>
          </section>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="space-y-5">
            {produtosNoCarrinho.map((produto) => {
              const emStock = produto.stock > 0;
              const podeAumentar = produto.quantidade < 99;
              const indisponivel = !produtoDisponivel(produto);
              const semPreco = produto.price === null;
              const quantidadeAcimaStock = false;

              return (
                <article
                  key={produto.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="grid gap-5 md:grid-cols-[120px_1fr]">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                      {produto.image_url ? (
                        <img
                          src={produto.image_url}
                          alt={produto.name}
                          className="h-full w-full object-contain p-3"
                        />
                      ) : (
                        <span className="text-center text-xs font-semibold text-slate-400">
                          Sem imagem
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                              {produto.category}
                            </span>

                            {emStock ? (
                              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                                Em stock
                              </span>
                            ) : produto.allow_backorder ? (
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                Disponível por encomenda
                              </span>
                            ) : (
                              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                                Indisponível
                              </span>
                            )}

                            {!produto.active && (
                              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                                Produto inativo
                              </span>
                            )}

                            {semPreco && (
                              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                Sem preço
                              </span>
                            )}
                          </div>

                          <h2 className="mt-3 text-xl font-black">
                            {produto.name}
                          </h2>

                          <p className="mt-2 text-sm text-slate-500">
                            {produto.brand || "Sem marca"} · Ref.:{" "}
                            {produto.reference || "Sem referência"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            SKU: {produto.sku || "Sem SKU"}
                          </p>
                        </div>

                        <div className="text-left lg:text-right">
                          <p className="text-xl font-black">
                            {formatarPrecoProduto(produto)}
                          </p>

                          {produto.price !== null && (
                            <p className="mt-1 text-sm text-slate-500">
                              Total:{" "}
                              <span className="font-bold text-slate-900">
                                {formatarPreco(
                                  Number(produto.price) * produto.quantidade
                                )}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Stock disponível:{" "}
                            <span
                              className={
                                produto.stock <= produto.min_stock
                                  ? "font-black text-red-600"
                                  : "font-black text-green-700"
                              }
                            >
                              {produto.stock}
                            </span>
                          </p>

                          {produto.allow_backorder && produto.stock <= 0 && (
                            <p className="mt-1 text-xs text-slate-500">
                              Este produto pode ser encomendado mesmo sem stock
                              imediato.
                            </p>
                          )}

                          {quantidadeAcimaStock && (
                            <p className="mt-1 text-xs font-bold text-red-600">
                              A quantidade no carrinho está acima do stock atual.
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              alterarQuantidade(produto, produto.quantidade - 1)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-black text-slate-700 transition hover:border-green-700 hover:text-green-700"
                          >
                            −
                          </button>

                          <span className="min-w-10 text-center text-lg font-black">
                            {produto.quantidade}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              alterarQuantidade(produto, produto.quantidade + 1)
                            }
                            disabled={!podeAumentar || indisponivel || semPreco}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-black text-slate-700 transition hover:border-green-700 hover:text-green-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                          >
                            +
                          </button>

                          <button
                            type="button"
                            onClick={() => removerProduto(produto.id)}
                            className="ml-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-red-500 hover:text-red-600"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Resumo</h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Produtos</span>
                <span className="font-bold text-slate-900">
                  {formatarPreco(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Portes</span>
                <span className="font-bold text-slate-900">
                  {portesSobConsulta
                    ? "Sob consulta"
                    : portes === 0
                    ? "Grátis"
                    : formatarPreco(portes)}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                <span className="font-bold">
                  {portesSobConsulta ? "Total estimado" : "Total"}
                </span>
                <span className="font-black">
                  {portesSobConsulta
                    ? `${formatarPreco(subtotal)} + portes sob consulta`
                    : formatarPreco(total)}
                </span>
              </div>
            </div>

            <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
              Portes fixos 3,75€ para todo o Portugal continental. Portes grátis em compras iguais ou superiores a 60€.
            </p>

            {podeFinalizar ? (
              <a
                href="/finalizar"
                className="mt-6 flex w-full justify-center rounded-full bg-green-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-green-800"
              >
                Finalizar compra
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-full bg-slate-300 px-6 py-4 text-sm font-bold text-white"
              >
                Corrija o carrinho para finalizar
              </button>
            )}

            <a
              href="/produtos"
              className="mt-3 flex w-full justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
            >
              Continuar a comprar
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}