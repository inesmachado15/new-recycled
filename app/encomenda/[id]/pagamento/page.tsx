"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

type Encomenda = {
  id: string;
  created_at: string;
  user_id: string | null;
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
  order_items: EncomendaItem[];
};

function normalizarEstado(status: string) {
  if (status === "Pedido recebido") return "A aguardar aprovação";
  if (status === "Pendente de pagamento") return "Aprovada - aguarda pagamento";
  if (status === "Em confirmação") return "Pago";
  if (status === "Confirmado") return "Pago";
  if (status === "Concluído") return "Entregue";

  return status;
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

function obterTituloMetodoPagamento(method: string | null) {
  if (method === "multibanco") return "Referência Multibanco";
  if (method === "mbway") return "MB WAY";
  if (method === "card") return "Cartão de crédito/débito";
  if (method === "apple_pay") return "Apple Pay";
  if (method === "google_pay") return "Google Pay";

  return "Pagamento online";
}

function estadoPermitePagamento(encomenda: Encomenda) {
  const status = normalizarEstado(encomenda.status);

  return (
    status === "Aprovada - aguarda pagamento" ||
    status === "Pago" ||
    encomenda.payment_status === "Pago"
  );
}

export default function PagamentoEncomendaPage() {
  const params = useParams();
  const router = useRouter();

  const encomendaId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [encomenda, setEncomenda] = useState<Encomenda | null>(null);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState("");

  const subtotal = useMemo(() => {
    if (!encomenda) return 0;

    if (typeof encomenda.subtotal_products === "number") {
      return encomenda.subtotal_products;
    }

    return encomenda.order_items.reduce((total, item) => {
      return total + Number(item.unit_price || 0) * item.quantity;
    }, 0);
  }, [encomenda]);

  const totalFinal = useMemo(() => {
    if (!encomenda) return 0;

    if (typeof encomenda.total_amount === "number") {
      return encomenda.total_amount;
    }

    return encomenda.total_estimated || subtotal;
  }, [encomenda, subtotal]);

  const portesSobConsulta =
    encomenda?.shipping_cost === null ||
    encomenda?.shipping_cost === undefined;

  useEffect(() => {
    async function carregarPagamento() {
      if (!encomendaId) {
        setErro("ID da encomenda inválido.");
        setACarregar(false);
        return;
      }

      setACarregar(true);
      setErro("");

      const {
        data: { user },
        error: erroSessao,
      } = await supabase.auth.getUser();

      if (erroSessao) {
        setErro(`Erro ao carregar sessão: ${erroSessao.message}`);
        setACarregar(false);
        return;
      }

      if (!user) {
        setErro("Tem de iniciar sessão para consultar o pagamento.");
        setACarregar(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          user_id,
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
          order_items (
            id,
            product_id,
            product_name,
            product_reference,
            product_brand,
            quantity,
            unit_price,
            price_text
          )
        `
        )
        .eq("id", encomendaId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setErro(`Erro ao carregar pagamento: ${error.message}`);
        setACarregar(false);
        return;
      }

      if (!data) {
        setErro("Pagamento não encontrado.");
        setACarregar(false);
        return;
      }

      setEncomenda({
        ...(data as Encomenda),
        order_items: (data as Encomenda).order_items || [],
      });
      setACarregar(false);
    }

    carregarPagamento();
  }, [encomendaId]);

  async function copiar(texto: string, campo: string) {
    await navigator.clipboard.writeText(texto);
    setCopiado(campo);

    setTimeout(() => {
      setCopiado("");
    }, 1800);
  }

  if (aCarregar) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A carregar pagamento...
          </p>
        </section>
      </main>
    );
  }

  if (erro || !encomenda) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black">Pagamento não encontrado</h1>

          <p className="mt-3 text-sm font-semibold text-red-700">
            {erro || "Não foi possível carregar os dados de pagamento."}
          </p>

          <button
            onClick={() => router.push("/conta")}
            className="mt-5 rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Voltar à conta
          </button>
        </section>
      </main>
    );
  }

  const statusNormalizado = normalizarEstado(encomenda.status);
  const podePagar = estadoPermitePagamento(encomenda);
  const pagamentoPago = encomenda.payment_status === "Pago";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.push("/conta")}
          className="mb-6 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
        >
          Voltar à conta
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Pagamento
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight">
              Encomenda de {formatarData(encomenda.created_at)}
            </h1>

            <p className="mt-2 break-all text-xs text-slate-500">
              Nº interno: {encomenda.id}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                Estado: {statusNormalizado}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  pagamentoPago
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                Pagamento: {encomenda.payment_status || "Pendente"}
              </span>

              {portesSobConsulta && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Portes sob consulta
                </span>
              )}
            </div>

            {!podePagar && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                <p className="text-sm font-black">
                  Ainda não deve efetuar o pagamento.
                </p>

                <p className="mt-2 text-sm leading-6">
                  A encomenda ainda está a aguardar validação. Assim que for
                  aprovada, os dados de pagamento ficam disponíveis.
                </p>
              </div>
            )}

            {podePagar && !pagamentoPago && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
                <p className="text-sm font-black">
                  A encomenda foi aprovada e já pode ser paga.
                </p>

                <p className="mt-2 text-sm leading-6">
                  Depois de efetuar o pagamento, envie o comprovativo para que a
                  equipa possa confirmar a encomenda.
                </p>
              </div>
            )}

            {pagamentoPago && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
                <p className="text-sm font-black">Pagamento confirmado.</p>

                <p className="mt-2 text-sm leading-6">
                  O pagamento desta encomenda já foi confirmado. A encomenda
                  seguirá para preparação/envio.
                </p>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-black">Produtos</h2>

              <div className="mt-4 space-y-3">
                {encomenda.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-black text-slate-900">
                          {item.quantity}x {item.product_name}
                        </p>

                        <p className="mt-1 text-slate-600">
                          Ref.: {item.product_reference || "Sem referência"} ·
                          Marca: {item.product_brand || "Sem marca"}
                        </p>
                      </div>

                      <p className="font-black text-slate-900">
                        {item.price_text ||
                          formatarPreco(
                            Number(item.unit_price || 0) * item.quantity
                          )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
              Dados de pagamento
            </p>

            <h2 className="mt-4 text-2xl font-black">
              {obterTituloMetodoPagamento(encomenda.payment_method)}
            </h2>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
              <p>
                <span className="font-black text-slate-900">Subtotal:</span>{" "}
                {formatarPreco(subtotal)}
              </p>

              <p>
                <span className="font-black text-slate-900">Portes:</span>{" "}
                {portesSobConsulta
                  ? "Sob consulta"
                  : encomenda.shipping_cost === 0
                  ? "Grátis"
                  : formatarPreco(encomenda.shipping_cost)}
              </p>

              <p className="border-t border-slate-200 pt-3 text-lg">
                <span className="font-black text-slate-900">
                  {portesSobConsulta ? "Total estimado:" : "Total a pagar:"}
                </span>{" "}
                <span className="font-black text-green-700">
                  {portesSobConsulta
                    ? `${formatarPreco(subtotal)} + portes`
                    : formatarPreco(totalFinal)}
                </span>
              </p>
            </div>

            {podePagar && !pagamentoPago && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Titular
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-900">
                      New & Recycled
                    </p>

                    <button
                      type="button"
                      onClick={() => copiar("New & Recycled", "titular")}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    IBAN
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="break-all text-sm font-black text-slate-900">
                      PT50 0018 0000 0200 0907 0216 4
                    </p>

                    <button
                      type="button"
                      onClick={() => copiar("PT50 0018 0000 0200 0907 0216 4", "iban")}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    MB WAY
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-900">
                      968120503
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        copiar("968120503", "mbway")
                      }
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Referência
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="break-all text-sm font-black text-slate-900">
                      Encomenda {encomenda.id}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        copiar(`Encomenda ${encomenda.id}`, "referencia")
                      }
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                {copiado && (
                  <p className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">
                    Informação copiada.
                  </p>
                )}

                <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-black">
                    Envie o comprovativo de pagamento para:
                  </p>

                  <a
                    href={`mailto:machado.newrecycle@gmail.com?subject=Comprovativo de pagamento - Encomenda ${encomenda.id}`}
                    className="mt-2 block break-all font-bold underline"
                  >
                    machado.newrecycle@gmail.com
                  </a>
                </div>
              </div>
            )}

            {!podePagar && (
              <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
                Os dados de pagamento ficam disponíveis depois da aprovação da
                encomenda.
              </div>
            )}

            {pagamentoPago && (
              <div className="mt-6 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
                Esta encomenda já está marcada como paga.
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}