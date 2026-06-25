"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Utilizador = {
  id: string;
  email?: string;
  user_metadata?: {
    nome?: string;
  };
};

type Perfil = {
  id: string;
  nome: string;
  telefone: string;
  tipo_cliente: string;
  empresa: string;
  nif: string;
  morada: string;
  codigo_postal: string;
  localidade: string;
};

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
  reason: string;
  details: string | null;
  status: string;
  admin_notes: string | null;
  requested_at: string;
  reviewed_at: string | null;
};

type Encomenda = {
  id: string;
  created_at: string;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  payment_preference: string | null;
  total_estimated: number;
  subtotal_products: number | null;
  shipping_cost: number | null;
  total_amount: number | null;
  delivery_preference: string;
  contact_preference: string;
  shipping_carrier: string | null;
  tracking_code: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  order_items: EncomendaItem[];
  return_requests: PedidoDevolucao[];
};

const estadosProgresso = [
  "A aguardar aprovação",
  "Aprovada - aguarda pagamento",
  "Pago",
  "Em preparação",
  "Enviado",
  "Entregue",
];

const motivosDevolucao = [
  "Produto errado",
  "Produto danificado",
  "Produto incompatível",
  "Produto já não necessário",
  "Outro motivo",
];

function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validarTelefonePT(telefone: string) {
  const digitos = apenasDigitos(telefone);

  if (digitos.startsWith("351") && digitos.length === 12) {
    const numeroSemIndicativo = digitos.slice(3);
    return /^[29]\d{8}$/.test(numeroSemIndicativo);
  }

  return /^[29]\d{8}$/.test(digitos);
}

function validarCodigoPostalPT(codigoPostal: string) {
  if (!codigoPostal.trim()) return true;
  return /^\d{4}-\d{3}$/.test(codigoPostal.trim());
}

function validarNifPT(nif: string) {
  const digitos = apenasDigitos(nif);

  if (digitos.length !== 9) return false;

  const primeiroDigito = Number(digitos[0]);

  if (![1, 2, 3, 5, 6, 7, 8, 9].includes(primeiroDigito)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 8; i++) {
    soma += Number(digitos[i]) * (9 - i);
  }

  const resto = soma % 11;
  const digitoControlo = resto < 2 ? 0 : 11 - resto;

  return digitoControlo === Number(digitos[8]);
}

function normalizarTelefonePT(telefone: string) {
  const digitos = apenasDigitos(telefone);

  if (digitos.startsWith("351") && digitos.length === 12) {
    return digitos.slice(3);
  }

  return digitos;
}

function validarPerfilAntesDeGuardar(perfil: Perfil, email: string) {
  if (!validarEmail(email)) {
    return "O email associado à conta não tem um formato válido.";
  }

  if (!perfil.nome.trim()) {
    return "Indique o nome completo.";
  }

  if (!validarTelefonePT(perfil.telefone)) {
    return "Indique um número de telefone válido com 9 dígitos. Exemplo: 912345678.";
  }

  if (perfil.nif.trim() && !validarNifPT(perfil.nif)) {
    return "Indique um NIF válido com 9 dígitos.";
  }

  if (!validarCodigoPostalPT(perfil.codigo_postal)) {
    return "Indique o código postal no formato 0000-000.";
  }

  if (perfil.tipo_cliente === "Empresa" && !perfil.empresa.trim()) {
    return "Indique o nome da empresa.";
  }

  return "";
}

function obterTituloMetodoPagamento(method: string | null) {
  if (method === "multibanco") return "Referência Multibanco";
  if (method === "mbway") return "MB WAY";
  if (method === "card") return "Cartão de crédito/débito";
  if (method === "apple_pay") return "Apple Pay";
  if (method === "google_pay") return "Google Pay";

  return "Pagamento online";
}

function normalizarEstado(status: string) {
  if (status === "Pedido recebido") return "A aguardar aprovação";
  if (status === "Pendente de pagamento") return "Aprovada - aguarda pagamento";
  if (status === "Em confirmação") return "Pago";
  if (status === "Confirmado") return "Pago";
  if (status === "Concluído") return "Entregue";

  return status;
}

function obterMensagemEstado(encomenda: Encomenda) {
  const status = normalizarEstado(encomenda.status);

  if (status === "A aguardar aprovação") {
    return {
      titulo: "A sua encomenda foi recebida.",
      texto:
        "A encomenda está a ser validada pela equipa. Ainda não deve efetuar o pagamento. Assim que for aprovada, receberá indicação para pagar.",
      classe: "border-amber-200 bg-amber-50 text-amber-900",
    };
  }

  if (status === "Aprovada - aguarda pagamento") {
    return {
      titulo: "A encomenda foi aprovada.",
      texto:
        "Já pode consultar os dados de pagamento. Após confirmação do pagamento, a encomenda seguirá para preparação.",
      classe: "border-green-200 bg-green-50 text-green-900",
    };
  }

  if (status === "Pago") {
    return {
      titulo: "Pagamento confirmado.",
      texto:
        "O pagamento foi confirmado. A encomenda será preparada assim que possível.",
      classe: "border-green-200 bg-green-50 text-green-900",
    };
  }

  if (status === "Em preparação") {
    return {
      titulo: "Encomenda em preparação.",
      texto:
        "A encomenda está a ser preparada pela equipa. Receberá nova atualização quando for enviada.",
      classe: "border-blue-200 bg-blue-50 text-blue-900",
    };
  }

  if (status === "Enviado") {
    return {
      titulo: "Encomenda enviada.",
      texto:
        "A encomenda já foi enviada. Consulte abaixo os dados de envio e acompanhamento, quando disponíveis.",
      classe: "border-blue-200 bg-blue-50 text-blue-900",
    };
  }

  if (status === "Entregue") {
    return {
      titulo: "Encomenda entregue.",
      texto:
        "A encomenda foi marcada como entregue. Caso exista algum problema, pode submeter um pedido de devolução.",
      classe: "border-green-200 bg-green-50 text-green-900",
    };
  }

  if (status === "Cancelado") {
    return {
      titulo: "Encomenda cancelada.",
      texto: "Esta encomenda foi marcada como cancelada.",
      classe: "border-red-200 bg-red-50 text-red-900",
    };
  }

  if (status === "Devolução solicitada") {
    return {
      titulo: "Devolução solicitada.",
      texto: "O pedido de devolução foi registado e será analisado pela equipa.",
      classe: "border-amber-200 bg-amber-50 text-amber-900",
    };
  }

  if (status === "Devolvido") {
    return {
      titulo: "Encomenda devolvida.",
      texto: "Esta encomenda foi marcada como devolvida.",
      classe: "border-slate-200 bg-slate-100 text-slate-800",
    };
  }

  return {
    titulo: "Estado da encomenda atualizado.",
    texto: "Consulte os detalhes da encomenda abaixo.",
    classe: "border-slate-200 bg-slate-50 text-slate-800",
  };
}

function obterLinkPrincipal(encomenda: Encomenda) {
  const status = normalizarEstado(encomenda.status);

  if (status === "A aguardar aprovação") {
    return `/encomenda/${encomenda.id}/confirmacao`;
  }

  return `/encomenda/${encomenda.id}/pagamento`;
}

function obterTextoBotaoPrincipal(encomenda: Encomenda) {
  const status = normalizarEstado(encomenda.status);

  if (status === "A aguardar aprovação") {
    return "Ver estado";
  }

  if (status === "Aprovada - aguarda pagamento") {
    return "Ver pagamento";
  }

  if (encomenda.payment_status === "Pago") {
    return "Ver pagamento";
  }

  return "Ver encomenda";
}

function obterClasseBotaoPrincipal(encomenda: Encomenda) {
  const status = normalizarEstado(encomenda.status);

  if (
    status === "Aprovada - aguarda pagamento" &&
    encomenda.payment_status !== "Pago"
  ) {
    return "bg-green-700 text-white hover:bg-green-800";
  }

  return "border border-slate-300 bg-white text-slate-700 hover:border-green-700 hover:text-green-700";
}

export default function ContaPage() {
  const router = useRouter();

  const [utilizador, setUtilizador] = useState<Utilizador | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [aCarregar, setACarregar] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [devolucaoAbertaId, setDevolucaoAbertaId] = useState<string | null>(
    null
  );
  const [motivoDevolucao, setMotivoDevolucao] = useState("Produto errado");
  const [detalhesDevolucao, setDetalhesDevolucao] = useState("");
  const [aEnviarDevolucao, setAEnviarDevolucao] = useState(false);

  useEffect(() => {
    carregarConta();
  }, []);

  async function carregarConta() {
    setACarregar(true);
    setErro("");

    try {
      const {
        data: { user },
        error: erroUtilizador,
      } = await supabase.auth.getUser();

      if (erroUtilizador) {
        setErro(`Erro ao carregar sessão: ${erroUtilizador.message}`);
        setACarregar(false);
        return;
      }

      if (!user) {
        setACarregar(false);
        router.replace("/entrar");
        return;
      }

      const utilizadorAtual: Utilizador = {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      };

      setUtilizador(utilizadorAtual);

      const perfilBase = {
        id: user.id,
        nome: user.user_metadata?.nome || "",
        telefone: "",
        tipo_cliente: "Particular",
        empresa: "",
        nif: "",
        morada: "",
        codigo_postal: "",
        localidade: "",
      };

      const { data: perfilExistente, error: erroPerfil } = await supabase
        .from("profiles")
        .select(
          `
          id,
          nome,
          telefone,
          tipo_cliente,
          empresa,
          nif,
          morada,
          codigo_postal,
          localidade
        `
        )
        .eq("id", user.id)
        .maybeSingle();

      if (erroPerfil) {
        setErro(`Erro ao carregar perfil: ${erroPerfil.message}`);
        setACarregar(false);
        return;
      }

      if (perfilExistente) {
        setPerfil({
          id: perfilExistente.id,
          nome: perfilExistente.nome || user.user_metadata?.nome || "",
          telefone: perfilExistente.telefone || "",
          tipo_cliente: perfilExistente.tipo_cliente || "Particular",
          empresa: perfilExistente.empresa || "",
          nif: perfilExistente.nif || "",
          morada: perfilExistente.morada || "",
          codigo_postal: perfilExistente.codigo_postal || "",
          localidade: perfilExistente.localidade || "",
        });
      } else {
        const { data: perfilCriado, error: erroCriarPerfil } = await supabase
          .from("profiles")
          .upsert(perfilBase, { onConflict: "id" })
          .select(
            `
            id,
            nome,
            telefone,
            tipo_cliente,
            empresa,
            nif,
            morada,
            codigo_postal,
            localidade
          `
          )
          .single();

        if (erroCriarPerfil) {
          setErro(`Erro ao criar perfil: ${erroCriarPerfil.message}`);
          setACarregar(false);
          return;
        }

        setPerfil({
          id: perfilCriado.id,
          nome: perfilCriado.nome || user.user_metadata?.nome || "",
          telefone: perfilCriado.telefone || "",
          tipo_cliente: perfilCriado.tipo_cliente || "Particular",
          empresa: perfilCriado.empresa || "",
          nif: perfilCriado.nif || "",
          morada: perfilCriado.morada || "",
          codigo_postal: perfilCriado.codigo_postal || "",
          localidade: perfilCriado.localidade || "",
        });
      }

      const { data: encomendasGuardadas, error: erroEncomendas } =
        await supabase
          .from("orders")
          .select(
            `
            id,
            created_at,
            status,
            payment_status,
            payment_method,
            payment_preference,
            total_estimated,
            subtotal_products,
            shipping_cost,
            total_amount,
            delivery_preference,
            contact_preference,
            shipping_carrier,
            tracking_code,
            tracking_url,
            shipped_at,
            delivered_at,
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
              reason,
              details,
              status,
              admin_notes,
              requested_at,
              reviewed_at
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

      if (erroEncomendas) {
        setErro(`Erro ao carregar encomendas: ${erroEncomendas.message}`);
        setACarregar(false);
        return;
      }

      const encomendasNormalizadas = (encomendasGuardadas || []).map(
        (encomenda) => ({
          ...encomenda,
          order_items: encomenda.order_items || [],
          return_requests: encomenda.return_requests || [],
        })
      ) as Encomenda[];

      setEncomendas(encomendasNormalizadas);
      setACarregar(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao carregar conta.";

      setErro(`Erro técnico ao carregar conta: ${message}`);
      setACarregar(false);
    }
  }

  async function guardarPerfil(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!perfil || !utilizador) return;

    setAGuardar(true);
    setMensagem("");
    setErro("");

    const erroValidacao = validarPerfilAntesDeGuardar(
      perfil,
      utilizador.email || ""
    );

    if (erroValidacao) {
      setErro(erroValidacao);
      setAGuardar(false);
      return;
    }

    const telefoneNormalizado = normalizarTelefonePT(perfil.telefone);
    const nifNormalizado = perfil.nif.trim() ? apenasDigitos(perfil.nif) : "";

    const { error } = await supabase.from("profiles").upsert(
      {
        id: utilizador.id,
        nome: perfil.nome.trim(),
        telefone: telefoneNormalizado,
        tipo_cliente: perfil.tipo_cliente,
        empresa:
          perfil.tipo_cliente === "Empresa" ? perfil.empresa.trim() : "",
        nif: nifNormalizado,
        morada: perfil.morada.trim(),
        codigo_postal: perfil.codigo_postal.trim(),
        localidade: perfil.localidade.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    setAGuardar(false);

    if (error) {
      setErro(`Não foi possível guardar os dados: ${error.message}`);
      return;
    }

    setPerfil({
      ...perfil,
      nome: perfil.nome.trim(),
      telefone: telefoneNormalizado,
      empresa: perfil.tipo_cliente === "Empresa" ? perfil.empresa.trim() : "",
      nif: nifNormalizado,
      morada: perfil.morada.trim(),
      codigo_postal: perfil.codigo_postal.trim(),
      localidade: perfil.localidade.trim(),
    });

    setMensagem("Dados guardados com sucesso.");
  }

  async function enviarEmailDevolucaoCriada(returnRequestId: string) {
    try {
      const resposta = await fetch("/api/emails/devolucao-criada", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ returnRequestId }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        console.warn("Email de devolução criada não enviado:", resultado);
      }
    } catch (error) {
      console.warn("Erro ao chamar email de devolução criada:", error);
    }
  }

  async function pedirDevolucao(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!utilizador || !devolucaoAbertaId) return;

    setAEnviarDevolucao(true);
    setMensagem("");
    setErro("");

    const encomenda = encomendas.find((item) => item.id === devolucaoAbertaId);

    if (!encomenda) {
      setErro("Encomenda não encontrada.");
      setAEnviarDevolucao(false);
      return;
    }

    if (normalizarEstado(encomenda.status) !== "Entregue") {
      setErro("Só é possível pedir devolução de encomendas entregues.");
      setAEnviarDevolucao(false);
      return;
    }

    if ((encomenda.return_requests || []).length > 0) {
      setErro("Já existe um pedido de devolução para esta encomenda.");
      setAEnviarDevolucao(false);
      return;
    }

    const { data: pedidoCriado, error: erroPedido } = await supabase
      .from("return_requests")
      .insert({
        order_id: encomenda.id,
        user_id: utilizador.id,
        reason: motivoDevolucao,
        details: detalhesDevolucao.trim() || null,
        status: "Solicitada",
      })
      .select("id")
      .single();

    if (erroPedido) {
      setErro(`Não foi possível pedir devolução: ${erroPedido.message}`);
      setAEnviarDevolucao(false);
      return;
    }

    const { error: erroEstado } = await supabase
      .from("orders")
      .update({
        status: "Devolução solicitada",
      })
      .eq("id", encomenda.id)
      .eq("user_id", utilizador.id);

    if (erroEstado) {
      setErro(
        `O pedido foi criado, mas houve erro ao atualizar a encomenda: ${erroEstado.message}`
      );
      setAEnviarDevolucao(false);
      return;
    }

    if (pedidoCriado?.id) {
      await enviarEmailDevolucaoCriada(pedidoCriado.id);
    }

    setMensagem("Pedido de devolução enviado com sucesso.");
    setDevolucaoAbertaId(null);
    setMotivoDevolucao("Produto errado");
    setDetalhesDevolucao("");

    await carregarConta();

    setAEnviarDevolucao(false);
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

  function repetirEncomenda(encomenda: Encomenda) {
    const carrinhoAtual = (encomenda.order_items || []).map((item) => ({
      id: item.product_id,
      quantidade: item.quantity,
    }));

    localStorage.setItem("carrinho", JSON.stringify(carrinhoAtual));
    window.dispatchEvent(new Event("storage"));

    router.push("/carrinho");
  }

  function indiceEstadoAtual(status: string) {
    return estadosProgresso.indexOf(normalizarEstado(status));
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

  function EstadoEncomenda({ status }: { status: string }) {
    const estadoNormalizado = normalizarEstado(status);

    if (estadoNormalizado === "Cancelado") {
      return (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-black text-red-700">
            Encomenda cancelada
          </p>
          <p className="mt-1 text-sm text-red-600">
            Esta encomenda foi marcada como cancelada.
          </p>
        </div>
      );
    }

    if (estadoNormalizado === "Devolução solicitada") {
      return (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-black text-amber-800">
            Devolução solicitada
          </p>
          <p className="mt-1 text-sm text-amber-700">
            O pedido de devolução foi registado e será analisado pela equipa.
          </p>
        </div>
      );
    }

    if (estadoNormalizado === "Devolvido") {
      return (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-100 p-4">
          <p className="text-sm font-black text-slate-800">
            Encomenda devolvida
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Esta encomenda foi marcada como devolvida.
          </p>
        </div>
      );
    }

    const ativo = indiceEstadoAtual(status);

    return (
      <div className="mt-5 rounded-2xl bg-white p-4">
        <p className="text-sm font-black text-slate-900">
          Estado da encomenda
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-6">
          {estadosProgresso.map((estado, index) => {
            const concluido = ativo >= 0 && index <= ativo;
            const atual = ativo >= 0 && index === ativo;

            return (
              <div key={estado} className="flex items-center gap-3 md:block">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    concluido
                      ? "bg-green-700 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="md:mt-2">
                  <p
                    className={`text-xs font-bold leading-4 ${
                      atual
                        ? "text-green-700"
                        : concluido
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {estado}
                  </p>

                  {atual && (
                    <p className="mt-1 text-xs text-slate-500">
                      Estado atual
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (aCarregar) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A carregar conta...
          </p>
        </section>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-red-700">{erro}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Tentar novamente
          </button>
        </section>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-red-700">
            Não foi possível carregar os dados da conta.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
              Área de cliente
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              A minha conta
            </h1>

            <p className="mt-4 max-w-2xl text-slate-600">
              Guarde os seus dados, consulte encomendas anteriores e acompanhe
              aprovações, pagamentos, envios e devoluções.
            </p>
          </div>

          <button
            onClick={terminarSessao}
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-500 hover:text-red-600"
          >
            Terminar sessão
          </button>
        </div>

        {erro && (
          <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {erro}
          </p>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_420px]">
          <form
            onSubmit={guardarPerfil}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Dados pessoais
            </p>

            <h2 className="mt-4 text-2xl font-black">Informação da conta</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Nome completo
                <input
                  value={perfil.nome}
                  onChange={(event) =>
                    setPerfil({ ...perfil, nome: event.target.value })
                  }
                  placeholder="Nome completo"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                />
              </label>

              <label className="text-sm font-semibold">
                Email
                <input
                  value={utilizador?.email || ""}
                  disabled
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 font-normal text-slate-500"
                />
              </label>

              <label className="text-sm font-semibold">
                Telefone
                <input
                  value={perfil.telefone}
                  onChange={(event) =>
                    setPerfil({
                      ...perfil,
                      telefone: event.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="912345678"
                  inputMode="numeric"
                  maxLength={9}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                />
              </label>

              <label className="text-sm font-semibold">
                Tipo de cliente
                <select
                  value={perfil.tipo_cliente}
                  onChange={(event) =>
                    setPerfil({ ...perfil, tipo_cliente: event.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                >
                  <option value="Particular">Particular</option>
                  <option value="Empresa">Empresa</option>
                </select>
              </label>

              {perfil.tipo_cliente === "Empresa" && (
                <label className="text-sm font-semibold sm:col-span-2">
                  Nome da empresa
                  <input
                    value={perfil.empresa}
                    onChange={(event) =>
                      setPerfil({ ...perfil, empresa: event.target.value })
                    }
                    placeholder="Ex.: Empresa, Lda."
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                  />
                </label>
              )}

              <label className="text-sm font-semibold">
                NIF
                <input
                  value={perfil.nif}
                  onChange={(event) =>
                    setPerfil({
                      ...perfil,
                      nif: event.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="Opcional"
                  inputMode="numeric"
                  maxLength={9}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                />
              </label>

              <label className="text-sm font-semibold sm:col-span-2">
                Morada
                <input
                  value={perfil.morada}
                  onChange={(event) =>
                    setPerfil({ ...perfil, morada: event.target.value })
                  }
                  placeholder="Rua, número, andar..."
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                />
              </label>

              <label className="text-sm font-semibold">
                Código postal
                <input
                  value={perfil.codigo_postal}
                  onChange={(event) =>
                    setPerfil({
                      ...perfil,
                      codigo_postal: event.target.value,
                    })
                  }
                  placeholder="0000-000"
                  maxLength={8}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                />
              </label>

              <label className="text-sm font-semibold">
                Localidade
                <input
                  value={perfil.localidade}
                  onChange={(event) =>
                    setPerfil({ ...perfil, localidade: event.target.value })
                  }
                  placeholder="Ex.: Lisboa"
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                />
              </label>
            </div>

            {mensagem && (
              <p className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">
                {mensagem}
              </p>
            )}

            <button
              type="submit"
              disabled={aGuardar}
              className="mt-6 w-full rounded-full bg-green-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {aGuardar ? "A guardar..." : "Guardar dados"}
            </button>
          </form>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Segurança
              </p>

              <h2 className="mt-4 text-2xl font-black">Sessão ativa</h2>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Está autenticado com o email:
              </p>

              <p className="mt-2 break-words text-sm font-bold text-slate-900">
                {utilizador?.email}
              </p>
            </section>
          </aside>
        </div>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
                Encomendas
              </p>

              <h2 className="mt-4 text-2xl font-black">
                Histórico de encomendas
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Consulte os pedidos feitos através do checkout, acompanhe a
                aprovação, pagamento, envio e devoluções.
              </p>
            </div>

            <a
              href="/produtos"
              className="rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Fazer nova encomenda
            </a>
          </div>

          {encomendas.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <h3 className="text-xl font-black">Ainda não há encomendas.</h3>

              <p className="mt-2 text-sm text-slate-500">
                Quando submeter uma encomenda com sessão iniciada, ela aparece
                aqui.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {encomendas.map((encomenda) => {
                const statusNormalizado = normalizarEstado(encomenda.status);
                const total =
                  encomenda.total_amount || encomenda.total_estimated || 0;
                const portesSobConsulta =
                  encomenda.shipping_cost === null ||
                  encomenda.shipping_cost === undefined;
                const temTracking =
                  encomenda.shipping_carrier ||
                  encomenda.tracking_code ||
                  encomenda.tracking_url ||
                  encomenda.shipped_at ||
                  encomenda.delivered_at;
                const pedidoDevolucao = encomenda.return_requests?.[0];
                const podePedirDevolucao =
                  statusNormalizado === "Entregue" && !pedidoDevolucao;
                const formularioAberto = devolucaoAbertaId === encomenda.id;
                const mensagemEstado = obterMensagemEstado(encomenda);

                return (
                  <article
                    key={encomenda.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                            {statusNormalizado}
                          </p>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${corEstadoPagamento(
                              encomenda.payment_status
                            )}`}
                          >
                            Pagamento:{" "}
                            {encomenda.payment_status || "Pendente"}
                          </span>

                          {statusNormalizado === "A aguardar aprovação" && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                              Aguarda validação
                            </span>
                          )}

                          {statusNormalizado ===
                            "Aprovada - aguarda pagamento" && (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                              Pode pagar
                            </span>
                          )}

                          {statusNormalizado === "Em preparação" && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                              Preparação em curso
                            </span>
                          )}

                          {portesSobConsulta && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                              Portes sob consulta
                            </span>
                          )}

                          {encomenda.shipped_at && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                              Enviada
                            </span>
                          )}

                          {encomenda.delivered_at && (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                              Entregue
                            </span>
                          )}

                          {pedidoDevolucao && (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${corEstadoDevolucao(
                                pedidoDevolucao.status
                              )}`}
                            >
                              Devolução: {pedidoDevolucao.status}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 text-lg font-black">
                          Encomenda de {formatarData(encomenda.created_at)}
                        </h3>

                        <p className="mt-2 break-all text-xs text-slate-500">
                          Nº interno: {encomenda.id}
                        </p>

                        <div
                          className={`mt-4 rounded-2xl border p-4 ${mensagemEstado.classe}`}
                        >
                          <p className="text-sm font-black">
                            {mensagemEstado.titulo}
                          </p>
                          <p className="mt-1 text-sm leading-6">
                            {mensagemEstado.texto}
                          </p>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
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
                            {encomenda.payment_preference ||
                              obterTituloMetodoPagamento(
                                encomenda.payment_method
                              )}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              Contacto:
                            </span>{" "}
                            {encomenda.contact_preference}
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
                            {portesSobConsulta
                              ? "Sob consulta"
                              : encomenda.shipping_cost === 0
                              ? "Grátis"
                              : formatarPreco(encomenda.shipping_cost)}
                          </p>

                          <p>
                            <span className="font-bold text-slate-900">
                              {portesSobConsulta
                                ? "Total estimado:"
                                : "Total final:"}
                            </span>{" "}
                            {portesSobConsulta
                              ? `${formatarPreco(
                                  encomenda.subtotal_products
                                )} + portes sob consulta`
                              : formatarPreco(total)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 lg:justify-end">
                        <a
                          href={obterLinkPrincipal(encomenda)}
                          className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${obterClasseBotaoPrincipal(
                            encomenda
                          )}`}
                        >
                          {obterTextoBotaoPrincipal(encomenda)}
                        </a>

                        {encomenda.tracking_url && (
                          <a
                            href={encomenda.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
                          >
                            Acompanhar envio
                          </a>
                        )}

                        {podePedirDevolucao && (
                          <button
                            type="button"
                            onClick={() => {
                              setDevolucaoAbertaId(
                                formularioAberto ? null : encomenda.id
                              );
                              setMotivoDevolucao("Produto errado");
                              setDetalhesDevolucao("");
                            }}
                            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-amber-600 hover:text-amber-700"
                          >
                            {formularioAberto
                              ? "Fechar devolução"
                              : "Pedir devolução"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => repetirEncomenda(encomenda)}
                          className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
                        >
                          Repetir encomenda
                        </button>
                      </div>
                    </div>

                    <EstadoEncomenda status={encomenda.status} />

                    {pedidoDevolucao && (
                      <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-black">Pedido de devolução</p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <p>
                            <span className="font-bold">Estado:</span>{" "}
                            {pedidoDevolucao.status}
                          </p>

                          <p>
                            <span className="font-bold">Pedido em:</span>{" "}
                            {formatarData(pedidoDevolucao.requested_at)}
                          </p>

                          <p>
                            <span className="font-bold">Motivo:</span>{" "}
                            {pedidoDevolucao.reason}
                          </p>

                          <p>
                            <span className="font-bold">Analisado em:</span>{" "}
                            {formatarData(pedidoDevolucao.reviewed_at)}
                          </p>
                        </div>

                        {pedidoDevolucao.details && (
                          <p className="mt-3">
                            <span className="font-bold">Descrição:</span>{" "}
                            {pedidoDevolucao.details}
                          </p>
                        )}

                        {pedidoDevolucao.admin_notes && (
                          <p className="mt-3">
                            <span className="font-bold">Resposta:</span>{" "}
                            {pedidoDevolucao.admin_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {formularioAberto && (
                      <form
                        onSubmit={pedirDevolucao}
                        className="mt-5 rounded-2xl border border-amber-200 bg-white p-5"
                      >
                        <p className="text-sm font-black text-slate-900">
                          Pedido de devolução
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Explique o motivo da devolução. O pedido ficará em
                          análise pela equipa.
                        </p>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <label className="text-sm font-semibold">
                            Motivo
                            <select
                              value={motivoDevolucao}
                              onChange={(event) =>
                                setMotivoDevolucao(event.target.value)
                              }
                              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                            >
                              {motivosDevolucao.map((motivo) => (
                                <option key={motivo} value={motivo}>
                                  {motivo}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="text-sm font-semibold sm:col-span-2">
                            Descrição
                            <textarea
                              value={detalhesDevolucao}
                              onChange={(event) =>
                                setDetalhesDevolucao(event.target.value)
                              }
                              rows={4}
                              placeholder="Explique o que aconteceu..."
                              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
                            />
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={aEnviarDevolucao}
                          className="mt-5 rounded-full bg-amber-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          {aEnviarDevolucao
                            ? "A enviar pedido..."
                            : "Enviar pedido de devolução"}
                        </button>
                      </form>
                    )}

                    {temTracking && (
                      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                        <p className="font-black">Dados de envio</p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <p>
                            <span className="font-bold">Transportadora:</span>{" "}
                            {encomenda.shipping_carrier || "Não indicada"}
                          </p>

                          <p>
                            <span className="font-bold">
                              Código de tracking:
                            </span>{" "}
                            {encomenda.tracking_code || "Não indicado"}
                          </p>

                          <p>
                            <span className="font-bold">Enviada em:</span>{" "}
                            {formatarData(encomenda.shipped_at)}
                          </p>

                          <p>
                            <span className="font-bold">Entregue em:</span>{" "}
                            {formatarData(encomenda.delivered_at)}
                          </p>
                        </div>

                        {encomenda.tracking_url && (
                          <a
                            href={encomenda.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex rounded-full bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
                          >
                            Abrir acompanhamento
                          </a>
                        )}
                      </div>
                    )}

                    <div className="mt-5 space-y-3">
                      {(encomenda.order_items || []).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-white p-4 text-sm text-slate-600"
                        >
                          <p className="font-bold text-slate-900">
                            {item.quantity}x {item.product_name}
                          </p>

                          <p className="mt-1">
                            Ref.: {item.product_reference || "Sem referência"} ·
                            Marca: {item.product_brand || "Sem marca"}
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            {item.price_text || "Sob consulta"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}