"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
  orders: {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    status: string;
    payment_status: string | null;
    total_amount: number | null;
    total_estimated: number | null;
    created_at: string;
  } | null;
};

const estadosDevolucao = [
  "Todos",
  "Solicitada",
  "Em análise",
  "Aprovada",
  "Rejeitada",
  "Concluída",
];

function obterEmailsAdmin() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export default function AdminDevolucoesPage() {
  const router = useRouter();

  const [emailUtilizador, setEmailUtilizador] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [aCarregar, setACarregar] = useState(true);
  const [pedidos, setPedidos] = useState<PedidoDevolucao[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const correspondeEstado =
      filtroEstado === "Todos" || pedido.status === filtroEstado;

    const termo = pesquisa.trim().toLowerCase();

    const textoPesquisa = [
      pedido.id,
      pedido.order_id,
      pedido.reason,
      pedido.details,
      pedido.status,
      pedido.admin_notes,
      pedido.orders?.customer_name,
      pedido.orders?.customer_email,
      pedido.orders?.customer_phone,
      pedido.orders?.status,
      pedido.orders?.payment_status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const correspondePesquisa = !termo || textoPesquisa.includes(termo);

    return correspondeEstado && correspondePesquisa;
  });

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
      await carregarPedidos();
      setACarregar(false);
    }

    carregarPagina();
  }, [router]);

  async function carregarPedidos() {
    setErro("");

    const { data, error } = await supabase
      .from("return_requests")
      .select(
        `
        id,
        order_id,
        user_id,
        reason,
        details,
        status,
        admin_notes,
        requested_at,
        reviewed_at,
        orders (
          id,
          customer_name,
          customer_email,
          customer_phone,
          status,
          payment_status,
          total_amount,
          total_estimated,
          created_at
        )
      `
      )
      .order("requested_at", { ascending: false });

    if (error) {
  setErro(`Erro ao carregar devoluções: ${error.message}`);
  return;
}

const pedidosNormalizados = (data || []).map((pedido: any) => ({
  ...pedido,
  orders: Array.isArray(pedido.orders) ? pedido.orders[0] || null : pedido.orders,
}));

setPedidos(pedidosNormalizados as PedidoDevolucao[]);
  }

  function atualizarPedidoLocal(
    pedidoId: string,
    campo: keyof PedidoDevolucao,
    valor: string | null
  ) {
    setPedidos((atuais) =>
      atuais.map((pedido) =>
        pedido.id === pedidoId
          ? {
              ...pedido,
              [campo]: valor,
            }
          : pedido
      )
    );
  }

  async function guardarPedido(pedido: PedidoDevolucao) {
    setMensagem("");
    setErro("");

    const agora = new Date().toISOString();
    const reviewedAtAtualizado =
      pedido.status === "Solicitada" ? pedido.reviewed_at : pedido.reviewed_at || agora;

    const { error: erroPedido } = await supabase
      .from("return_requests")
      .update({
        status: pedido.status,
        admin_notes: pedido.admin_notes || null,
        reviewed_at: reviewedAtAtualizado,
      })
      .eq("id", pedido.id);

    if (erroPedido) {
      setErro(`Não foi possível guardar a devolução: ${erroPedido.message}`);
      return;
    }

    let novoEstadoEncomenda = pedido.orders?.status || "Devolução solicitada";
    let novoEstadoPagamento = pedido.orders?.payment_status || "Pago";

    if (pedido.status === "Em análise" || pedido.status === "Aprovada") {
      novoEstadoEncomenda = "Devolução solicitada";
    }

    if (pedido.status === "Rejeitada") {
      novoEstadoEncomenda = "Entregue";
    }

    if (pedido.status === "Concluída") {
      novoEstadoEncomenda = "Devolvido";
      novoEstadoPagamento = "Reembolsado";
    }

    const { error: erroEncomenda } = await supabase
      .from("orders")
      .update({
        status: novoEstadoEncomenda,
        payment_status: novoEstadoPagamento,
      })
      .eq("id", pedido.order_id);

    if (erroEncomenda) {
      setErro(
        `A devolução foi guardada, mas houve erro ao atualizar a encomenda: ${erroEncomenda.message}`
      );
      return;
    }

    setPedidos((atuais) =>
      atuais.map((item) =>
        item.id === pedido.id
          ? {
              ...pedido,
              reviewed_at: reviewedAtAtualizado,
              orders: pedido.orders
                ? {
                    ...pedido.orders,
                    status: novoEstadoEncomenda,
                    payment_status: novoEstadoPagamento,
                  }
                : pedido.orders,
            }
          : item
      )
    );

    setMensagem("Pedido de devolução atualizado com sucesso.");
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

  function corEstadoDevolucao(status: string) {
    if (status === "Solicitada") return "bg-amber-50 text-amber-700";
    if (status === "Em análise") return "bg-blue-50 text-blue-700";
    if (status === "Aprovada") return "bg-green-50 text-green-700";
    if (status === "Rejeitada") return "bg-red-50 text-red-700";
    if (status === "Concluída") return "bg-slate-100 text-slate-700";

    return "bg-slate-100 text-slate-500";
  }

  function contarPorEstado(estado: string) {
    if (estado === "Todos") return pedidos.length;
    return pedidos.filter((pedido) => pedido.status === estado).length;
  }

  function limparFiltros() {
    setPesquisa("");
    setFiltroEstado("Todos");
  }

  if (aCarregar) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A carregar devoluções...
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
            não está autorizado a aceder à gestão de devoluções.
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
              Devoluções
            </h1>

            <p className="mt-4 max-w-2xl text-slate-600">
              Consulte, filtre e atualize pedidos de devolução feitos pelos
              clientes.
            </p>
          </div>

          <button
            onClick={carregarPedidos}
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
          >
            Atualizar
          </button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-5">
          {estadosDevolucao.map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => setFiltroEstado(estado)}
              className={`rounded-3xl border p-5 text-left shadow-sm transition ${
                filtroEstado === estado
                  ? "border-green-700 bg-green-50"
                  : "border-slate-200 bg-white hover:border-green-300"
              }`}
            >
              <p className="text-sm font-bold text-slate-500">{estado}</p>
              <p className="mt-3 text-4xl font-black">
                {contarPorEstado(estado)}
              </p>
            </button>
          ))}
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

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <label className="text-sm font-semibold">
              Pesquisar devolução
              <input
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                placeholder="Cliente, email, motivo, estado, nº encomenda..."
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-green-700"
              />
            </label>

            <button
              type="button"
              onClick={limparFiltros}
              className="self-end rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
            >
              Limpar filtros
            </button>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            A mostrar{" "}
            <span className="font-bold text-slate-900">
              {pedidosFiltrados.length}
            </span>{" "}
            de <span className="font-bold text-slate-900">{pedidos.length}</span>{" "}
            pedidos.
          </p>
        </section>

        <section className="mt-8">
          {pedidosFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-black">
                Não há pedidos de devolução com estes filtros.
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                Tenta limpar os filtros ou escolher outro estado.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {pedidosFiltrados.map((pedido) => (
                <article
                  key={pedido.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${corEstadoDevolucao(
                            pedido.status
                          )}`}
                        >
                          {pedido.status}
                        </span>

                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                          Pedido em {formatarData(pedido.requested_at)}
                        </p>
                      </div>

                      <h2 className="mt-3 text-2xl font-black">
                        {pedido.orders?.customer_name || "Cliente sem nome"}
                      </h2>

                      <p className="mt-2 break-all text-xs text-slate-500">
                        Pedido: {pedido.id}
                      </p>

                      <p className="mt-1 break-all text-xs text-slate-500">
                        Encomenda: {pedido.order_id}
                      </p>

                      <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <p>
                          <span className="font-bold text-slate-900">
                            Email:
                          </span>{" "}
                          {pedido.orders?.customer_email || "Não indicado"}
                        </p>

                        <p>
                          <span className="font-bold text-slate-900">
                            Telefone:
                          </span>{" "}
                          {pedido.orders?.customer_phone || "Não indicado"}
                        </p>

                        <p>
                          <span className="font-bold text-slate-900">
                            Estado encomenda:
                          </span>{" "}
                          {pedido.orders?.status || "Não indicado"}
                        </p>

                        <p>
                          <span className="font-bold text-slate-900">
                            Pagamento:
                          </span>{" "}
                          {pedido.orders?.payment_status || "Não indicado"}
                        </p>

                        <p>
                          <span className="font-bold text-slate-900">
                            Valor:
                          </span>{" "}
                          {formatarPreco(
                            pedido.orders?.total_amount ||
                              pedido.orders?.total_estimated
                          )}
                        </p>

                        <p>
                          <span className="font-bold text-slate-900">
                            Encomenda criada em:
                          </span>{" "}
                          {formatarData(pedido.orders?.created_at || null)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 lg:justify-end">
                      <a
                        href="/admin"
                        className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
                      >
                        Ver no painel
                      </a>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      <p className="font-black text-slate-900">
                        Informação do cliente
                      </p>

                      <p className="mt-3">
                        <span className="font-bold text-slate-900">
                          Motivo:
                        </span>{" "}
                        {pedido.reason}
                      </p>

                      <p className="mt-3">
                        <span className="font-bold text-slate-900">
                          Descrição:
                        </span>{" "}
                        {pedido.details || "Sem descrição adicional"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                      <p className="font-black">Gestão da devolução</p>

                      <div className="mt-4 grid gap-4">
                        <label className="text-sm font-semibold">
                          Estado
                          <select
                            value={pedido.status}
                            onChange={(event) =>
                              atualizarPedidoLocal(
                                pedido.id,
                                "status",
                                event.target.value
                              )
                            }
                            className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-amber-700"
                          >
                            {estadosDevolucao
                              .filter((estado) => estado !== "Todos")
                              .map((estado) => (
                                <option key={estado} value={estado}>
                                  {estado}
                                </option>
                              ))}
                          </select>
                        </label>

                        <label className="text-sm font-semibold">
                          Nota/resposta ao cliente
                          <textarea
                            value={pedido.admin_notes || ""}
                            onChange={(event) =>
                              atualizarPedidoLocal(
                                pedido.id,
                                "admin_notes",
                                event.target.value
                              )
                            }
                            rows={4}
                            placeholder="Ex.: Pedido aprovado. Entraremos em contacto para organizar a devolução."
                            className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-amber-700"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => guardarPedido(pedido)}
                          className="rounded-full bg-amber-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-800"
                        >
                          Guardar devolução
                        </button>

                        <a
                          href={`/encomenda/${pedido.order_id}/pagamento`}
                          className="rounded-full border border-amber-300 bg-white px-5 py-2.5 text-sm font-bold text-amber-800 transition hover:border-amber-700"
                        >
                          Ver pagamento
                        </a>
                      </div>

                      <p className="mt-4 text-xs leading-5 text-amber-800">
                        Se marcar como “Concluída”, a encomenda passa para
                        “Devolvido” e o pagamento para “Reembolsado”. Se marcar
                        como “Rejeitada”, a encomenda volta a “Entregue”.
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}