"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

type DadosCliente = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_type: string;
  company_name: string;
  nif: string;
  address: string;
  postal_code: string;
  city: string;
  payment_preference: string;
  contact_preference: string;
  compatibility_confirmation: boolean;
  notes: string;
};

const metodosPagamento = [
  "Referência Multibanco",
  "MB WAY",
  "Cartão de crédito/débito",
  "Apple Pay",
  "Google Pay",
];

const preferenciasContacto = ["Email", "Telefone"];

function formatarPreco(valor: number | null | undefined) {
  return `${Number(valor || 0).toFixed(2).replace(".", ",")}€`;
}

function produtoDisponivel(produto: Produto) {
  return produto.active && (produto.stock > 0 || produto.allow_backorder);
}

function normalizarTexto(texto: string | null | undefined) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function produtoETonerOuTinteiro(produto: Produto) {
  const categoria = normalizarTexto(produto.category);
  const nome = normalizarTexto(produto.name);

  return (
    categoria.includes("toner") ||
    categoria.includes("tinteiro") ||
    categoria.includes("tinteiros") ||
    categoria.includes("toners") ||
    nome.includes("toner") ||
    nome.includes("tinteiro") ||
    nome.includes("tinteiros")
  );
}

function calcularPortes(
  produtosNoCarrinho: ProdutoNoCarrinho[],
  subtotal: number
) {
  if (produtosNoCarrinho.length === 0) {
    return {
      shippingCost: 0,
      shippingSobConsulta: false,
      shippingText: "0,00€",
    };
  }

  const todosSaoTonersOuTinteiros = produtosNoCarrinho.every((produto) =>
    produtoETonerOuTinteiro(produto)
  );

  if (!todosSaoTonersOuTinteiros) {
    return {
      shippingCost: null,
      shippingSobConsulta: true,
      shippingText: "Sob consulta",
    };
  }

  if (subtotal >= 60) {
    return {
      shippingCost: 0,
      shippingSobConsulta: false,
      shippingText: "Grátis",
    };
  }

  return {
    shippingCost: 3.75,
    shippingSobConsulta: false,
    shippingText: "3,75€",
  };
}

export default function FinalizarPage() {
  const router = useRouter();

  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessaoVerificada, setSessaoVerificada] = useState(false);

  const [aCarregar, setACarregar] = useState(true);
  const [aSubmeter, setASubmeter] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [dados, setDados] = useState<DadosCliente>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_type: "Particular",
    company_name: "",
    nif: "",
    address: "",
    postal_code: "",
    city: "",
    payment_preference: "Referência Multibanco",
    contact_preference: "Email",
    compatibility_confirmation: false,
    notes: "",
  });

  useEffect(() => {
    async function carregarCheckout() {
      setACarregar(true);
      setErro("");

      let carrinhoGuardado: CarrinhoItem[] = [];

      try {
        carrinhoGuardado = JSON.parse(localStorage.getItem("carrinho") || "[]");
      } catch {
        carrinhoGuardado = [];
      }

      setCarrinho(carrinhoGuardado);

      const {
        data: { user },
        error: erroSessao,
      } = await supabase.auth.getUser();

      if (erroSessao) {
        setErro(`Erro ao verificar sessão: ${erroSessao.message}`);
        setSessaoVerificada(true);
        setACarregar(false);
        return;
      }

      if (user) {
        setUserId(user.id);

        const { data: perfil } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        setDados((atuais) => ({
          ...atuais,
          customer_name:
            perfil?.nome || user.user_metadata?.nome || atuais.customer_name,
          customer_email: user.email || atuais.customer_email,
          customer_phone: perfil?.telefone || atuais.customer_phone,
          customer_type: perfil?.tipo_cliente || atuais.customer_type,
          company_name: perfil?.empresa || atuais.company_name,
          nif: perfil?.nif || atuais.nif,
          address: perfil?.morada || atuais.address,
          postal_code: perfil?.codigo_postal || atuais.postal_code,
          city: perfil?.localidade || atuais.city,
        }));
      } else {
        setUserId(null);
      }

      setSessaoVerificada(true);

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
        setErro(`Erro ao carregar produtos: ${error.message}`);
        setACarregar(false);
        return;
      }

      setProdutos((data || []) as Produto[]);
      setACarregar(false);
    }

    carregarCheckout();
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

  const subtotal = produtosNoCarrinho.reduce((soma, produto) => {
    if (produto.price === null) return soma;
    return soma + Number(produto.price) * produto.quantidade;
  }, 0);

  const resultadoPortes = calcularPortes(produtosNoCarrinho, subtotal);
  const shippingCost = resultadoPortes.shippingCost;
  const shippingSobConsulta = resultadoPortes.shippingSobConsulta;
  const total = subtotal + Number(shippingCost || 0);

  const problemasCheckout = produtosNoCarrinho.flatMap((produto) => {
    const problemas: string[] = [];

    if (!produto.active) {
      problemas.push(`"${produto.name}" já não está ativo.`);
    }

    if (produto.price === null) {
      problemas.push(`"${produto.name}" não tem preço definido.`);
    }

    if (!produtoDisponivel(produto)) {
      problemas.push(`"${produto.name}" não está disponível para encomenda.`);
    }

    if (!produto.allow_backorder && produto.quantidade > produto.stock) {
      problemas.push(
        `"${produto.name}" só tem ${produto.stock} unidade(s) em stock.`
      );
    }

    return problemas;
  });

  const empresaSelecionada = dados.customer_type === "Empresa";

  const dadosEmpresaValidos =
    !empresaSelecionada ||
    (dados.company_name.trim() !== "" && dados.nif.trim() !== "");

  const podeSubmeter =
    Boolean(userId) &&
    produtosNoCarrinho.length > 0 &&
    problemasCheckout.length === 0 &&
    dados.customer_name.trim() !== "" &&
    dados.customer_email.trim() !== "" &&
    dados.customer_phone.trim() !== "" &&
    dados.address.trim() !== "" &&
    dados.postal_code.trim() !== "" &&
    dados.city.trim() !== "" &&
    dadosEmpresaValidos;

  function atualizarDados(campo: keyof DadosCliente, valor: string | boolean) {
    setDados((atuais) => ({
      ...atuais,
      [campo]: valor,
    }));
  }

  async function finalizarCompra(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setMensagem("");
    setASubmeter(true);

    if (!userId) {
      setErro("Tem de iniciar sessão ou criar conta para finalizar a encomenda.");
      setASubmeter(false);
      return;
    }

    if (!podeSubmeter) {
      setErro("Confirme os dados obrigatórios antes de finalizar a encomenda.");
      setASubmeter(false);
      return;
    }

    let carrinhoAtual: CarrinhoItem[] = [];

    try {
      carrinhoAtual = JSON.parse(localStorage.getItem("carrinho") || "[]");
    } catch {
      carrinhoAtual = [];
    }

    if (carrinhoAtual.length === 0) {
      setErro("O carrinho está vazio.");
      setASubmeter(false);
      return;
    }

    const ids = carrinhoAtual.map((item) => item.id);

    const { data: produtosAtualizados, error: erroProdutos } = await supabase
      .from("products")
      .select("*")
      .in("id", ids);

    if (erroProdutos) {
      setErro(`Erro ao validar stock: ${erroProdutos.message}`);
      setASubmeter(false);
      return;
    }

    const produtosValidados = carrinhoAtual.flatMap((item) => {
      const produto = (produtosAtualizados || []).find(
        (produtoAtual) => produtoAtual.id === item.id
      ) as Produto | undefined;

      if (!produto) return [];

      return [
        {
          ...produto,
          quantidade: item.quantidade,
        },
      ];
    });

    const problemasValidados = produtosValidados.flatMap((produto) => {
      const problemas: string[] = [];

      if (!produto.active) {
        problemas.push(`"${produto.name}" já não está ativo.`);
      }

      if (produto.price === null) {
        problemas.push(`"${produto.name}" não tem preço definido.`);
      }

      if (!produtoDisponivel(produto)) {
        problemas.push(`"${produto.name}" não está disponível para encomenda.`);
      }

      if (!produto.allow_backorder && produto.quantidade > produto.stock) {
        problemas.push(
          `"${produto.name}" só tem ${produto.stock} unidade(s) em stock.`
        );
      }

      return problemas;
    });

    if (problemasValidados.length > 0) {
      setErro(problemasValidados.join(" "));
      setASubmeter(false);
      return;
    }

    const subtotalValidado = produtosValidados.reduce((soma, produto) => {
      return soma + Number(produto.price || 0) * produto.quantidade;
    }, 0);

    const resultadoPortesValidado = calcularPortes(
      produtosValidados,
      subtotalValidado
    );

    const portesValidados = resultadoPortesValidado.shippingSobConsulta
      ? null
      : Number(resultadoPortesValidado.shippingCost || 0);

    const totalValidado = subtotalValidado + Number(portesValidados || 0);

    const { data: encomendaCriada, error: erroEncomenda } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: dados.customer_name.trim(),
        customer_email: dados.customer_email.trim(),
        customer_phone: dados.customer_phone.trim(),
        customer_type: dados.customer_type,
        company_name:
          dados.customer_type === "Empresa" ? dados.company_name.trim() : null,
        nif: dados.nif.trim() || null,
        address: dados.address.trim(),
        postal_code: dados.postal_code.trim(),
        city: dados.city.trim(),
        delivery_preference: "Envio por transportadora",
        payment_preference: dados.payment_preference,
        payment_status: "Pendente",
        payment_provider: null,
        payment_reference: null,
        urgency: "Normal",
        contact_preference: dados.contact_preference,
        compatibility_confirmation: dados.compatibility_confirmation,
        notes: dados.notes.trim() || null,
        subtotal_products: subtotalValidado,
        shipping_cost: portesValidados,
        total_amount: totalValidado,
        total_estimated: totalValidado,
        status: "A aguardar aprovação",
        stock_deducted: false,
      })
      .select("id")
      .single();

    if (erroEncomenda || !encomendaCriada) {
      setErro(
        `Não foi possível criar a encomenda: ${
          erroEncomenda?.message || "erro desconhecido"
        }`
      );
      setASubmeter(false);
      return;
    }

    const orderId = encomendaCriada.id as string;

    const itensEncomenda = produtosValidados.map((produto) => ({
      order_id: orderId,
      product_id: produto.id,
      product_name: produto.name,
      product_reference: produto.reference,
      product_brand: produto.brand,
      quantity: produto.quantidade,
      unit_price: produto.price,
      price_text:
        produto.price_text ||
        `${Number(produto.price || 0).toFixed(2).replace(".", ",")}€`,
    }));

    const { error: erroItens } = await supabase
      .from("order_items")
      .insert(itensEncomenda);

    if (erroItens) {
      setErro(
        `A encomenda foi criada, mas houve erro ao guardar os produtos: ${erroItens.message}`
      );
      setASubmeter(false);
      return;
    }

    try {
      const respostaEmailAdmin = await fetch("/api/emails/encomenda-criada", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      if (!respostaEmailAdmin.ok) {
        console.error(
          "Erro ao enviar email de nova encomenda ao admin:",
          await respostaEmailAdmin.text()
        );
      }
    } catch (error) {
      console.error("Erro ao chamar email de nova encomenda ao admin:", error);
    }

    localStorage.removeItem("carrinho");
    window.dispatchEvent(new Event("storage"));

    setMensagem("Encomenda submetida com sucesso.");
    setASubmeter(false);

    router.push(`/encomenda/${orderId}/confirmacao`);
  }

  if (aCarregar) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A carregar checkout...
          </p>
        </section>
      </main>
    );
  }

  if (sessaoVerificada && !userId) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-5xl">
          <Link
            href="/carrinho"
            className="text-sm font-bold text-green-700 hover:text-green-800"
          >
            ← Voltar ao carrinho
          </Link>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">
              Finalizar encomenda
            </p>

            <h1 className="mt-4 text-4xl font-black">
              Inicie sessão para finalizar a encomenda.
            </h1>

            <p className="mt-4 max-w-2xl text-slate-600">
              Para submeter uma encomenda tem de iniciar sessão ou criar uma
              conta. Assim poderá acompanhar o estado da encomenda, consultar os
              dados de pagamento e receber atualizações.
            </p>

            <div className="mt-6 grid gap-3 rounded-2xl bg-green-50 p-5 text-sm leading-6 text-green-800">
              <p className="font-bold text-green-900">
                Porque é necessário criar conta?
              </p>

              <p>
                A conta permite acompanhar a encomenda, consultar o estado do
                pedido e aceder aos dados de pagamento depois da aprovação.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/entrar"
                className="rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
              >
                Iniciar sessão
              </Link>

              <Link
                href="/entrar?criarConta=1"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
              >
                Criar conta
              </Link>

              <Link
                href="/produtos"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
              >
                Continuar a comprar
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (carrinho.length === 0 || produtosNoCarrinho.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-5xl rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">
            Finalizar encomenda
          </p>

          <h1 className="mt-4 text-4xl font-black">O carrinho está vazio.</h1>

          <p className="mt-3 text-slate-600">
            Adicione produtos ao carrinho antes de avançar para checkout.
          </p>

          <Link
            href="/produtos"
            className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Ver produtos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/carrinho"
          className="text-sm font-bold text-green-700 hover:text-green-800"
        >
          ← Voltar ao carrinho
        </Link>

        <div className="mt-8 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-green-50 p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
            Checkout
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Finalizar encomenda
          </h1>

          <p className="mt-4 max-w-3xl text-slate-600">
            Confirme os dados de faturação, entrega e resumo da encomenda. A
            sua encomenda será validada pela New & Recycled antes de qualquer
            pagamento.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-950">
                1. Submete o pedido
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                A encomenda fica registada na sua conta.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-950">
                2. Validamos stock e portes
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Confirmamos disponibilidade antes do pagamento.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-950">
                3. Recebe os dados de pagamento
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Só paga depois da aprovação da encomenda.
              </p>
            </div>
          </div>
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

        {problemasCheckout.length > 0 && (
          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-black text-amber-900">
              O checkout precisa de ser revisto.
            </p>

            <div className="mt-3 space-y-2">
              {problemasCheckout.map((problema) => (
                <p key={problema} className="text-sm leading-6 text-amber-800">
                  • {problema}
                </p>
              ))}
            </div>

            <Link
              href="/carrinho"
              className="mt-5 inline-flex rounded-full bg-amber-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
            >
              Corrigir no carrinho
            </Link>
          </section>
        )}

        <form
          onSubmit={finalizarCompra}
          className="mt-10 grid gap-8 lg:grid-cols-[1fr_390px]"
        >
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Dados de faturação
              </p>

              <h2 className="mt-4 text-2xl font-black">
                Informação do cliente
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Estes dados serão usados para validar a encomenda, faturação e
                contacto caso seja necessário confirmar alguma informação.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Tipo de cliente *
                  <select
                    value={dados.customer_type}
                    onChange={(event) =>
                      atualizarDados("customer_type", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  >
                    <option value="Particular">Particular</option>
                    <option value="Empresa">Empresa</option>
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  Nome completo *
                  <input
                    value={dados.customer_name}
                    onChange={(event) =>
                      atualizarDados("customer_name", event.target.value)
                    }
                    required
                    placeholder={
                      empresaSelecionada
                        ? "Pessoa de contacto"
                        : "Nome completo"
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                {empresaSelecionada && (
                  <>
                    <label className="text-sm font-semibold sm:col-span-2">
                      Nome da empresa *
                      <input
                        value={dados.company_name}
                        onChange={(event) =>
                          atualizarDados("company_name", event.target.value)
                        }
                        required
                        placeholder="Ex.: Empresa, Lda."
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                      />
                    </label>

                    <label className="text-sm font-semibold">
                      NIF da empresa *
                      <input
                        value={dados.nif}
                        onChange={(event) =>
                          atualizarDados("nif", event.target.value)
                        }
                        required
                        placeholder="Ex.: 500000000"
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                      />
                    </label>
                  </>
                )}

                {!empresaSelecionada && (
                  <label className="text-sm font-semibold">
                    NIF
                    <input
                      value={dados.nif}
                      onChange={(event) =>
                        atualizarDados("nif", event.target.value)
                      }
                      placeholder="Opcional"
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                    />
                  </label>
                )}

                <label className="text-sm font-semibold">
                  Email *
                  <input
                    type="email"
                    value={dados.customer_email}
                    onChange={(event) =>
                      atualizarDados("customer_email", event.target.value)
                    }
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Telefone *
                  <input
                    value={dados.customer_phone}
                    onChange={(event) =>
                      atualizarDados("customer_phone", event.target.value)
                    }
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold sm:col-span-2">
                  Morada de faturação e entrega *
                  <input
                    value={dados.address}
                    onChange={(event) =>
                      atualizarDados("address", event.target.value)
                    }
                    required
                    placeholder="Rua, número, andar..."
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Código postal *
                  <input
                    value={dados.postal_code}
                    onChange={(event) =>
                      atualizarDados("postal_code", event.target.value)
                    }
                    required
                    placeholder="0000-000"
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Localidade *
                  <input
                    value={dados.city}
                    onChange={(event) =>
                      atualizarDados("city", event.target.value)
                    }
                    required
                    placeholder="Ex.: Lisboa"
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>
              </div>

              {empresaSelecionada && (
                <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                  Para clientes empresa, o nome da empresa e o NIF são
                  obrigatórios para faturação. Confirme estes dados antes de
                  submeter a encomenda.
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Entrega e pagamento
              </p>

              <h2 className="mt-4 text-2xl font-black">
                Preferências da encomenda
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                O método de pagamento escolhido é apenas uma preferência. Os
                dados finais de pagamento serão enviados após validação da
                encomenda.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Entrega
                  <input
                    value="Envio por transportadora"
                    disabled
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 font-normal text-slate-500"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Método de pagamento preferido
                  <select
                    value={dados.payment_preference}
                    onChange={(event) =>
                      atualizarDados("payment_preference", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  >
                    {metodosPagamento.map((metodo) => (
                      <option key={metodo} value={metodo}>
                        {metodo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold">
                  Contacto preferencial
                  <select
                    value={dados.contact_preference}
                    onChange={(event) =>
                      atualizarDados("contact_preference", event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  >
                    {preferenciasContacto.map((preferencia) => (
                      <option key={preferencia} value={preferencia}>
                        {preferencia}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-900">
                  <input
                    type="checkbox"
                    checked={dados.compatibility_confirmation}
                    onChange={(event) =>
                      atualizarDados(
                        "compatibility_confirmation",
                        event.target.checked
                      )
                    }
                  />
                  Quero confirmação de compatibilidade
                </label>
              </div>

              <label className="mt-5 block text-sm font-semibold">
                Observações
                <textarea
                  value={dados.notes}
                  onChange={(event) =>
                    atualizarDados("notes", event.target.value)
                  }
                  rows={4}
                  placeholder="Notas sobre a encomenda, entrega ou compatibilidade..."
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                />
              </label>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-32">
            <h2 className="text-xl font-black">Resumo da encomenda</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Reveja os produtos antes de submeter. Ainda não será cobrado
              qualquer pagamento.
            </p>

            <div className="mt-5 space-y-4">
              {produtosNoCarrinho.map((produto) => (
                <div
                  key={produto.id}
                  className="rounded-2xl bg-slate-50 p-4 text-sm"
                >
                  <p className="font-bold text-slate-900">
                    {produto.quantidade}x {produto.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {produto.brand || "Sem marca"} ·{" "}
                    {produto.reference || produto.sku || "Sem referência"}
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    {formatarPreco(
                      Number(produto.price || 0) * produto.quantidade
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Produtos</span>
                <span className="font-bold text-slate-900">
                  {formatarPreco(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Portes</span>
                <span className="font-bold text-slate-900">
                  {shippingSobConsulta
                    ? "Sob consulta"
                    : shippingCost === 0
                    ? "Grátis"
                    : formatarPreco(shippingCost)}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                <span className="font-bold">
                  {shippingSobConsulta ? "Total estimado" : "Total"}
                </span>
                <span className="font-black">
                  {shippingSobConsulta
                    ? `${formatarPreco(subtotal)} + portes sob consulta`
                    : formatarPreco(total)}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <p className="rounded-2xl bg-green-50 p-4 text-xs leading-5 text-green-800">
                <span className="font-black">Sem pagamento imediato.</span>{" "}
                A encomenda ficará a aguardar aprovação. Só depois da validação
                serão indicados os dados de pagamento.
              </p>

              <p className="rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                Portes: toners e tinteiros têm portes de 3,75€, com portes
                gratuitos em compras iguais ou superiores a 60€. Outros produtos
                ficam com portes sob consulta.
              </p>

              <p className="rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                Confirme referências, quantidades e dados de faturação antes de
                submeter a encomenda.
              </p>
            </div>

            <button
              type="submit"
              disabled={!podeSubmeter || aSubmeter}
              className="mt-6 w-full rounded-full bg-green-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {aSubmeter ? "A submeter encomenda..." : "Submeter encomenda"}
            </button>

            {!podeSubmeter && (
              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Preencha todos os campos obrigatórios para poder submeter.
              </p>
            )}
          </aside>
        </form>
      </section>
    </main>
  );
}