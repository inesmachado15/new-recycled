"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type EncomendaItem = {
  id: string;
  product_name: string;
  product_reference: string | null;
  product_brand: string | null;
  quantity: number;
  price_text: string | null;
};

type Encomenda = {
  id: string;
  created_at: string;
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
  payment_provider: string | null;
  payment_entity: string | null;
  payment_reference: string | null;
  payment_expiry: string | null;
  payment_status: string | null;
  status: string;
  subtotal_products: number | null;
  shipping_cost: number | null;
  total_amount: number | null;
  total_estimated: number | null;
  notes: string | null;
  order_items: EncomendaItem[];
};

function formatarPreco(valor: number | null | undefined) {
  return `${Number(valor || 0).toFixed(2).replace(".", ",")}€`;
}

function formatarData(data: string | null | undefined) {
  if (!data) return "Não definido";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

export default function ConfirmacaoEncomendaPage() {
  const params = useParams();
  const id = String(params.id || "");

  const [encomenda, setEncomenda] = useState<Encomenda | null>(null);
  const [aCarregar, setACarregar] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarEncomenda() {
      setACarregar(true);
      setErro("");

      if (!id || id === "undefined") {
        setErro("ID da encomenda inválido.");
        setACarregar(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
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
          payment_provider,
          payment_entity,
          payment_reference,
          payment_expiry,
          payment_status,
          status,
          subtotal_products,
          shipping_cost,
          total_amount,
          total_estimated,
          notes,
          order_items (
            id,
            product_name,
            product_reference,
            product_brand,
            quantity,
            price_text
          )
        `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        setErro(
          `Não foi possível carregar a encomenda: ${
            error?.message || "sem dados"
          }`
        );
        setACarregar(false);
        return;
      }

      setEncomenda(data as Encomenda);
      setACarregar(false);
    }

    carregarEncomenda();
  }, [id]);

  if (aCarregar) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            A carregar confirmação...
          </p>
        </section>
      </main>
    );
  }

  if (erro || !encomenda) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <section className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
            Encomenda
          </p>

          <h1 className="mt-4 text-3xl font-black">
            Não foi possível carregar a encomenda.
          </h1>

          <p className="mt-4 text-sm text-red-600">{erro}</p>

          <a
            href="/produtos"
            className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Voltar aos produtos
          </a>
        </section>
      </main>
    );
  }

  const portesSobConsulta = encomenda.shipping_cost === null;
  const totalVisivel = encomenda.total_amount || encomenda.total_estimated || 0;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-green-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">
            Encomenda submetida
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Encomenda recebida com sucesso.
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
            Recebemos o seu pedido. Assim que o pagamento for confirmado, a encomenda é processada automaticamente e receberá actualizações por email.
          </p>

          <div className="mt-6 grid gap-4 rounded-3xl bg-green-50 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-green-700">Nº de encomenda</p>
              <p className="mt-1 font-black text-green-900">{encomenda.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-green-700">Data</p>
              <p className="mt-1 font-black text-green-900">{formatarData(encomenda.created_at)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-green-700">Estado</p>
              <p className="mt-1 font-black text-green-900">{encomenda.status}</p>
            </div>
          </div>

          {encomenda.status === "A aguardar aprovação" && (
            <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-bold text-amber-900">A encomenda está a ser analisada</p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                A New & Recycled vai analisar o seu pedido e confirmá-lo em breve. Após aprovação, receberá um email com os dados de pagamento.
              </p>
            </div>
          )}

          {/* Dados de pagamento Multibanco */}
          {encomenda.payment_provider === "multibanco" && encomenda.payment_entity && encomenda.payment_reference ? (
            <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5">
              <p className="text-sm font-bold text-green-900">Referência Multibanco gerada</p>
              <p className="mt-1 text-sm text-green-800">Efectue o pagamento em qualquer ATM ou homebanking.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Entidade</p>
                  <p className="mt-1 text-xl font-black text-slate-900">{encomenda.payment_entity}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Referência</p>
                  <p className="mt-1 text-xl font-black text-slate-900">{encomenda.payment_reference}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Valor</p>
                  <p className="mt-1 text-xl font-black text-green-700">{formatarPreco(encomenda.total_amount || encomenda.total_estimated)}</p>
                </div>
              </div>
              {encomenda.payment_expiry && (
                <p className="mt-3 text-xs text-green-700">Válido até: {encomenda.payment_expiry}</p>
              )}
            </div>
          ) : encomenda.payment_provider === "mbway" ? (
            <div className="mt-5 rounded-3xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-sm font-bold text-blue-900">Pedido MB WAY enviado</p>
              <p className="mt-2 text-sm leading-6 text-blue-800">
                Deve receber uma notificação MB WAY no telemóvel em instantes.
                Aceite o pagamento de <strong>{formatarPreco(encomenda.total_amount || encomenda.total_estimated)}</strong> para confirmar a encomenda automaticamente.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Produtos submetidos</h2>

            <div className="mt-5 grid gap-4">
              {encomenda.order_items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-bold text-slate-900">
                    {item.quantity}x {item.product_name}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    Ref.: {item.product_reference || "Sem referência"}
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
          </section>

          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Resumo</h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Produtos</span>
                <span className="font-bold text-slate-900">
                  {formatarPreco(encomenda.subtotal_products)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Portes</span>
                <span className="font-bold text-slate-900">
                  {portesSobConsulta
                    ? "Sob consulta"
                    : encomenda.shipping_cost === 0
                    ? "Grátis"
                    : formatarPreco(encomenda.shipping_cost)}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                <span className="font-bold">Total estimado</span>
                <span className="font-black">
                  {portesSobConsulta
                    ? `${formatarPreco(
                        encomenda.subtotal_products
                      )} + portes sob consulta`
                    : formatarPreco(totalVisivel)}
                </span>
              </div>
            </div>

            <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
              Os portes são de 3,75€ ou grátis em compras iguais ou superiores a 60€.
            </p>

            <a
              href="/conta"
              className="mt-6 flex w-full justify-center rounded-full bg-green-700 px-6 py-4 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Ir para a minha conta
            </a>

            <a
              href="/produtos"
              className="mt-3 flex w-full justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-green-700 hover:text-green-700"
            >
              Continuar a ver produtos
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}