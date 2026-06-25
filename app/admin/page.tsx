"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type EncomendaItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_reference: string | null;
  product_brand: string | null;
  quantity: number;
  unit_price: number | null;
  price_text: string | null;
};

type PedidoDevolucao = {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  details: string | null;
  status: string;
  admin_notes: string | null;
  requested_at: string;
  reviewed_at: string | null;
};

type Encomenda = {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_type: string;
  company_name: string | null;
  nif: string | null;
  address: string;
  postal_code: string;
  city: string;
  delivery_preference: string;
  payment_preference: string;
  payment_status: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  urgency: string;
  contact_preference: string;
  compatibility_confirmation: boolean;
  notes: string | null;
  subtotal_products: number | null;
  shipping_cost: number | null;
  total_amount: number | null;
  total_estimated: number;
  status: string;
  stock_deducted: boolean;
  shipping_carrier: string | null;
  tracking_code: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  keyinvoice_doc_type: string | null;
  keyinvoice_doc_series: string | null;
  keyinvoice_doc_num: string | null;
  keyinvoice_full_doc_number: string | null;
  keyinvoice_invoice_issued_at: string | null;
  keyinvoice_invoice_sent_at: string | null;
  approval_email_sent_at: string | null;
  approval_email_sending_at: string | null;
  preparation_email_sent_at: string | null;
  preparation_email_sending_at: string | null;
  shipping_email_sent_at: string | null;
  shipping_email_sending_at: string | null;
  created_at: string;
  order_items: EncomendaItem[];
  return_requests: PedidoDevolucao[];
};

type ProdutoStock = {
  id: string;
  name: string;
  stock: number;
  allow_backorder: boolean;
};

type ResultadoEmissaoFatura = {
  success: boolean;
  error?: string;
  keyinvoice?: {
    docType: string;
    docSeries: string;
    docNum: string;
    fullDocNumber: string;
  };
};

type ResultadoEnvioFatura = {
  success: boolean;
  error?: string;
  document?: {
    orderId?: string;
    docType: string;
    docSeries: string;
    docNum: string;
    fullDocNumber: string;
    filename: string;
  };
};

type EstatisticasAdmin = {
  total: number;
  aguardarAprovacao: number;
  aguardarPagamento: number;
  pagas: number;
  porEstado: Record<string, number>;
  porPagamento: Record<string, number>;
};

const ENCOMENDAS_POR_PAGINA = 20;

const estados = [
  "A aguardar aprovação",
  "Aprovada - aguarda pagamento",
  "Pago",
  "Em preparação",
  "Enviado",
  "Entregue",
  "Cancelado",
  "Devolução solicitada",
  "Devolvido",
];

const filtrosEstado = ["Todos", ...estados];

const filtrosPagamento = [
  "Todos",
  "Pendente",
  "Pago",
  "Cancelado",
  "Reembolsado",
];

const ordenacoes = [
  "Mais recentes",
  "Mais antigas",
  "Maior valor",
  "Menor valor",
];

function obterEmailsAdmin() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function obterEstadoPagamentoPorEstadoEncomenda(estado: string) {
  if (estado === "A aguardar aprovação") return "Pendente";
  if (estado === "Aprovada - aguarda pagamento") return "Pendente";
  if (estado === "Pago") return "Pago";
  if (estado === "Em preparação") return "Pago";
  if (estado === "Enviado") return "Pago";
  if (estado === "Entregue") return "Pago";
  if (estado === "Cancelado") return "Cancelado";
  if (estado === "Devolução solicitada") return "Pago";
  if (estado === "Devolvido") return "Reembolsado";

  return "Pendente";
}

function normalizarValorMonetario(valor: string) {
  const texto = valor.trim().replace(",", ".");

  if (texto === "") return null;

  const numero = Number(texto);

  if (!Number.isFinite(numero) || numero < 0) return undefined;

  return numero;
}

function normalizarEncomenda(encomenda: Encomenda) {
  return {
    ...encomenda,
    order_items: encomenda.order_items || [],
    return_requests: encomenda.return_requests || [],
  };
}

export default function AdminPage() {
  const router = useRouter();
  const primeiroCarregamentoFiltros = useRef(true);

  const [emailUtilizador, setEmailUtilizador] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [aCarregar, setACarregar] = useState(true);
  const [aCarregarMais, setACarregarMais] = useState(false);
  const [aAtualizar, setAAtualizar] = useState(false);

  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [totalEncomendas, setTotalEncomendas] = useState(0);
  const [temMaisEncomendas, setTemMaisEncomendas] = useState(false);

  const [estatisticas, setEstatisticas] = useState<EstatisticasAdmin>({
    total: 0,
    aguardarAprovacao: 0,
    aguardarPagamento: 0,
    pagas: 0,
    porEstado: {},
    porPagamento: {},
  });

  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroPagamento, setFiltroPagamento] = useState("Todos");
  const [ordenacao, setOrdenacao] = useState("Mais recentes");
  const [pesquisaEncomenda, setPesquisaEncomenda] = useState("");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const encomendasFiltradas = useMemo(() => {
    return encomendas;
  }, [encomendas]);

  async function contarEncomendasPorPagamento(estadoPagamento: string) {
    if (estadoPagamento === "Todos") {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true });

      return count || 0;
    }

    if (estadoPagamento === "Pendente") {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .or("payment_status.eq.Pendente,payment_status.is.null");

      return count || 0;
    }

    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", estadoPagamento);

    return count || 0;
  }

  async function carregarEstatisticasAdmin() {
    const [
      totalResponse,
      aguardarAprovacaoResponse,
      aguardarPagamentoResponse,
      pagasResponse,
    ] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),

      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "A aguardar aprovação"),

      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "Aprovada - aguarda pagamento"),

      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "Pago"),
    ]);

    const total = totalResponse.count || 0;

    const porEstado: Record<string, number> = {};
    const porPagamento: Record<string, number> = {};

    await Promise.all(
      filtrosEstado.map(async (estado) => {
        if (estado === "Todos") {
          porEstado[estado] = total;
          return;
        }

        const { count } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("status", estado);

        porEstado[estado] = count || 0;
      })
    );

    await Promise.all(
      filtrosPagamento.map(async (estadoPagamento) => {
        porPagamento[estadoPagamento] =
          await contarEncomendasPorPagamento(estadoPagamento);
      })
    );

    setEstatisticas({
      total,
      aguardarAprovacao: aguardarAprovacaoResponse.count || 0,
      aguardarPagamento: aguardarPagamentoResponse.count || 0,
      pagas: pagasResponse.count || 0,
      porEstado,
      porPagamento,
    });
  }

  async function carregarEncomendas(reiniciar = true) {
    setErro("");

    if (reiniciar && encomendas.length === 0) {
      setACarregar(true);
    }

    if (!reiniciar) {
      setACarregarMais(true);
    }

    const inicio = reiniciar ? 0 : encomendas.length;
    const fim = inicio + ENCOMENDAS_POR_PAGINA - 1;

    let query = supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_type,
        company_name,
        nif,
        address,
        postal_code,
        city,
        delivery_preference,
        payment_preference,
        payment_status,
        payment_provider,
        payment_reference,
        urgency,
        contact_preference,
        compatibility_confirmation,
        notes,
        subtotal_products,
        shipping_cost,
        total_amount,
        total_estimated,
        status,
        stock_deducted,
        shipping_carrier,
        tracking_code,
        tracking_url,
        shipped_at,
        delivered_at,
        keyinvoice_doc_type,
        keyinvoice_doc_series,
        keyinvoice_doc_num,
        keyinvoice_full_doc_number,
        keyinvoice_invoice_issued_at,
        keyinvoice_invoice_sent_at,
        approval_email_sent_at,
        approval_email_sending_at,
        preparation_email_sent_at,
        preparation_email_sending_at,
        shipping_email_sent_at,
        shipping_email_sending_at,
        created_at,
        order_items (
          id,
          product_id,
          product_name,
          product_reference,
          product_brand,
          quantity,
          unit_price,
          price_text
        ),
        return_requests (
          id,
          order_id,
          user_id,
          reason,
          details,
          status,
          admin_notes,
          requested_at,
          reviewed_at
        )
      `,
        { count: "exact" }
      );

    if (filtroEstado !== "Todos") {
      query = query.eq("status", filtroEstado);
    }

    if (filtroPagamento !== "Todos") {
      if (filtroPagamento === "Pendente") {
        query = query.or("payment_status.eq.Pendente,payment_status.is.null");
      } else {
        query = query.eq("payment_status", filtroPagamento);
      }
    }

    const termo = pesquisaEncomenda.trim().replace(/,/g, " ");

    if (termo) {
      query = query.or(
        `customer_name.ilike.%${termo}%,customer_email.ilike.%${termo}%,customer_phone.ilike.%${termo}%,customer_type.ilike.%${termo}%,company_name.ilike.%${termo}%,nif.ilike.%${termo}%,address.ilike.%${termo}%,postal_code.ilike.%${termo}%,city.ilike.%${termo}%,payment_reference.ilike.%${termo}%,tracking_code.ilike.%${termo}%,keyinvoice_full_doc_number.ilike.%${termo}%`
      );
    }

    if (ordenacao === "Mais recentes") {
      query = query.order("created_at", { ascending: false });
    }

    if (ordenacao === "Mais antigas") {
      query = query.order("created_at", { ascending: true });
    }

    if (ordenacao === "Maior valor") {
      query = query.order("total_estimated", { ascending: false });
    }

    if (ordenacao === "Menor valor") {
      query = query.order("total_estimated", { ascending: true });
    }

    const { data, error, count } = await query.range(inicio, fim);

    if (error) {
      setErro(`Erro ao carregar encomendas: ${error.message}`);
      setACarregar(false);
      setACarregarMais(false);
      setAAtualizar(false);
      return;
    }

    const novasEncomendas = ((data || []) as Encomenda[]).map(
      normalizarEncomenda
    );

    const totalResultado = count || 0;

    if (reiniciar) {
      setEncomendas(novasEncomendas);
      setTemMaisEncomendas(totalResultado > novasEncomendas.length);
    } else {
      setEncomendas((atuais) => {
        const atualizadas = [...atuais, ...novasEncomendas];
        setTemMaisEncomendas(totalResultado > atualizadas.length);
        return atualizadas;
      });
    }

    setTotalEncomendas(totalResultado);
    setACarregar(false);
    setACarregarMais(false);
    setAAtualizar(false);
  }

  async function atualizarPainel() {
    setAAtualizar(true);

    await Promise.all([
      carregarEstatisticasAdmin(),
      carregarEncomendas(true),
    ]);

    setAAtualizar(false);
  }

  useEffect(() => {
    async function carregarAdmin() {
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
        carregarEstatisticasAdmin(),
        carregarEncomendas(true),
      ]);

      setACarregar(false);
    }

    carregarAdmin();
  }, [router]);

  useEffect(() => {
    if (!autorizado) return;

    if (primeiroCarregamentoFiltros.current) {
      primeiroCarregamentoFiltros.current = false;
      return;
    }

    const temporizador = setTimeout(() => {
      carregarEncomendas(true);
    }, 300);

    return () => clearTimeout(temporizador);
  }, [filtroEstado, filtroPagamento, ordenacao, pesquisaEncomenda, autorizado]);

  async function baixarStockDaEncomenda(encomenda: Encomenda) {
    if (encomenda.stock_deducted) {
      return {
        sucesso: true,
        mensagem: "O stock desta encomenda já tinha sido abatido.",
      };
    }

    const idsProdutos = encomenda.order_items
      .map((item) => item.product_id)
      .filter(Boolean);

    if (idsProdutos.length === 0) {
      return {
        sucesso: false,
        mensagem:
          "Esta encomenda não tem produtos associados para abater stock.",
      };
    }

    const { data: produtos, error: erroProdutos } = await supabase
      .from("products")
      .select("id, name, stock, allow_backorder")
      .in("id", idsProdutos);

    if (erroProdutos) {
      return {
        sucesso: false,
        mensagem: `Erro ao verificar stock: ${erroProdutos.message}`,
      };
    }

    const produtosStock = (produtos || []) as ProdutoStock[];

    for (const item of encomenda.order_items) {
      const produto = produtosStock.find(
        (produtoAtual) => produtoAtual.id === item.product_id
      );

      if (!produto) {
        return {
          sucesso: false,
          mensagem: `Produto não encontrado na base de dados: ${item.product_name}.`,
        };
      }

      if (!produto.allow_backorder && produto.stock < item.quantity) {
        return {
          sucesso: false,
          mensagem: `Stock insuficiente para "${produto.name}". Stock atual: ${produto.stock}. Quantidade pedida: ${item.quantity}.`,
        };
      }
    }

    for (const item of encomenda.order_items) {
      const produto = produtosStock.find(
        (produtoAtual) => produtoAtual.id === item.product_id
      );

      if (!produto) continue;

      const novoStock = Math.max(0, Number(produto.stock || 0) - item.quantity);

      const { error: erroAtualizarStock } = await supabase
        .from("products")
        .update({
          stock: novoStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", produto.id);

      if (erroAtualizarStock) {
        return {
          sucesso: false,
          mensagem: `Erro ao atualizar stock de "${produto.name}": ${erroAtualizarStock.message}`,
        };
      }
    }

    return {
      sucesso: true,
      mensagem: "Stock abatido com sucesso.",
    };
  }

  async function emitirEEnviarFaturaAutomatica(orderId: string) {
    const respostaEmissao = await fetch("/api/keyinvoice/emitir-fatura", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        confirmar: "SIM",
      }),
    });

    const resultadoEmissao =
      (await respostaEmissao.json()) as ResultadoEmissaoFatura;

    if (!respostaEmissao.ok || !resultadoEmissao.success) {
      throw new Error(
        resultadoEmissao.error ||
          "Não foi possível emitir a Fatura-Recibo no KeyInvoice."
      );
    }

    const dadosFatura = resultadoEmissao.keyinvoice;

    if (!dadosFatura) {
      throw new Error(
        "A Fatura-Recibo foi emitida, mas o KeyInvoice não devolveu os dados do documento."
      );
    }

    const encomendaAtualizada = encomendas.find((item) => item.id === orderId);
    const emailCliente = encomendaAtualizada?.customer_email;
    const nomeCliente = encomendaAtualizada?.customer_name || "Cliente";

    if (!emailCliente) {
      throw new Error(
        "A Fatura-Recibo foi emitida, mas a encomenda não tem email do cliente."
      );
    }

    const respostaEnvio = await fetch("/api/keyinvoice/enviar-fatura-gmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        docType: dadosFatura.docType,
        docSeries: dadosFatura.docSeries,
        docNum: dadosFatura.docNum,
        fullDocNumber: dadosFatura.fullDocNumber,
        email: emailCliente,
        customerName: nomeCliente,
      }),
    });

    const resultadoEnvio = (await respostaEnvio.json()) as ResultadoEnvioFatura;

    if (!respostaEnvio.ok || !resultadoEnvio.success) {
      throw new Error(
        resultadoEnvio.error ||
          "A Fatura-Recibo foi emitida, mas não foi possível enviar o PDF ao cliente."
      );
    }

    setEncomendas((atuais) =>
      atuais.map((item) =>
        item.id === orderId
          ? {
              ...item,
              keyinvoice_doc_type: dadosFatura.docType,
              keyinvoice_doc_series: dadosFatura.docSeries,
              keyinvoice_doc_num: dadosFatura.docNum,
              keyinvoice_full_doc_number: dadosFatura.fullDocNumber,
              keyinvoice_invoice_issued_at: new Date().toISOString(),
              keyinvoice_invoice_sent_at: new Date().toISOString(),
            }
          : item
      )
    );

    return dadosFatura.fullDocNumber;
  }

  async function aprovarEncomenda(encomenda: Encomenda) {
    setMensagem("");
    setErro("");

    if (encomenda.keyinvoice_doc_num) {
      setErro("Esta encomenda já tem fatura emitida e não deve ser reaprovada.");
      return;
    }

    if (encomenda.approval_email_sent_at) {
      setMensagem("Esta encomenda já tinha o email de aprovação enviado.");
      return;
    }

    if (encomenda.approval_email_sending_at) {
      setMensagem(
        "O email de aprovação já está em envio. Aguarda alguns segundos."
      );
      return;
    }

    if (
      encomenda.shipping_cost === null ||
      encomenda.shipping_cost === undefined
    ) {
      setErro(
        "Define e guarda primeiro os portes finais antes de aprovar a encomenda."
      );
      return;
    }

    const subtotal = Number(encomenda.subtotal_products || 0);
    const totalFinal = subtotal + Number(encomenda.shipping_cost || 0);

    const { error } = await supabase
      .from("orders")
      .update({
        status: "Aprovada - aguarda pagamento",
        payment_status: "Pendente",
        shipping_cost: Number(encomenda.shipping_cost || 0),
        total_amount: totalFinal,
        total_estimated: totalFinal,
      })
      .eq("id", encomenda.id);

    if (error) {
      setErro(`Não foi possível aprovar a encomenda: ${error.message}`);
      return;
    }

    setEncomendas((atuais) =>
      atuais.map((item) =>
        item.id === encomenda.id
          ? {
              ...item,
              status: "Aprovada - aguarda pagamento",
              payment_status: "Pendente",
              shipping_cost: Number(encomenda.shipping_cost || 0),
              total_amount: totalFinal,
              total_estimated: totalFinal,
              approval_email_sending_at: new Date().toISOString(),
            }
          : item
      )
    );

    const respostaEmail = await fetch("/api/emails/encomenda-aprovada", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: encomenda.id }),
    });

    const resultadoEmail = await respostaEmail.json();

    if (!respostaEmail.ok || !resultadoEmail.success) {
      setEncomendas((atuais) =>
        atuais.map((item) =>
          item.id === encomenda.id
            ? {
                ...item,
                status: "Aprovada - aguarda pagamento",
                payment_status: "Pendente",
                shipping_cost: Number(encomenda.shipping_cost || 0),
                total_amount: totalFinal,
                total_estimated: totalFinal,
                approval_email_sending_at: null,
              }
            : item
        )
      );

      setMensagem(
        "Encomenda aprovada, mas o email de aprovação não foi enviado."
      );
      setErro(resultadoEmail.error || "Erro ao enviar email de aprovação.");
      return;
    }

    setEncomendas((atuais) =>
      atuais.map((item) =>
        item.id === encomenda.id
          ? {
              ...item,
              status: "Aprovada - aguarda pagamento",
              payment_status: "Pendente",
              shipping_cost: Number(encomenda.shipping_cost || 0),
              total_amount: totalFinal,
              total_estimated: totalFinal,
              approval_email_sent_at: new Date().toISOString(),
              approval_email_sending_at: null,
            }
          : item
      )
    );

    await carregarEstatisticasAdmin();

    if (resultadoEmail.alreadySent) {
      setMensagem(
        "A encomenda já estava aprovada e o email já tinha sido enviado."
      );
      return;
    }

    setMensagem("Encomenda aprovada e email enviado ao cliente.");
  }

  async function enviarEmailPreparacao(encomendaId: string) {
    const encomenda = encomendas.find((item) => item.id === encomendaId);

    if (!encomenda) {
      return {
        sucesso: false,
        mensagem: "Encomenda não encontrada para enviar email de preparação.",
      };
    }

    if (encomenda.preparation_email_sent_at) {
      return {
        sucesso: true,
        mensagem: "O email de preparação já tinha sido enviado anteriormente.",
        alreadySent: true,
      };
    }

    if (encomenda.preparation_email_sending_at) {
      return {
        sucesso: false,
        mensagem:
          "O email de preparação já está em envio. Aguarda alguns segundos.",
      };
    }

    setEncomendas((atuais) =>
      atuais.map((item) =>
        item.id === encomendaId
          ? {
              ...item,
              preparation_email_sending_at: new Date().toISOString(),
            }
          : item
      )
    );

    const resposta = await fetch("/api/emails/encomenda-preparacao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: encomendaId }),
    });

    const resultado = await resposta.json();

    if (!resposta.ok || !resultado.success) {
      setEncomendas((atuais) =>
        atuais.map((item) =>
          item.id === encomendaId
            ? {
                ...item,
                preparation_email_sending_at: null,
              }
            : item
        )
      );

      return {
        sucesso: false,
        mensagem:
          resultado.error ||
          "Estado atualizado, mas o email de preparação não foi enviado.",
      };
    }

    setEncomendas((atuais) =>
      atuais.map((item) =>
        item.id === encomendaId
          ? {
              ...item,
              preparation_email_sent_at:
                item.preparation_email_sent_at || new Date().toISOString(),
              preparation_email_sending_at: null,
            }
          : item
      )
    );

    return {
      sucesso: true,
      mensagem: resultado.alreadySent
        ? "O email de preparação já tinha sido enviado anteriormente."
        : "Email de preparação enviado ao cliente.",
      alreadySent: Boolean(resultado.alreadySent),
    };
  }

  async function enviarEmailEnvio(encomendaId: string) {
    const encomenda = encomendas.find((item) => item.id === encomendaId);

    if (!encomenda) {
      return {
        sucesso: false,
        mensagem: "Encomenda não encontrada para enviar email de envio.",
      };
    }

    if (encomenda.shipping_email_sent_at) {
      return {
        sucesso: true,
        mensagem: "O email de envio já tinha sido enviado anteriormente.",
        alreadySent: true,
      };
    }

    if (encomenda.shipping_email_sending_at) {
      return {
        sucesso: false,
        mensagem: "O email de envio já está em envio. Aguarda alguns segundos.",
      };
    }

    setEncomendas((atuais) =>
      atuais.map((item) =>
        item.id === encomendaId
          ? {
              ...item,
              shipping_email_sending_at: new Date().toISOString(),
            }
          : item
      )
    );

    const resposta = await fetch("/api/emails/encomenda-enviada", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: encomendaId }),
    });

    const resultado = await resposta.json();

    if (!resposta.ok || !resultado.success) {
      setEncomendas((atuais) =>
        atuais.map((item) =>
          item.id === encomendaId
            ? {
                ...item,
                shipping_email_sending_at: null,
              }
            : item
        )
      );

      return {
        sucesso: false,
        mensagem:
          resultado.error ||
          "Estado atualizado, mas o email de envio não foi enviado.",
      };
    }

    setEncomendas((atuais) =>
      atuais.map((item) =>
        item.id === encomendaId
          ? {
              ...item,
              shipping_email_sent_at:
                item.shipping_email_sent_at || new Date().toISOString(),
              shipping_email_sending_at: null,
            }
          : item
      )
    );

    return {
      sucesso: true,
      mensagem: resultado.alreadySent
        ? "O email de envio já tinha sido enviado anteriormente."
        : "Email de envio enviado ao cliente.",
      alreadySent: Boolean(resultado.alreadySent),
    };
  }

  async function alterarEstado(id: string, novoEstado: string) {
    setMensagem("");
    setErro("");

    const encomenda = encomendas.find((item) => item.id === id);

    if (!encomenda) {
      setErro("Encomenda não encontrada.");
      return;
    }

    if (novoEstado === "Aprovada - aguarda pagamento") {
      await aprovarEncomenda(encomenda);
      return;
    }

    const pagamentoAnterior = encomenda.payment_status || "Pendente";

    let stockDeductedAtualizado = encomenda.stock_deducted;
    const paymentStatusAtualizado =
      obterEstadoPagamentoPorEstadoEncomenda(novoEstado);

    if (
      paymentStatusAtualizado === "Pago" &&
      encomenda.status !== "Aprovada - aguarda pagamento" &&
      encomenda.status !== "Pago" &&
      encomenda.status !== "Em preparação" &&
      encomenda.status !== "Enviado" &&
      encomenda.status !== "Entregue"
    ) {
      setErro(
        "Esta encomenda ainda não foi aprovada. Aprova primeiro a encomenda antes de a marcar como paga."
      );
      return;
    }

    if (
      paymentStatusAtualizado === "Pago" &&
      (encomenda.shipping_cost === null ||
        encomenda.shipping_cost === undefined)
    ) {
      setErro(
        "Esta encomenda tem portes sob consulta. Define e guarda primeiro os portes finais antes de marcar como paga."
      );
      return;
    }

    const agora = new Date().toISOString();

    const shippedAtAtualizado =
      novoEstado === "Enviado" && !encomenda.shipped_at
        ? agora
        : encomenda.shipped_at;

    const deliveredAtAtualizado =
      novoEstado === "Entregue" && !encomenda.delivered_at
        ? agora
        : encomenda.delivered_at;

    if (
      (novoEstado === "Pago" ||
        novoEstado === "Em preparação" ||
        novoEstado === "Enviado" ||
        novoEstado === "Entregue") &&
      !encomenda.stock_deducted
    ) {
      const resultadoStock = await baixarStockDaEncomenda(encomenda);

      if (!resultadoStock.sucesso) {
        setErro(resultadoStock.mensagem);
        return;
      }

      stockDeductedAtualizado = true;
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: novoEstado,
        payment_status: paymentStatusAtualizado,
        stock_deducted: stockDeductedAtualizado,
        shipped_at: shippedAtAtualizado,
        delivered_at: deliveredAtAtualizado,
      })
      .eq("id", id);

    if (error) {
      setErro(`Não foi possível alterar o estado: ${error.message}`);
      return;
    }

    setEncomendas((atuais) =>
      atuais.map((item) =>
        item.id === id
          ? {
              ...item,
              status: novoEstado,
              payment_status: paymentStatusAtualizado,
              stock_deducted: stockDeductedAtualizado,
              shipped_at: shippedAtAtualizado,
              delivered_at: deliveredAtAtualizado,
            }
          : item
      )
    );

    await carregarEstatisticasAdmin();

    const passouParaPago =
      pagamentoAnterior !== "Pago" && paymentStatusAtualizado === "Pago";

    const mensagens: string[] = ["Estado da encomenda atualizado."];

    if (passouParaPago) {
      try {
        const respostaEmail = await fetch("/api/emails/pagamento-confirmado", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId: id }),
        });

        const resultadoEmail = await respostaEmail.json();

        if (!respostaEmail.ok) {
          setMensagem(
            "Estado da encomenda atualizado, mas o email de pagamento confirmado não foi enviado."
          );
          setErro(resultadoEmail.error || "Erro ao enviar email de pagamento.");
          return;
        }

        mensagens.push("Email de pagamento confirmado enviado.");

        if (encomenda.keyinvoice_doc_num) {
          mensagens.push(
            `Esta encomenda já tinha Fatura-Recibo emitida: ${
              encomenda.keyinvoice_full_doc_number ||
              encomenda.keyinvoice_doc_num
            }.`
          );
        } else {
          const numeroFatura = await emitirEEnviarFaturaAutomatica(id);

          mensagens.push(
            `Fatura-Recibo ${numeroFatura} emitida e enviada ao cliente.`
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao emitir/enviar fatura.";

        setMensagem(
          "Estado da encomenda atualizado e email de pagamento confirmado enviado, mas houve erro na emissão/envio da Fatura-Recibo."
        );
        setErro(message);
        return;
      }
    }

    if (novoEstado === "Em preparação") {
      const resultadoPreparacao = await enviarEmailPreparacao(id);

      if (!resultadoPreparacao.sucesso) {
        setMensagem(mensagens.join(" "));
        setErro(resultadoPreparacao.mensagem);
        return;
      }

      mensagens.push(resultadoPreparacao.mensagem);
    }

    if (novoEstado === "Enviado") {
      const resultadoEnvio = await enviarEmailEnvio(id);

      if (!resultadoEnvio.sucesso) {
        setMensagem(mensagens.join(" "));
        setErro(resultadoEnvio.mensagem);
        return;
      }

      mensagens.push(resultadoEnvio.mensagem);
    }

    setMensagem(mensagens.join(" "));
  }

  function atualizarEncomendaLocal(
    encomendaId: string,
    campo: keyof Encomenda,
    valor: string | null
  ) {
    setEncomendas((atuais) =>
      atuais.map((encomenda) =>
        encomenda.id === encomendaId
          ? {
              ...encomenda,
              [campo]: valor,
            }
          : encomenda
      )
    );
  }

  function atualizarPortesLocais(encomendaId: string, valor: string) {
    const portes = normalizarValorMonetario(valor);

    if (portes === undefined) {
      return;
    }

    setEncomendas((atuais) =>
      atuais.map((encomenda) => {
        if (encomenda.id !== encomendaId) return encomenda;

        const subtotal = Number(encomenda.subtotal_products || 0);
        const totalFinal = portes === null ? subtotal : subtotal + portes;

        return {
          ...encomenda,
          shipping_cost: portes,
          total_amount: totalFinal,
          total_estimated: totalFinal,
        };
      })
    );
  }

  async function guardarValorFinal(encomenda: Encomenda) {
    setMensagem("");
    setErro("");

    if (
      encomenda.shipping_cost === null ||
      encomenda.shipping_cost === undefined
    ) {
      setErro("Define primeiro um valor de portes antes de guardar.");
      return;
    }

    const subtotal = Number(encomenda.subtotal_products || 0);
    const totalFinal = subtotal + Number(encomenda.shipping_cost || 0);

    const { error } = await supabase
      .from("orders")
      .update({
        shipping_cost: Number(encomenda.shipping_cost || 0),
        total_amount: totalFinal,
        total_estimated: totalFinal,
      })
      .eq("id", encomenda.id);

    if (error) {
      setErro(`Não foi possível guardar o valor final: ${error.message}`);
      return;
    }

    setEncomendas((atuais) =>
      atuais.map((item) =>
        item.id === encomenda.id
          ? {
              ...item,
              shipping_cost: Number(encomenda.shipping_cost || 0),
              total_amount: totalFinal,
              total_estimated: totalFinal,
            }
          : item
      )
    );

    setMensagem("Valor final da encomenda guardado com sucesso.");
  }

  async function guardarDadosEnvio(encomenda: Encomenda) {
    setMensagem("");
    setErro("");

    const { error } = await supabase
      .from("orders")
      .update({
        shipping_carrier: encomenda.shipping_carrier || null,
        tracking_code: encomenda.tracking_code || null,
        tracking_url: encomenda.tracking_url || null,
        shipped_at: encomenda.shipped_at || null,
        delivered_at: encomenda.delivered_at || null,
      })
      .eq("id", encomenda.id);

    if (error) {
      setErro(`Não foi possível guardar os dados de envio: ${error.message}`);
      return;
    }

    setMensagem("Dados de envio guardados com sucesso.");
  }

  async function terminarSessao() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function formatarData(data: string | null) {
    if (!data) return "Não definido";

    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(data));
  }

  function formatarPreco(valor: number | null | undefined) {
    return `${Number(valor || 0).toFixed(2).replace(".", ",")}€`;
  }

  function contarPorEstado(estado: string) {
    return estatisticas.porEstado[estado] || 0;
  }

  function contarPorPagamento(estadoPagamento: string) {
    return estatisticas.porPagamento[estadoPagamento] || 0;
  }

  function corEstadoPagamento(paymentStatus: string | null) {
    if (paymentStatus === "Pago") return "bg-green-50 text-green-700";
    if (paymentStatus === "Pendente") return "bg-amber-50 text-amber-700";
    if (paymentStatus === "Cancelado") return "bg-red-50 text-red-700";
    if (paymentStatus === "Reembolsado") return "bg-blue-50 text-blue-700";

    return "bg-slate-100 text-slate-500";
  }

  function corEstadoDevolucao(status: string) {
    if (status === "Solicitada") return "bg-amber-50 text-amber-700";
    if (status === "Em análise") return "bg-blue-50 text-blue-700";
    if (status === "Aprovada") return "bg-green-50 text-green-700";
    if (status === "Rejeitada") return "bg-red-50 text-red-700";
    if (status === "Concluída") return "bg-slate-100 text-slate-700";

    return "bg-slate-100 text-slate-500";
  }

  function limparPesquisaEFiltros() {
    setPesquisaEncomenda("");
    setFiltroEstado("Todos");
    setFiltroPagamento("Todos");
    setOrdenacao("Mais recentes");
  }

  if (aCarregar) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A carregar painel...
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
            não está autorizado a aceder ao painel de administração.
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
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
              Administração
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Painel da loja
            </h1>

            <p className="mt-4 max-w-2xl text-slate-600">
              Consulte encomendas, aprove pedidos, acompanhe pagamentos,
              prepare envios e faça a gestão operacional da loja.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={atualizarPainel}
              disabled={aAtualizar}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {aAtualizar ? "A atualizar..." : "Atualizar"}
            </button>

            <a
              href="/admin/produtos"
              className="rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Gerir produtos
            </a>

            <a
              href="/admin/devolucoes"
              className="rounded-full bg-amber-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
            >
              Gerir devoluções
            </a>

            <button
              onClick={terminarSessao}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-red-500 hover:text-red-600"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Total de encomendas
            </p>
            <p className="mt-3 text-4xl font-black">{estatisticas.total}</p>
            <p className="mt-2 text-xs text-slate-500">
              {encomendas.length} carregadas nesta página
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              A aguardar aprovação
            </p>
            <p className="mt-3 text-4xl font-black">
              {estatisticas.aguardarAprovacao}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              A aguardar pagamento
            </p>
            <p className="mt-3 text-4xl font-black">
              {estatisticas.aguardarPagamento}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Pagas</p>
            <p className="mt-3 text-4xl font-black">{estatisticas.pagas}</p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                  Filtros e pesquisa
                </p>

                <h2 className="mt-3 text-2xl font-black">
                  Encontrar encomendas
                </h2>
              </div>

              <p className="text-sm text-slate-500">
                A mostrar{" "}
                <span className="font-bold text-slate-900">
                  {encomendasFiltradas.length}
                </span>{" "}
                de{" "}
                <span className="font-bold text-slate-900">
                  {totalEncomendas}
                </span>{" "}
                encomendas encontradas
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_220px]">
              <label className="text-sm font-semibold">
                Pesquisar encomenda
                <input
                  value={pesquisaEncomenda}
                  onChange={(event) => setPesquisaEncomenda(event.target.value)}
                  placeholder="Nome, email, telefone, NIF, fatura, tracking..."
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                />
              </label>

              <label className="text-sm font-semibold">
                Estado pagamento
                <select
                  value={filtroPagamento}
                  onChange={(event) => setFiltroPagamento(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                >
                  {filtrosPagamento.map((filtro) => (
                    <option key={filtro} value={filtro}>
                      {filtro}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold">
                Ordenação
                <select
                  value={ordenacao}
                  onChange={(event) => setOrdenacao(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
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
                onClick={limparPesquisaEFiltros}
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

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              {filtrosPagamento.map((filtro) => {
                const ativo = filtroPagamento === filtro;

                return (
                  <button
                    key={filtro}
                    type="button"
                    onClick={() => setFiltroPagamento(filtro)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      ativo
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
                    }`}
                  >
                    Pagamento: {filtro}{" "}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                        ativo
                          ? "bg-white text-slate-900"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {contarPorPagamento(filtro)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

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

        <section className="mt-8">
          {encomendasFiltradas.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <h3 className="text-xl font-black">
                Não há encomendas com estes filtros.
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tenta limpar a pesquisa ou escolher outro estado.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {encomendasFiltradas.map((encomenda) => (
                <article
                  key={encomenda.id}
                  className="rounded-[2rem] border border-green-100 bg-[#f4fbf4] p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 border-b border-green-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                          {formatarData(encomenda.created_at)}
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${corEstadoPagamento(
                            encomenda.payment_status
                          )}`}
                        >
                          Pagamento: {encomenda.payment_status || "Pendente"}
                        </span>

                        {encomenda.status === "A aguardar aprovação" && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                            Aguarda aprovação
                          </span>
                        )}

                        {encomenda.status ===
                          "Aprovada - aguarda pagamento" && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            Aprovada
                          </span>
                        )}

                        {encomenda.approval_email_sent_at && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                            Email aprovação enviado
                          </span>
                        )}

                        {encomenda.approval_email_sending_at && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            Email aprovação em envio
                          </span>
                        )}

                        {encomenda.preparation_email_sent_at && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            Email preparação enviado
                          </span>
                        )}

                        {encomenda.preparation_email_sending_at && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                            Email preparação em envio
                          </span>
                        )}

                        {encomenda.shipping_email_sent_at && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            Email envio enviado
                          </span>
                        )}

                        {encomenda.shipping_email_sending_at && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                            Email envio em envio
                          </span>
                        )}

                        {encomenda.stock_deducted && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                            Stock abatido
                          </span>
                        )}

                        {encomenda.shipping_cost === null && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                            Portes sob consulta
                          </span>
                        )}

                        {encomenda.keyinvoice_doc_num && (
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                            Fatura:{" "}
                            {encomenda.keyinvoice_full_doc_number ||
                              encomenda.keyinvoice_doc_num}
                          </span>
                        )}

                        {encomenda.keyinvoice_invoice_sent_at && (
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                            Fatura enviada
                          </span>
                        )}

                        {encomenda.shipped_at && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            Enviada
                          </span>
                        )}

                        {encomenda.delivered_at && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                            Entregue
                          </span>
                        )}

                        {encomenda.return_requests.length > 0 && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                            Pedido de devolução
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-2xl font-black text-slate-900">
                        {encomenda.customer_name}
                      </h3>

                      <p className="mt-2 break-all text-xs text-slate-500">
                        Nº interno: {encomenda.id}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white px-5 py-4 text-sm shadow-sm">
                      <p className="text-slate-500">
                        {encomenda.shipping_cost === null
                          ? "Total estimado"
                          : "Total"}
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-900">
                        {formatarPreco(
                          encomenda.total_amount || encomenda.total_estimated
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                    <div className="space-y-5">
                      <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-black text-slate-900">
                          Resumo da encomenda
                        </p>

                        <div className="mt-4 grid gap-x-6 gap-y-3 text-sm text-slate-600 md:grid-cols-2">
                          <p>
                            <span className="font-bold text-slate-900">
                              Email:
                            </span>{" "}
                            {encomenda.customer_email}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Telefone:
                            </span>{" "}
                            {encomenda.customer_phone}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Cliente:
                            </span>{" "}
                            {encomenda.customer_type}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              NIF:
                            </span>{" "}
                            {encomenda.nif || "Não indicado"}
                          </p>

                          {encomenda.company_name && (
                            <p>
                              <span className="font-bold text-slate-900">
                                Empresa:
                              </span>{" "}
                              {encomenda.company_name}
                            </p>
                          )}

                          <p>
                            <span className="font-bold text-slate-900">
                              Entrega:
                            </span>{" "}
                            {encomenda.delivery_preference}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Pagamento:
                            </span>{" "}
                            {encomenda.payment_preference}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Estado:
                            </span>{" "}
                            {encomenda.status}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Subtotal:
                            </span>{" "}
                            {formatarPreco(encomenda.subtotal_products)}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Portes:
                            </span>{" "}
                            {encomenda.shipping_cost === null
                              ? "Sob consulta"
                              : formatarPreco(encomenda.shipping_cost)}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Contacto:
                            </span>{" "}
                            {encomenda.contact_preference}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Compatibilidade:
                            </span>{" "}
                            {encomenda.compatibility_confirmation
                              ? "Pediu confirmação"
                              : "Não pediu confirmação"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="rounded-3xl bg-white p-5 shadow-sm">
                          <p className="text-sm font-black text-slate-900">
                            Morada
                          </p>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {encomenda.address}, {encomenda.postal_code}{" "}
                            {encomenda.city}
                          </p>
                        </div>

                        <div className="rounded-3xl bg-white p-5 shadow-sm">
                          <p className="text-sm font-black text-slate-900">
                            Observações
                          </p>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {encomenda.notes || "Sem observações"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-slate-900">
                            Produtos
                          </p>
                          <p className="text-xs text-slate-500">
                            {encomenda.order_items.length} produto(s)
                          </p>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {encomenda.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <p className="font-bold text-slate-900">
                                {item.quantity}x {item.product_name}
                              </p>

                              <p className="mt-2 text-sm text-slate-600">
                                Ref.:{" "}
                                {item.product_reference || "Sem referência"}
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                Marca: {item.product_brand || "Sem marca"}
                              </p>

                              <p className="mt-3 text-sm font-bold text-slate-900">
                                {item.price_text || "Sob consulta"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-black text-slate-900">
                          Estado da encomenda
                        </p>

                        <select
                          value={encomenda.status}
                          onChange={(event) =>
                            alterarEstado(encomenda.id, event.target.value)
                          }
                          className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-green-700"
                        >
                          {estados.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>

                        <div className="mt-4 space-y-3">
                          {encomenda.status === "A aguardar aprovação" && (
                            <>
                              <button
                                type="button"
                                onClick={() => aprovarEncomenda(encomenda)}
                                disabled={
                                  !!encomenda.approval_email_sent_at ||
                                  !!encomenda.approval_email_sending_at
                                }
                                className="w-full rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                {encomenda.approval_email_sending_at
                                  ? "A enviar email..."
                                  : encomenda.approval_email_sent_at
                                  ? "Email de aprovação já enviado"
                                  : "Aprovar encomenda e enviar email"}
                              </button>

                              {encomenda.approval_email_sent_at && (
                                <p className="rounded-2xl bg-green-50 p-3 text-xs font-bold text-green-700">
                                  Email de aprovação enviado em{" "}
                                  {formatarData(
                                    encomenda.approval_email_sent_at
                                  )}
                                  .
                                </p>
                              )}
                            </>
                          )}

                          {encomenda.status !== "A aguardar aprovação" &&
                            encomenda.approval_email_sent_at && (
                              <p className="rounded-2xl bg-green-50 p-3 text-xs font-bold text-green-700">
                                Email de aprovação enviado em{" "}
                                {formatarData(
                                  encomenda.approval_email_sent_at
                                )}
                                .
                              </p>
                            )}

                          {encomenda.preparation_email_sent_at && (
                            <p className="rounded-2xl bg-blue-50 p-3 text-xs font-bold text-blue-700">
                              Email de preparação enviado em{" "}
                              {formatarData(
                                encomenda.preparation_email_sent_at
                              )}
                              .
                            </p>
                          )}

                          {encomenda.shipping_email_sent_at && (
                            <p className="rounded-2xl bg-blue-50 p-3 text-xs font-bold text-blue-700">
                              Email de envio enviado em{" "}
                              {formatarData(encomenda.shipping_email_sent_at)}.
                            </p>
                          )}

                          <a
                            href={`/encomenda/${encomenda.id}/pagamento`}
                            className="block rounded-full border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
                          >
                            Ver pagamento
                          </a>

                          {encomenda.return_requests.length > 0 && (
                            <a
                              href="/admin/devolucoes"
                              className="block rounded-full bg-amber-700 px-5 py-2.5 text-center text-sm font-bold text-white transition hover:bg-amber-800"
                            >
                              Gerir devolução
                            </a>
                          )}
                        </div>

                        <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                          Primeiro aprove a encomenda. Só depois o cliente deve
                          pagar. Quando o pagamento for confirmado e mudar para{" "}
                          <span className="font-bold">Pago</span>, o sistema
                          envia o email de pagamento confirmado, emite a
                          Fatura-Recibo e envia o PDF. Ao mudar para{" "}
                          <span className="font-bold">Em preparação</span>,
                          envia o email de preparação. Ao mudar para{" "}
                          <span className="font-bold">Enviado</span>, envia o
                          email de envio.
                        </p>
                      </div>

                      <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-black text-slate-900">
                          Valor final
                        </p>

                        <div className="mt-4 grid gap-3 text-sm text-slate-600">
                          <p>
                            <span className="font-bold text-slate-900">
                              Produtos:
                            </span>{" "}
                            {formatarPreco(encomenda.subtotal_products)}
                          </p>

                          <label className="text-xs font-bold text-slate-700">
                            Portes finais
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={
                                encomenda.shipping_cost === null ||
                                encomenda.shipping_cost === undefined
                                  ? ""
                                  : encomenda.shipping_cost
                              }
                              onChange={(event) =>
                                atualizarPortesLocais(
                                  encomenda.id,
                                  event.target.value
                                )
                              }
                              placeholder="Ex.: 3.75"
                              disabled={
                                !!encomenda.keyinvoice_doc_num ||
                                encomenda.payment_status === "Pago"
                              }
                              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none transition focus:border-green-700 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </label>

                          <p>
                            <span className="font-bold text-slate-900">
                              Total final:
                            </span>{" "}
                            {encomenda.shipping_cost === null
                              ? `${formatarPreco(
                                  encomenda.subtotal_products
                                )} + portes sob consulta`
                              : formatarPreco(
                                  Number(encomenda.subtotal_products || 0) +
                                    Number(encomenda.shipping_cost || 0)
                                )}
                          </p>
                        </div>

                        {encomenda.shipping_cost === null ? (
                          <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                            Esta encomenda tem portes sob consulta. Define os
                            portes finais antes de aprovar.
                          </p>
                        ) : (
                          <p className="mt-4 rounded-2xl bg-green-50 p-3 text-xs leading-5 text-green-700">
                            Esta encomenda já tem portes definidos.
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => guardarValorFinal(encomenda)}
                          disabled={
                            !!encomenda.keyinvoice_doc_num ||
                            encomenda.payment_status === "Pago"
                          }
                          className="mt-4 w-full rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Guardar valor final
                        </button>
                      </div>

                      <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-black text-slate-900">
                          Faturação
                        </p>

                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <p>
                            <span className="font-bold text-slate-900">
                              Documento:
                            </span>{" "}
                            {encomenda.keyinvoice_full_doc_number ||
                              "Ainda não emitido"}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Emitida em:
                            </span>{" "}
                            {formatarData(
                              encomenda.keyinvoice_invoice_issued_at
                            )}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Enviada em:
                            </span>{" "}
                            {formatarData(encomenda.keyinvoice_invoice_sent_at)}
                          </p>
                        </div>

                        {!encomenda.keyinvoice_doc_num ? (
                          <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                            A Fatura-Recibo será emitida automaticamente apenas
                            quando a encomenda aprovada passar para paga.
                          </p>
                        ) : (
                          <p className="mt-4 rounded-2xl bg-purple-50 p-3 text-xs leading-5 text-purple-700">
                            Esta encomenda já tem Fatura-Recibo associada, por
                            isso o sistema não volta a emitir outra.
                          </p>
                        )}
                      </div>

                      <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm font-black text-slate-900">
                          Envio
                        </p>

                        <div className="mt-4 grid gap-3">
                          <label className="text-xs font-bold text-slate-700">
                            Transportadora
                            <input
                              value={encomenda.shipping_carrier || ""}
                              onChange={(event) =>
                                atualizarEncomendaLocal(
                                  encomenda.id,
                                  "shipping_carrier",
                                  event.target.value
                                )
                              }
                              placeholder="Ex.: CTT, DPD, DHL..."
                              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none transition focus:border-green-700"
                            />
                          </label>

                          <label className="text-xs font-bold text-slate-700">
                            Código tracking
                            <input
                              value={encomenda.tracking_code || ""}
                              onChange={(event) =>
                                atualizarEncomendaLocal(
                                  encomenda.id,
                                  "tracking_code",
                                  event.target.value
                                )
                              }
                              placeholder="Código de envio"
                              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none transition focus:border-green-700"
                            />
                          </label>

                          <label className="text-xs font-bold text-slate-700">
                            Link tracking
                            <input
                              value={encomenda.tracking_url || ""}
                              onChange={(event) =>
                                atualizarEncomendaLocal(
                                  encomenda.id,
                                  "tracking_url",
                                  event.target.value
                                )
                              }
                              placeholder="https://..."
                              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none transition focus:border-green-700"
                            />
                          </label>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm text-slate-600">
                          <p>
                            <span className="font-bold text-slate-900">
                              Enviada em:
                            </span>{" "}
                            {formatarData(encomenda.shipped_at)}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Entregue em:
                            </span>{" "}
                            {formatarData(encomenda.delivered_at)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => guardarDadosEnvio(encomenda)}
                          className="mt-4 w-full rounded-full bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
                        >
                          Guardar dados de envio
                        </button>

                        {encomenda.tracking_url && (
                          <a
                            href={encomenda.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 block rounded-full bg-blue-700 px-5 py-2.5 text-center text-sm font-bold text-white transition hover:bg-blue-800"
                          >
                            Abrir tracking
                          </a>
                        )}
                      </div>

                      {encomenda.return_requests.length > 0 && (
                        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                          <p className="text-sm font-black text-amber-900">
                            Pedido de devolução
                          </p>

                          <p className="mt-3 text-sm text-amber-800">
                            Esta encomenda tem um pedido de devolução associado.
                          </p>

                          <div className="mt-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${corEstadoDevolucao(
                                encomenda.return_requests[0]?.status ||
                                  "Solicitada"
                              )}`}
                            >
                              {encomenda.return_requests[0]?.status ||
                                "Solicitada"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {temMaisEncomendas && (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => carregarEncomendas(false)}
                    disabled={aCarregarMais}
                    className="rounded-full bg-green-700 px-8 py-4 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {aCarregarMais
                      ? "A carregar..."
                      : "Carregar mais encomendas"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}